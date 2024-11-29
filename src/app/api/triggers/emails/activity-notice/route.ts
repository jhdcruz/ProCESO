import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import ActivityNotice from '@/emails/ActivityNotice';

/**
 * Email committee heads for an activity.
 *
 * @param req - { activity: Tables<'activities'>; emails: string[] }
 */
export async function POST(req: NextRequest) {
  const { runId, activity, emails } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  const run = await runs.retrieve(runId);
  if (!run?.isExecuting) {
    return new Response('Invalid request', { status: 500 });
  }

  // send email
  const { error } = await resend.batch.send(
    emails.map((email: string) => ({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: email,
      subject: `Conducting an activity entitled: ${activity.title}.`,
      react: ActivityNotice({ activity }),
    })),
  );

  if (error) {
    return new Response(error.message, {
      status: 500,
    });
  }

  return new Response('Emails sent successfully', { status: 500 });
}
