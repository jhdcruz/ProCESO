'use client';

import { memo, Suspense } from 'react';
import {
  Accordion,
  Text,
  Loader,
  SimpleGrid,
  Badge,
  Group,
} from '@mantine/core';
import { Enums, Tables } from '@/utils/supabase/types';
import { EventCard } from './EventCard';
import { EventResponse } from '@/api/types';

function EventAccordionShell({
  assigned,
  ongoing,
  past,
  upcoming,
  role,
  recent,
}: {
  assigned: EventResponse;
  ongoing: EventResponse;
  past: EventResponse;
  upcoming: EventResponse;
  role: Enums<'user_roles'>;
  recent?: EventResponse;
}) {
  // Event Accordion Items Component
  const EventItems = ({
    type,
    events,
  }: {
    type: string;
    events: EventResponse;
  }) => (
    <Accordion.Item key={type} value={type}>
      <Accordion.Control>
        <Group>
          <Text tt="capitalize">{type} Events</Text>
          <Badge variant="default">{events?.data?.length ?? 0}</Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Suspense fallback={<Loader variant="dots" />}>
          {events?.data?.length ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xs">
              {events?.data?.map((event: Tables<'events'>) => {
                return <EventCard key={event.id} {...event} />;
              })}
            </SimpleGrid>
          ) : (
            <Text c="dimmed">No {type} events found.</Text>
          )}
        </Suspense>
      </Accordion.Panel>
    </Accordion.Item>
  );

  return (
    <Accordion
      defaultValue={['assigned', 'ongoing', 'recent', 'upcoming']}
      multiple={true}
    >
      <EventItems
        events={assigned}
        type={role === 'admin' || role === 'staff' ? 'assigned' : 'joined'}
      />

      {recent?.data?.length && <EventItems events={recent} type="recent" />}
      <EventItems events={ongoing} type="ongoing" />
      <EventItems events={upcoming} type="upcoming" />
      <EventItems events={past} type="past" />
    </Accordion>
  );
}

export const EventAccordion = memo(EventAccordionShell);
