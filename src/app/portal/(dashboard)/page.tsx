import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import DashboardShell from '@portal/(dashboard)/_components/DashboardShell';

export const metadata: Metadata = {
  title: 'Dashboard - ' + defaultMetadata.title,
};

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export default async function App() {
  return <DashboardShell />;
}
