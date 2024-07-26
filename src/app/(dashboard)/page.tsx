import type { Metadata } from 'next';

import DashboardShell from './_components/DashboardShell';
import { defaultMetadata } from '@/components/RootLayout';

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
