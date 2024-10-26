import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import ActivityReminder from '@/emails/ActivityReminder';

/**
 * Email assigned faculties that they are assigned for an activity.
 *
 * @param req - { activity: Tables<'activities'>; emails: string[] }
 */
export async function POST(req: NextRequest) {
  const { runId, activity, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  const run = await runs.retrieve(runId);
  if (!run?.isExecuting) {
    return new Response('Invalid request', { status: 400 });
  }

  // send email to subscribed users
  const { error } = await resend.batch.send(
    emails.map((email: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: email,
      subject: `Reminder: ${activity.title} is coming up.`,
      react: ActivityReminder({ activity }),
    })),
  );

  if (error) {
    return new Response(error.message, {
      status: 400,
    });
  }

  return new Response('Emails sent successfully', { status: 200 });
}
