import { logger, task, envvars } from '@trigger.dev/sdk/v3';

import { Resend } from 'resend';
import { createBrowserClient } from '@/utils/supabase/client';
import { EmailTemplate } from '@/trigger/components/Email';

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
    // supabase client
    const supaUrl = await envvars.retrieve('SUPABASE_URL');
    const supaKey = await envvars.retrieve('SUPABASE_ANON_KEY');
    const supabase = createBrowserClient(supaUrl.value, supaKey.value);

    // fetch faculty emails
    const { data: users, error } = await supabase
      .from('users')
      .select('email')
      .in('id', payload.ids);

    if (error) {
      logger.error('Error fetching faculty emails', error);
      return;
    }

    // get event id
    const { data: eventId } = await supabase
      .from('events')
      .select('id')
      .eq('name', payload.event)
      .limit(1)
      .single();

    if (!eventId) {
      logger.error('Error fetching event id');
      return;
    }

    // get resend env
    const resendApi = await envvars.retrieve('RESEND_API');
    const resend = new Resend(resendApi.value);

    // send email to assigned faculties
    const { data: resendResponse, error: resendError } =
      await resend.batch.send(
        users.map((faculty) => ({
          from: 'ProCESO <noreply@mail.deuz.tech>',
          to: faculty.email,
          subject: 'You have been delegated for an event: ' + payload.event,
          react: EmailTemplate({
            eventId: eventId.id,
            eventName: payload.event,
          }),
        })),
      );

    if (resendError) {
      logger.error('Error sending email to assigned faculties');
      // logger wont accept custom types
      logger.error(resendError.name + ' - ' + resendError.message);
    }

    return resendResponse;
  },
});
