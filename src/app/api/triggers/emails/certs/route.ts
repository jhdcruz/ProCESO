import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import CertEmail from '@/emails/CertEmail';

/**
 * Email certificates to evaluation participants
 *
 * @param req PayloadCerts
 */
export async function POST(req: NextRequest) {
  const { runId, activity, recipients } = await req.json();

  // Validate required fields
  if (!runId || !activity || !recipients?.length) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const run = await runs.retrieve(runId);
  if (!run?.isExecuting) {
    return Response.json(
      { error: 'Invalid run ID or run not executing' },
      { status: 400 },
    );
  }

  // send email to assigned faculties
  const resend = new Resend(process.env.RESEND_API);
  const errors = [];

  for (const recipient of recipients) {
    const { error } = await resend.emails.send({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: recipient.recipient_email,
      subject: 'Thank you for participating in the activity: ' + activity.title,
      react: CertEmail({ activity }),
      attachments: [
        {
          filename: `${recipient.recipient_name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          path: recipient.url as string,
        },
      ],
      headers: {
        'X-Entity-Ref-ID': runId,
      },
    });

    if (error) {
      errors.push({
        recipient: recipient.recipient_email,
        error: error.message,
      });
    }
  }

  if (errors.length > 0) {
    return Response.json(
      { errors },
      {
        status: 400,
      },
    );
  }

  return Response.json(
    { message: 'Emails sent successfully' },
    {
      status: 200,
    },
  );
}
