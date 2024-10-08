'use client';

import { memo, startTransition } from 'react';
import { useProgress } from 'react-transition-progress';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AppShell, Tabs, rem } from '@mantine/core';
import {
  IconBrandGoogleDrive,
  IconInfoCircle,
  IconTimeline,
} from '@tabler/icons-react';
import { systemUrl } from '@/app/routes';
import { PageLoader } from '@/components/Loader/PageLoader';
import type { EventDetailsProps } from '@/libs/supabase/api/_response';
import { EventInfo } from './EventInfo';

const NotFound = dynamic(
  () =>
    import('@/components/Fallbacks/NotFound').then((mod) => ({
      default: mod.NotFound,
    })),
  {
    loading: () => <PageLoader />,
  },
);

function EventDetailsComponent({
  event,
}: Readonly<{
  event: EventDetailsProps | null;
}>) {
  const startProgress = useProgress();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppShell.Main>
      {!event ? (
        <NotFound />
      ) : (
        <Tabs
          defaultValue="info"
          onChange={(value) => {
            startTransition(async () => {
              startProgress();
              router.push(`${systemUrl}/events/${event?.id}/${value}`);
            });
          }}
          value={pathname.split('/').pop()}
        >
          {/* Tabs Content */}
          <Tabs.List grow justify="stretch" mb={16}>
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

          <Tabs.Panel keepMounted={true} value="info">
            <EventInfo {...event} />
          </Tabs.Panel>

          <Tabs.Panel value="analytics">
            <>Analytics, Insights, and Feedback Panel</>
          </Tabs.Panel>

          <Tabs.Panel value="storage">
            <>Storage and files panel</>
          </Tabs.Panel>
        </Tabs>
      )}
    </AppShell.Main>
  );
}

export const EventDetailsShell = memo(EventDetailsComponent);
