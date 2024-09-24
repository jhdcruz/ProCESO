import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import UsersShell from './_components/UsersShell';

export const metadata: Metadata = {
  title: 'Users Management - ' + defaultMetadata.title,
};

export default async function EventsPage() {
  return <UsersShell />;
}
