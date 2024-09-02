'use client';

import { Suspense, lazy } from 'react';
import { AppShell, Tabs, rem } from '@mantine/core';
import {
  IconBrandGoogleDrive,
  IconInfoCircle,
  IconTimeline,
} from '@tabler/icons-react';
import { PageLoader } from '@/components/Loader/PageLoader';
import { EventDetailsProps } from '@/api/types';

const EventInfo = lazy(() =>
  import('@/app/(system)/events/_components/EventDetails/EventInfo').then(
    (mod) => ({ default: mod.EventInfo }),
  ),
);

export default function EventPageShell({
  event,
}: Readonly<{
  event: EventDetailsProps;
}>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Tabs defaultValue="info" keepMounted={false}>
        <AppShell.Header>
          <Tabs.List grow h="100%" justify="stretch">
            <Tabs.Tab
              leftSection={
                <IconInfoCircle style={{ width: rem(16), height: rem(16) }} />
              }
              value="info"
            >
              Information
            </Tabs.Tab>

            <Tabs.Tab
              leftSection={
                <IconTimeline style={{ width: rem(16), height: rem(16) }} />
              }
              value="analytics"
            >
              Analytics & Insights
            </Tabs.Tab>

            <Tabs.Tab
              leftSection={
                <IconBrandGoogleDrive
                  style={{ width: rem(16), height: rem(16) }}
                />
              }
              value="storage"
            >
              Files
            </Tabs.Tab>
          </Tabs.List>
        </AppShell.Header>

        <AppShell.Main>
          <Tabs.Panel keepMounted={true} value="info">
            <Suspense fallback={<PageLoader />}>
              <EventInfo {...event} />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="analytics">
            <Suspense fallback={<PageLoader />}>
              Analytics, Insights, and Feedback Panel
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="storage">
            <Suspense fallback={<PageLoader />}>
              Storage and files panel
            </Suspense>
          </Tabs.Panel>
        </AppShell.Main>
      </Tabs>
    </Suspense>
  );
}
