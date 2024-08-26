import type { Metadata } from 'next';

import { metadata as defaultMetadata } from '@/app/layout';
import EventShell from './_components/EventShell';
import { getEvents } from '@/api/supabase/event';
import { createServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { EventAccordion } from './_components/EventAccordion';
import { getCurrentUser } from '@/api/supabase/user';
import { getFacultyAssignedEvents } from '@/api/supabase/faculty-assignments';

export const metadata: Metadata = {
  title: 'Events - ' + defaultMetadata.title,
};

export default async function EventsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const currentUser = await getCurrentUser(supabase);

  const eventsAssigned = getFacultyAssignedEvents({
    userId: currentUser?.data?.id ?? '',
    supabase: supabase,
  });

  // recently created events
  let eventsRecent;
  if (
    currentUser?.data?.role !== 'admin' &&
    currentUser?.data?.role !== 'staff'
  ) {
    eventsRecent = getEvents({
      filter: 'recent',
      supabase: supabase,
    });
  }

  const eventsOngoing = getEvents({
    filter: 'ongoing',
    supabase: supabase,
  });

  const eventsUpcoming = getEvents({
    filter: 'upcoming',
    supabase: supabase,
  });

  const eventsPast = getEvents({
    filter: 'past',
    supabase: supabase,
  });

  const [upcoming, past, ongoing, recent, assigned] = await Promise.all([
    eventsUpcoming,
    eventsPast,
    eventsOngoing,
    eventsRecent,
    eventsAssigned,
  ]);

  return (
    <EventShell>
      <EventAccordion
        assigned={assigned}
        ongoing={ongoing}
        past={past}
        recent={recent}
        role={currentUser?.data?.role ?? 'student'}
        upcoming={upcoming}
      />
    </EventShell>
  );
}
