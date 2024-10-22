import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import { createAdminClient } from '@/libs/supabase/admin-client';

/**
 * Send reminder email to subscribed users
 * that the event is coming up.
 *
 * @param event - event name.
 * @param id - array of faculty IDs.
 * @param auth - auth cookies.
 */
export const emailReminders = task({
  id: 'email-reminders',
  run: async (payload: { eventId: string; eventTitle: string }) => {
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_SERVICE_KEY');

    // HACK: for RLS policies, we are passing auth cookies,
    // probably a bad thing, emphasis on the 'prbobably'.
    const supabase = createAdminClient();
    let emails: string[] = [];

    logger.info('Getting users and event information...');

    // get faculty emails from faculty_assignment
    const usersQuery = supabase
      .from('events_faculties_view')
      .select('faculty_email')
      .eq('event_id', payload.eventId)
      .not('faculty_email', 'is', null);

    // get event data
    const eventQuery = supabase
      .from('events')
      .select()
      .eq('title', payload.eventTitle)
      .limit(1)
      .single();

    const [usersRes, eventRes] = await Promise.all([usersQuery, eventQuery]);

    // add faculty emails to the emails array
    if (!usersRes.error) {
      emails = usersRes.data.map(
        (user: { faculty_email: string | null }) =>
          user.faculty_email as string,
      );
    } else {
      logger.error(
        usersRes?.error?.message,
        usersRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(usersRes?.error?.message);
    }

    if (eventRes.error) {
      logger.error(
        eventRes?.error?.message,
        eventRes?.error as unknown as Record<string, unknown>,
      );
      throw new Error(eventRes?.error?.message);
    }

    const appUrl = await envvars.retrieve('APP_URL');

    // REFACTOR: Should send emails here instead of the backend
    //           to avoid additional backend requests.
    //           Currently, using resend API here with react as template
    //           throws an error of `Objects are not valid as a React child`.
    const response = await fetch(appUrl.value + '/api/emails/reminders', {
      method: 'POST',
      body: JSON.stringify({
        event: eventRes?.data,
        emails: emails,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.json());
    }

    return response;
  },
});
