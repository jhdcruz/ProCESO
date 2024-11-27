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
export const emailDepts = task({
  id: 'email-depts',
  machine: {
    preset: 'micro',
  },
  run: async (
    payload: {
      activityId: string;
      depts: string[];
    },
    { ctx },
  ) => {
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    // fetch emails for faculty assignment
    const usersQuery = supabase
      .from('users')
      .select('email')
      .eq('active', true)
      .in('department', payload.depts)
      .overlaps('other_roles', ['dean', 'chair'])
      .not('email', 'is', null);

    // fetch emails for faculty info relay
    const committeeQuery = supabase
      .from('users')
      .select('email')
      .eq('active', true)
      .in('department', payload.depts)
      .overlaps('other_roles', ['head'])
      .not('email', 'is', null);

    // get activity id
    const activityQuery = supabase
      .from('activities')
      .select()
      .eq('id', payload.activityId)
      .limit(1)
      .single();

    const [usersRes, committeeRes, activityRes] = await Promise.all([
      usersQuery,
      committeeQuery,
      activityQuery,
    ]);

    if (usersRes.error) {
      logger.error(
        usersRes?.error?.message,
        usersRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(usersRes?.error?.message);
    } else {
      logger.info(
        'Users fetched successfully',
        usersRes.data as unknown as Record<string, unknown>,
      );
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
    const assignment = fetch(
      appUrl.value + '/api/triggers/emails/faculty-request',
      {
        method: 'POST',
        body: JSON.stringify({
          runId: ctx.run.id,
          activity: activityRes?.data,
          emails: usersRes?.data?.map((dept) => dept.email) ?? [],
        }),
      },
    );

    const relay = fetch(appUrl.value + '/api/triggers/emails/activity-notice', {
      method: 'POST',
      body: JSON.stringify({
        runId: ctx.run.id,
        activity: activityRes?.data,
        emails: committeeRes?.data?.map((dept) => dept.email) ?? [],
      }),
    });

    const [assignmentRes, relayRes] = await Promise.all([assignment, relay]);

    if (!assignmentRes.ok) {
      logger.error(
        `${assignmentRes.status}: Failed to send assignment emails`,
        { ...assignmentRes.body },
      );
      throw new Error(
        `${assignmentRes.status}: Failed to send assignment emails`,
      );
    }

    if (!relayRes.ok) {
      logger.error(`${relayRes.status}: Failed to send relay emails`, {
        ...relayRes.body,
      });
      throw new Error(`${relayRes.status}: Failed to send relay emails`);
    }
  },
});
