import AssignedEmail from '@/emails/AssignedEmail';
import { NextRequest } from 'next/server';
import { Resend } from 'resend';

/**
 * Email assigned faculties that they are assigned for an event.
 *
 * @param req - { event: Tables<'events'>; emails: string[] }
 */
export async function POST(req: NextRequest) {
  const { event, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  // send email to assigned faculties
  const { data: resendResponse, error: resendError } = await resend.batch.send(
    emails.map((faculty: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: faculty,
      subject: 'You have been assigned for an event: ' + event.title,
      react: AssignedEmail({ event }),
    })),
  );

  if (resendError) {
    return new Response(resendError.message, {
      status: 400,
    });
  }

  return new Response('Emails sent successfully', { status: 200 });
}
