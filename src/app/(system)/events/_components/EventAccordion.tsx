'use client';

import { memo, Suspense, useEffect, useState } from 'react';
import {
  Accordion,
  Text,
  Loader,
  SimpleGrid,
  Badge,
  Group,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { EventResponse } from '@/api/types';
import { getEvents, getEventsCount } from '@/api/supabase/event';
import type { Enums, Tables } from '@/utils/supabase/types';
import { EventCard } from './EventCard';

function EventAccordionShell({
  assigned,
  ongoing,
  upcoming,
  role,
  recent,
}: {
  assigned: EventResponse;
  ongoing: EventResponse;
  upcoming: EventResponse;
  role: Enums<'user_roles'>;
  recent?: EventResponse;
}) {
  const [value, setValue] = useState<string[]>([
    'assigned',
    'ongoing',
    'recent',
    'upcoming',
  ]);
  const [past, setPast] = useState<EventResponse>();
  const [pastCount, setPastCount] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // fetch past events only when past is selected/shown.
  useEffect(() => {
    const fetchPastEvents = async () => {
      setIsLoading(true);

      if (value.some((v) => v === 'past') && !past?.data?.length) {
        const pastEvents = await getEvents({
          filter: 'past',
        });

        setPast(pastEvents);
      }

      setIsLoading(false);
    };

    fetchPastEvents().catch((e) => {
      notifications.show({
        title: "Couldn't fetch past events",
        message: e.message + ', please refresh or try again later.',
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
    });
  }, [value]);

  // get the exact count of past events
  useEffect(() => {
    const fetchPastCount = async () => {
      const count = await getEventsCount({
        filter: 'past',
      });

      setPastCount(count?.data ?? 0);
    };

    fetchPastCount().catch((e) => {
      notifications.show({
        title: "Couldn't fetch past events count",
        message: e.message + ', please refresh or try again later.',
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
    });
  }, []);

  // Event Accordion Items Component
  const EventItems = ({
    type,
    events,
  }: {
    type: string;
    events: EventResponse | undefined;
  }) => (
    <Accordion.Item key={type} value={type}>
      <Accordion.Control>
        <Group>
          <Text tt="capitalize">{type} Events</Text>
          <Badge variant="default">{events?.data?.length ?? 0}</Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Suspense
          fallback={
            <Loader className="mx-auto my-5 block" size="md" type="dots" />
          }
        >
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
      multiple={true}
      onChange={setValue}
      transitionDuration={200}
      value={value}
    >
      <EventItems
        events={assigned}
        type={role === 'admin' || role === 'staff' ? 'assigned' : 'joined'}
      />

      {recent?.data?.length && <EventItems events={recent} type="recent" />}
      <EventItems events={ongoing} type="ongoing" />
      <EventItems events={upcoming} type="upcoming" />

      {/* Past events, fetched on-demand */}
      <Accordion.Item key="past" value="past">
        <Accordion.Control>
          <Group>
            <Text tt="capitalize">Past Events</Text>
            {pastCount ? (
              <Badge variant="default">{pastCount}</Badge>
            ) : (
              <Loader size="xs" type="dots" />
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          {isLoading ? (
            <Loader className="mx-auto" size="md" type="dots" />
          ) : past?.data?.length ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xs">
              {past?.data?.map((event: Tables<'events'>) => {
                return <EventCard key={event.id} {...event} />;
              })}
            </SimpleGrid>
          ) : (
            <Text c="dimmed">No past events found.</Text>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export const EventAccordion = memo(EventAccordionShell);
