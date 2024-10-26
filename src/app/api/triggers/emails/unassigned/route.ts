import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import UnassignedEmail from '@/emails/Unassigned';

/**
 * Email assigned faculties that they are assigned for an event.
 *
 * @param req - { event: Tables<'events'>; emails: string[] }
 */
export async function POST(req: NextRequest) {
  const { runId, event, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  const run = await runs.retrieve(runId);
  if (!run || !run.isExecuting) {
    return new Response('Invalid request', { status: 400 });
  }

  // send email to subscribed users
  const { error } = await resend.batch.send(
    emails.map((email: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: email,
      subject: `You have been unassigned from ${event.title}.`,
      react: UnassignedEmail({ event }),
    })),
  );

  if (error) {
    return new Response(error.message, {
      status: 400,
    });
  }

  return new Response('Emails sent successfully', { status: 200 });
}
