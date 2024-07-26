import type { Metadata } from 'next';
import { Divider, Text } from '@mantine/core';

import { metadata as defaultMetadata } from '@/app/layout';
import EventShell from './_components/EventShell';
import { sidebarRoutes } from '@/app/routes';

export const metadata: Metadata = {
  title: 'Events - ' + defaultMetadata.title,
};

export default function EventsPage() {
  return (
    <EventShell>
      <div className="container my-2 h-full flex-1 flex-col space-y-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Text fw="bold" size="xl">
              Ongoing Events
            </Text>
          </div>
        </div>
        <Divider my="xs" />

        {/* Main Content */}
        <div>content</div>
      </div>

      {/* Upcoming Events */}
      <div className="container my-2 h-full flex-1 flex-col space-y-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <a
            href={sidebarRoutes[1]?.links[1].link}
            className="text-inherit no-underline"
          >
            <Text fw="bold" size="xl">
              Upcoming Events
            </Text>
          </a>
        </div>
        <Divider my="xs" />

        {/* Main Content */}
        <div>content</div>
      </div>

      {/* Past Events */}
      <div className="container mb-2 h-full flex-1 flex-col space-y-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <a
            href={sidebarRoutes[1]?.links[2].link}
            className="text-inherit no-underline"
          >
            <Text fw="bold" size="xl">
              Previous Events
            </Text>
          </a>
        </div>
        <Divider my="xs" />

        {/* Main Content */}
        <div>content</div>
      </div>
    </EventShell>
  );
}
