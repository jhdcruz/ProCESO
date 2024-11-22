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
export const emailCerts = task({
  id: 'email-certs',
  machine: {
    preset: 'micro',
  },
  run: async (payload: { activityId: string }, { ctx }) => {
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');
    const supabase = createAdminClient();

    logger.info('Getting users and activity information...');

    const emailQuery = supabase
      .from('certs')
      .select()
      .eq('activity_id', payload.activityId)
      .not('recipient_email', 'is', null)
      .not('recipient_name', 'is', null)
      .limit(9999);

    // get activity data
    const activityQuery = supabase
      .from('activities')
      .select()
      .eq('id', payload.activityId)
      .limit(1)
      .single();

    const [emails, activity] = await Promise.all([emailQuery, activityQuery]);

    logger.info('Emails', { emails });
    logger.info('Activity', { activity });

    if (emails.error) {
      throw new Error(emails.error.message);
    }
    if (activity.error) {
      throw new Error(activity.error.message);
    }

    const appUrl = await envvars.retrieve('APP_URL');
    const response = await fetch(appUrl.value + '/api/triggers/emails/certs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        runId: ctx.run.id,
        activity: activity?.data,
        recipients: emails.data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? 'Failed to send emails');
    }

    return result;
  },
});
