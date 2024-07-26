import type { Metadata } from 'next';
import { defaultMetadata } from '@/components/RootLayout';
import EventShell from './_components/EventShell';

export const metadata: Metadata = {
  title: 'Dashboard - ' + defaultMetadata.title,
};

export default function EventsPage() {
  return (
    <EventShell>
      <div className="container h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
            <p className="text-muted-foreground">
              Overview of the products being sold.
            </p>
          </div>
        </div>
        {/* Main Content */}
        content
      </div>
    </EventShell>
  );
}
