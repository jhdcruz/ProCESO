import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { EventsShell } from './_components/EventsShell';
import { useUser } from '@/components/Providers/UserProvider';

export const metadata: Metadata = {
  title: 'Events - ' + defaultMetadata.title,
};

export default function EventsPage() {
  return <EventsShell />;
}
