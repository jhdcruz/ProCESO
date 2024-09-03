'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { AppShell, Button, Group, TextInput, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import { getEvents } from '@/api/supabase/event';
import { getFacultyAssignedEvents } from '@/api/supabase/faculty-assignments';
import { EventFormModal } from './Forms/EventFormModal';
import type { Tables } from '@/utils/supabase/types';
import { EventAccordion } from './EventAccordion';
import { EventResponse } from '@/api/types';

export default function EventsShell({
  user,
}: {
  user: Tables<'users'> | undefined;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState<string>('');
  const searchQuery = useDeferredValue<string>(query);

  // data
  const [assigned, setAssigned] = useState<EventResponse>();
  const [ongoing, setOngoing] = useState<EventResponse>();
  const [upcoming, setUpcoming] = useState<EventResponse>();
  const [past, setPast] = useState<EventResponse>();

  useEffect(() => {
    const eventsAssigned = getFacultyAssignedEvents({
      userId: user?.id ?? '',
      search: searchQuery,
    });

    const eventsOngoing = getEvents({
      filter: 'ongoing',
      search: searchQuery,
    });

    const eventsUpcoming = getEvents({
      filter: 'upcoming',
      search: searchQuery,
    });

    const eventsPast = getEvents({
      filter: 'past',
      search: searchQuery,
    });

    const fetchEvents = async () => {
      const [assigned, ongoing, upcoming, past] = await Promise.all([
        eventsAssigned,
        eventsOngoing,
        eventsUpcoming,
        eventsPast,
      ]);

      setAssigned(assigned);
      setOngoing(ongoing);
      setUpcoming(upcoming);
      setPast(past);
    };

    fetchEvents();
  }, [searchQuery, user?.id]);

  return (
    <>
      <AppShell.Header>
        <Group className="content-center" h="100%" px="md">
          {/* New Event */}
          <Button
            className="drop-shadow-sm"
            leftSection={<IconCalendarPlus size={16} />}
            onClick={open}
          >
            Schedule new event
          </Button>
          <EventFormModal close={close} opened={opened} />

          {/*  Event search */}
          <TextInput
            leftSection={
              <IconSearch
                stroke={1.5}
                style={{ width: rem(16), height: rem(16) }}
              />
            }
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search for events"
          />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <EventAccordion
          assigned={assigned}
          ongoing={ongoing}
          past={past}
          role={user?.role ?? 'student'}
          search={query}
          upcoming={upcoming}
        />
      </AppShell.Main>
    </>
  );
}
