'use client';

import { memo, startTransition } from 'react';
import { useProgress } from 'react-transition-progress';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tabs } from '@mantine/core';
import { IconInfoSquare, IconTimeline } from '@tabler/icons-react';
import { systemUrl } from '@/app/routes';
import type { EventDetailsProps } from '@/libs/supabase/api/_response';
import { PageLoader } from '@/components/Loader/PageLoader';
import { useUser } from '@/components/Providers/UserProvider';
import { canAccessEvent, isInternal } from '@/utils/access-control';
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
  event: EventDetailsProps;
}>) {
  const { role } = useUser();

  const startProgress = useProgress();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {!canAccessEvent(event.visibility, role) ? (
        <NotFound />
      ) : (
        <Tabs
          defaultValue="info"
          onChange={(value) => {
            startTransition(() => {
              startProgress();
              router.push(`${systemUrl}/events/${event?.id}/${value}`);
            });
          }}
          value={pathname.split('/').pop()}
        >
          {/* Tabs Content */}
          <Tabs.List grow justify="stretch" mb={16}>
            <Tabs.Tab leftSection={<IconInfoSquare size={18} />} value="info">
              Information
            </Tabs.Tab>

            {isInternal(role!) && (
              <Tabs.Tab
                leftSection={<IconTimeline size={18} />}
                value="analytics"
              >
                Analytics & Insights
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel keepMounted={true} value="info">
            <EventInfo event={event} role={role!} />
          </Tabs.Panel>

          {isInternal(role!) && (
            <Tabs.Panel value="analytics">
              <>Analytics, Insights, and Feedback Panel</>
            </Tabs.Panel>
          )}
        </Tabs>
      )}
    </>
  );
}

export const EventDetailsShell = memo(EventDetailsComponent);
