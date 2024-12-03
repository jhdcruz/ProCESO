import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import { createAdminClient } from '@/libs/supabase/admin-client';

/**
 * Send notification email to unassigned faculties that
 * they are no longer delegated for an activity.
 *
 * @param activity - activity name.
 * @param id - array of faculty IDs.
 * @param auth - auth cookies.
 */
export const emailUnassigned = task({
  id: 'email-unassigned',
  machine: {
    preset: 'micro',
  },
  run: async (
    payload: {
      activityId: string;
      ids: string[];
    },
    { ctx },
  ) => {
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    if (!payload.ids.length) {
      logger.info('No faculty to send email');
      return;
    }

    logger.info('Getting users and activity information...');
    // fetch faculty emails
    const usersQuery = supabase
      .from('users')
      .select('email')
      .in('id', payload.ids)
      .not('email', 'is', null);

    // get activity id
    const activityQuery = supabase
      .from('activities')
      .select()
      .eq('id', payload.activityId)
      .limit(1)
      .single();

    const [usersRes, activityRes] = await Promise.all([
      usersQuery,
      activityQuery,
    ]);

    if (usersRes.error) {
      logger.error(
        'Failed to get users',
        usersRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(usersRes?.error?.message);
    }
    if (activityRes.error) {
      logger.error(
        'Failed to get activity',
        activityRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(activityRes?.error?.message);
    }

    const appUrl = await envvars.retrieve('APP_URL');

    // REFACTOR: Should send emails here instead of the backend
    //           to avoid additional backend requests.
    //           Currently, using resend API here with react as template
    //           throws an error of `Objects are not valid as a React child`.
    const response = await fetch(
      appUrl.value + '/api/triggers/emails/unassigned',
      {
        method: 'POST',
        body: JSON.stringify({
          runId: ctx.run.id,
          activity: activityRes?.data,
          emails: usersRes?.data?.map((faculty) => faculty.email) ?? [],
        }),
      },
    );

    logger.info('Unassigned email sent', { response });
  },
});
