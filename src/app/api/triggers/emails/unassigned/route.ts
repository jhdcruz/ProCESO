import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import FacultyUnassigned from '@/emails/FacultyUnassigned';

/**
 * Email assigned faculties that they are assigned for an activity.
 */
export async function POST(req: NextRequest) {
  const { runId, activity, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  const run = await runs.retrieve(runId);
  if (!run.isExecuting) {
    return new Response('Invalid request', { status: 500 });
  }

  if (emails.length === 0) {
    return new Response('No emails provided', { status: 204 });
  }

  // send email to subscribed users
  const { error } = await resend.batch.send(
    emails.map((email: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: email,
      subject: `You are no longer nominated for ${activity.title}.`,
      react: FacultyUnassigned({ activity }),
    })),
  );

  if (error) {
    return new Response(error.message, {
      status: 500,
    });
  }

  return new Response('Emails sent successfully', { status: 200 });
}
