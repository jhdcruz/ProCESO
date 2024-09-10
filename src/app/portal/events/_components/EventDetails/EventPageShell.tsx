'use client';

import dynamic from 'next/dynamic';
import { AppShell, Tabs, rem } from '@mantine/core';
import {
  IconBrandGoogleDrive,
  IconInfoCircle,
  IconTimeline,
} from '@tabler/icons-react';
import { PageLoader } from '@/components/Loader/PageLoader';
import type { EventDetailsProps } from '@/api/types';

const EventInfo = dynamic(
  () =>
    import('./EventInfo').then((mod) => ({
      default: mod.EventInfo,
    })),
  {
    loading: () => <PageLoader />,
  },
);

const NotFound = dynamic(
  () =>
    import('@/components/Fallbacks/NotFound').then((mod) => ({
      default: mod.NotFound,
    })),
  {
    loading: () => <PageLoader />,
  },
);

export default function EventPageShell({
  event,
}: Readonly<{
  event: EventDetailsProps | null;
}>) {
  return (
    <>
      {!event ? (
        <AppShell.Main>
          <NotFound />
        </AppShell.Main>
      ) : (
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
              <EventInfo {...event} />
            </Tabs.Panel>

            <Tabs.Panel value="analytics">
              <>Analytics, Insights, and Feedback Panel</>
            </Tabs.Panel>

            <Tabs.Panel value="storage">
              <>Storage and files panel</>
            </Tabs.Panel>
          </AppShell.Main>
        </Tabs>
      )}
    </>
  );
}
