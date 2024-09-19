'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AppShell, Button, Group, TextInput, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import { getEvents } from '@/libs/supabase/api/event';
import { getAssignedEvents } from '@/libs/supabase/api/faculty-assignments';
import { EventResponse } from '@/libs/supabase/api/_response';
import type { Tables } from '@/libs/supabase/_database';
import { PageLoader } from '@/components/Loader/PageLoader';

const EventAccordion = dynamic(
  () => import('./EventAccordion').then((mod) => mod.EventAccordion),
  {
    loading: () => <PageLoader />,
  },
);

const EventFormModal = dynamic(
  () =>
    import('./Forms/EventFormModal').then((mod) => ({
      default: mod.EventFormModal,
    })),
  {
    ssr: false,
  },
);

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
    const eventsAssigned = getAssignedEvents({
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

    void fetchEvents();
  }, [searchQuery, user?.id]);

  return (
    <AppShell.Main>
      <Group className="content-center" mb="md" px="md">
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

      <EventAccordion
        assigned={assigned}
        ongoing={ongoing}
        past={past}
        role={user?.role ?? 'student'}
        upcoming={upcoming}
      />
    </AppShell.Main>
  );
}
