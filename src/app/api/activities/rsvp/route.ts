import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import FacultyReject from '@/emails/FacultyReject';
import FacultyAssigned from '@/emails/FacultyAssigned';
import { createServerClient } from '@/libs/supabase/server';

/**
 * Email referrer or staff about faculty assignment response.
 */
export async function POST(req: NextRequest) {
  const { activity, referrer, faculty, rsvp, reason } = await req.json();
  const resend = new Resend(process.env.RESEND_API);

  if (rsvp === null) {
    return new Response('Invalid RSVP response', {
      status: 400,
    });
  }

  if (rsvp) {
    const supabase = await createServerClient(req.cookies);
    // get list of admin/staffs
    const { data, error: dbError } = await supabase
      .from('users')
      .select('email')
      .in('role', ['admin', 'staff']);

    if (dbError) {
      return new Response(dbError.message, {
        status: 500,
      });
    }

    const staffs = data.map(({ email }) => email);

    // send assignment notice to staffs
    const { error } = await resend.emails.send({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: staffs,
      subject: `A faculty member has been assigned for: ${activity.title}`,
      react: FacultyAssigned({ activity, faculty }),
    });

    if (error) {
      return new Response(error.message, {
        status: 500,
      });
    }
  } else {
    // send rejection notice to referrer
    const { error } = await resend.emails.send({
      from: 'Community Extension Services Office <noreply@mail.deuz.tech>',
      to: referrer,
      subject: `A faculty member you nominated will be unavailable for: ${activity.title}`,
      react: FacultyReject({ activity, reason, faculty }),
    });

    if (error) {
      return new Response(error.message, {
        status: 500,
      });
    }
  }

  return new Response('Email sent successfully', { status: 200 });
}
