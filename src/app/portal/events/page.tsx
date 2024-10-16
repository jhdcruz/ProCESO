import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { EventsShell } from './_components/EventsShell';

export const metadata: Metadata = {
  title: 'Events - ' + defaultMetadata.title,
};

export default function EventsPage() {
  return <EventsShell />;
}
