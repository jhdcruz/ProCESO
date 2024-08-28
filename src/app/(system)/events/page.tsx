import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { metadata as defaultMetadata } from '@/app/layout';
import EventShell from './_components/EventShell';
import { EventAccordion } from './_components/EventAccordion';
import { createServerClient } from '@/utils/supabase/server';
import { getEvents } from '@/api/supabase/event';
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

  const eventsOngoing = getEvents({
    filter: 'ongoing',
    supabase: supabase,
  });

  const eventsUpcoming = getEvents({
    filter: 'upcoming',
    supabase: supabase,
  });

  const [upcoming, ongoing, assigned] = await Promise.all([
    eventsUpcoming,
    eventsOngoing,
    eventsAssigned,
  ]);

  return (
    <EventShell>
      <EventAccordion
        assigned={assigned}
        ongoing={ongoing}
        role={currentUser?.data?.role ?? 'student'}
        upcoming={upcoming}
      />
    </EventShell>
  );
}
