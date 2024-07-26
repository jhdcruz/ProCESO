import type { Metadata } from 'next';

import DashboardShell from './_components/DashboardShell';
import { metadata as defaultMetadata } from '@/app/layout';

export const metadata: Metadata = {
  title: 'Dashboard - ' + defaultMetadata.title,
};

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export default async function App() {
  return <DashboardShell>Content</DashboardShell>;
}
