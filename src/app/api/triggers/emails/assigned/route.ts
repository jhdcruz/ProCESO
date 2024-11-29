import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import FacultyNomination from '@/emails/FacultyNomination';

/**
 * Email assigned faculties that they are assigned for an activity.
 */
export async function POST(req: NextRequest) {
  const { runId, activity, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  const run = await runs.retrieve(runId);
  if (!run?.isExecuting) {
    return new Response('Invalid request', { status: 500 });
  }

  // send email to assigned faculties
  const { error } = await resend.batch.send(
    emails.map((faculty: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: faculty,
      subject: 'You have been nominated for an activity: ' + activity.title,
      react: FacultyNomination({ activity }),
    })),
  );

  if (error) {
    return new Response(error.message, {
      status: 500,
    });
  }

  return new Response('Emails sent successfully', { status: 200 });
}
