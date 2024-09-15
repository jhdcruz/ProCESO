import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Send notification email to assigned faculties that
 * they are delegated for an event.
 *
 * @param event - event name.
 * @param id - array of faculty IDs.
 */
export const emailAssigned = task({
  id: 'email-assigned',
  run: async (payload: { event: string; ids: string[] }) => {
    const supaUrl = await envvars.retrieve('SUPABASE_URL');
    const supaKey = await envvars.retrieve('SUPABASE_ANON_KEY');
    const supabase = createBrowserClient(supaUrl.value, supaKey.value);

    logger.info('Getting users and event information...');
    // fetch faculty emails
    const usersQuery = supabase
      .from('users')
      .select('email')
      .in('id', payload.ids);

    // get event id
    const eventQuery = supabase
      .from('events')
      .select()
      .eq('title', payload.event)
      .limit(1)
      .single();

    const [usersRes, eventRes] = await Promise.all([usersQuery, eventQuery]);

    if (usersRes.error) {
      logger.error('Error:', usersRes.error);
      throw new Error('Error fetching faculty emails');
    }
    if (eventRes.error) {
      logger.error('Error:', eventRes.error);
      throw new Error('Error fetching event ID');
    }

    const appUrl = await envvars.retrieve('APP_URL');

    // REFACTOR: Should send emails here instead of the backend
    //           to avoid additional backend requests.
    //           Currently, using resend API here with react as template
    //           throws an error of `Objects are not valid as a React child`.
    const response = await fetch(appUrl.value + '/api/email/assigned', {
      method: 'POST',
      body: JSON.stringify({
        event: eventRes?.data,
        emails: usersRes?.data?.map((faculty) => faculty.email) ?? [],
      }),
    });

    if (!response.ok) {
      throw new Error(await response.json());
    }

    return response;
  },
});
