import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import { createAdminClient } from '@/libs/supabase/admin-client';

/**
 * Send notification email to assigned faculties that
 * they are delegated for an activity.
 *
 * @param activity - activity name.
 * @param id - array of faculty IDs.
 * @param auth - auth cookies.
 */
export const emailAssigned = task({
  id: 'email-assigned',
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
    // HACK: for RLS policies, we are passing auth cookies,
    // probably a bad thing, probably, I think.
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    logger.info('Getting users and activity information...');
    // fetch faculty emails
    const usersQuery = supabase
      .from('users')
      .select('email')
      .eq('active', true)
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
        usersRes?.error?.message,
        usersRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(usersRes?.error?.message);
    }
    if (activityRes.error) {
      logger.error(
        activityRes?.error?.message,
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
      appUrl.value + '/api/triggers/emails/assigned',
      {
        method: 'POST',
        body: JSON.stringify({
          runId: ctx.run.id,
          activity: activityRes?.data,
          emails: usersRes?.data?.map((faculty) => faculty.email) ?? [],
        }),
      },
    );

    if (!response.ok) {
      logger.error(`${response.status}: Error on email API route`, {
        ...response.body,
      });
      throw new Error(`${response.status}: Error on email API route`);
    }

    return { response };
  },
});
