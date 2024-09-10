import { logger, task, envvars } from '@trigger.dev/sdk/v3';

import { Resend } from 'resend';
import { EmailTemplate } from '@/trigger/components/Email';
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

    // fetch faculty emails
    const usersQuery = supabase
      .from('users')
      .select('email')
      .in('id', payload.ids);

    // get event id
    const eventQuery = supabase
      .from('events')
      .select('id')
      .eq('title', payload.event)
      .limit(1)
      .maybeSingle();

    const [usersRes, eventRes] = await Promise.all([usersQuery, eventQuery]);

    if (usersRes.error) {
      logger.error('Error:', usersRes.error);
      throw new Error('Error fetching faculty emails');
    }
    if (eventRes.error) {
      logger.error('Error:', eventRes.error);
      throw new Error('Error fetching event ID');
    }

    // get resend env
    const resendApi = await envvars.retrieve('RESEND_API');
    const resend = new Resend(resendApi.value);

    // send email to assigned faculties
    const { data: resendResponse, error: resendError } =
      await resend.batch.send(
        usersRes.data.map((faculty) => ({
          from: 'ProCESO <noreply@mail.deuz.tech>',
          to: faculty.email,
          subject: 'You have been delegated for an event: ' + payload.event,
          react: EmailTemplate({
            eventId: eventRes?.data?.id,
            eventName: payload.event,
          }),
        })),
      );

    if (resendError) {
      // logger wont accept custom types
      logger.error(resendError.name + ' - ' + resendError.message);
      throw new Error('Error sending email to assigned faculties');
    }

    return resendResponse;
  },
});
