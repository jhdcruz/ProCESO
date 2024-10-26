import { logger, task, envvars } from '@trigger.dev/sdk/v3';
import { createAdminClient } from '@/libs/supabase/admin-client';

/**
 * Send notification email to assigned faculties that
 * they are delegated for an event.
 *
 * @param event - event name.
 * @param id - array of faculty IDs.
 * @param auth - auth cookies.
 */
export const emailAssigned = task({
  id: 'email-assigned',
  run: async (
    payload: {
      event: string;
      ids: string[];
    },
    { ctx },
  ) => {
    // HACK: for RLS policies, we are passing auth cookies,
    // probably a bad thing, probably, I think.
    await envvars.retrieve('SUPABASE_URL');
    await envvars.retrieve('SUPABASE_ANON_KEY');
    const supabase = createAdminClient();

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
    const response = await fetch(appUrl.value + '/api/emails/assigned', {
      method: 'POST',
      body: JSON.stringify({
        runId: ctx.run.id,
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
