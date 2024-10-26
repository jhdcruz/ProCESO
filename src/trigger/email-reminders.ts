import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import { createAdminClient } from '@/libs/supabase/admin-client';

/**
 * Send reminder email to subscribed users
 * that the activity is coming up.
 *
 * @param activity - activity name.
 * @param id - array of faculty IDs.
 * @param auth - auth cookies.
 */
export const emailReminders = task({
  id: 'email-reminders',
  run: async (
    payload: { activityId: string; activityTitle: string },
    { ctx },
  ) => {
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');

    // HACK: for RLS policies, we are passing auth cookies,
    // probably a bad thing, emphasis on the 'probably'.
    const supabase = createAdminClient();
    let emails: string[] = [];

    logger.info('Getting users and activity information...');

    // get faculty emails from faculty_assignment
    const usersQuery = supabase
      .from('activities_faculties_view')
      .select('faculty_email')
      .eq('activity_id', payload.activityId)
      .not('faculty_email', 'is', null);

    // get subscriber emails
    const subscribersQuery = supabase
      .from('activities_subscriptions_view')
      .select('subscriber_email')
      .eq('activity_id', payload.activityId)
      .not('subscriber_email', 'is', null);

    // fetch admin/staff emails
    const staffsQuery = supabase
      .from('users')
      .select('email')
      .in('role', ['admin', 'staff'])
      .not('email', 'is', null);

    // get activity data
    const activityQuery = supabase
      .from('activities')
      .select()
      .eq('title', payload.activityTitle)
      .limit(1)
      .single();

    const [usersRes, staffsRes, subscribersRes, activityRes] =
      await Promise.all([
        usersQuery,
        staffsQuery,
        subscribersQuery,
        activityQuery,
      ]);

    // add faculty emails to the emails array
    if (usersRes.error) {
      logger.error(
        usersRes?.error?.message,
        usersRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(usersRes?.error?.message);
    }
    if (staffsRes.error) {
      logger.error(
        staffsRes?.error?.message,
        staffsRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(staffsRes?.error?.message);
    }
    if (subscribersRes.error) {
      logger.error(
        subscribersRes?.error?.message,
        subscribersRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(subscribersRes?.error?.message);
    }
    if (activityRes.error) {
      logger.error(
        activityRes?.error?.message,
        activityRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(activityRes?.error?.message);
    }

    // add emails to the emails array
    emails = [
      ...usersRes.data.map(
        (user: { faculty_email: string | null }) => user.faculty_email!,
      ),
      ...staffsRes.data.map((staff: { email: string }) => staff.email),
      ...subscribersRes.data.map(
        (subscriber: { subscriber_email: string | null }) =>
          subscriber.subscriber_email!,
      ),
    ];

    const appUrl = await envvars.retrieve('APP_URL');

    // REFACTOR: Should send emails here instead of the backend
    //           to avoid additional backend requests.
    //           Currently, using resend API here with react as template
    //           throws an error of `Objects are not valid as a React child`.
    const response = await fetch(appUrl.value + '/api/emails/reminders', {
      method: 'POST',
      body: JSON.stringify({
        runId: ctx.run.id,
        activity: activityRes?.data,
        emails: emails,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.json());
    }

    return response;
  },
});
