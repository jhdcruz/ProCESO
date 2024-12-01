import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import FacultyRequest from '@/emails/FacultyRequest';

/**
 * Email faculty dean and chairs for faculty assingment for an event.
 *
 * @param req - { activity: Tables<'activities'>; emails: string[] }
 */
export async function POST(req: NextRequest) {
  const { runId, activity, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  const run = await runs.retrieve(runId);
  if (!run?.isExecuting) {
    return new Response('Invalid request', { status: 403 });
  }

  if (emails.length === 0) {
    return new Response('No emails provided', { status: 204 });
  }

  // send email to assigned faculties
  const { error } = await resend.batch.send(
    emails.map((faculty: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: faculty,
      subject:
        'Your department has been selected for an outreach activity: ' +
        activity.title,
      react: FacultyRequest({ activity }),
    })),
  );

  if (error) {
    return new Response(error.message, {
      status: 500,
    });
  }

  return new Response('Emails sent successfully', { status: 200 });
}
