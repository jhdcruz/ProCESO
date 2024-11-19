import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { Calendar } from '@/components/Calendar/Calendar';

export const metadata: Metadata = {
  title: 'Dashboard - ' + defaultMetadata.title,
};

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export default function DashboardPage() {
  return <Calendar />;
}
