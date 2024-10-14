'use client';

import { memo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Accordion, Text, Loader, Flex, Badge, Group } from '@mantine/core';
import type { EventResponse } from '@/libs/supabase/api/_response';
import type { Tables, Enums } from '@/libs/supabase/_database';
import { PageLoader } from '@/components/Loader/PageLoader';

const EventCard = dynamic(() =>
  import('@/components/Cards/EventCard').then((mod) => ({
    default: mod.EventCard,
  })),
);

function EventAccordionShell({
  assigned,
  ongoing,
  upcoming,
  past,
  role,
}: {
  assigned: EventResponse | undefined;
  ongoing: EventResponse | undefined;
  upcoming: EventResponse | undefined;
  past: EventResponse | undefined;
  role: Enums<'roles_user'>;
}) {
  // Event Accordion Items Component
  const EventItems = ({
    type,
    events,
  }: {
    type: string;
    events: Readonly<EventResponse> | undefined;
  }) => (
    <Accordion.Item key={type} value={type}>
      <Accordion.Control>
        <Group>
          <Text tt="capitalize">{type} Events</Text>
          <Badge variant="default">{events?.data?.length ?? 0}</Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Suspense fallback={<PageLoader />}>
          {events?.data ? (
            <>
              {events?.data?.length ? (
                <Flex
                  align="stretch"
                  direction="row"
                  gap="md"
                  justify="flex-start"
                  key={type}
                  wrap="wrap"
                >
                  {events?.data?.map((event: Tables<'events'>) => {
                    // `type` prevents error on duplicate card with assigned events
                    return <EventCard key={event?.id + type} {...event} />;
                  })}
                </Flex>
              ) : (
                <Text c="dimmed">No {type} events found.</Text>
              )}
            </>
          ) : (
            <PageLoader />
          )}
        </Suspense>
      </Accordion.Panel>
    </Accordion.Item>
  );
  return (
    <Accordion
      defaultValue={['assigned', 'ongoing', 'upcoming']}
      multiple={true}
      transitionDuration={200}
      variant="separated"
    >
      <EventItems
        events={assigned}
        type={role === 'admin' || role === 'staff' ? 'assigned' : 'joined'}
      />

      <EventItems events={ongoing} type="ongoing" />
      <EventItems events={upcoming} type="upcoming" />
      <EventItems events={past} type="past" />
    </Accordion>
  );
}

export const EventAccordion = memo(EventAccordionShell);
