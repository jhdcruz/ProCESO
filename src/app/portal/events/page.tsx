import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import EventsShell from './_components/EventsShell';
import { getCurrentUser } from '@/libs/supabase/api/user';

export const metadata: Metadata = {
  title: 'Events - ' + defaultMetadata.title,
};

export default async function EventsPage() {
  const currentUser = await getCurrentUser();

  return <EventsShell user={currentUser?.data} />;
}
