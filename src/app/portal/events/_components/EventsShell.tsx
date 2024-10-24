'use client';

import { memo, useDeferredValue, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Group, TextInput, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import { getEvents } from '@/libs/supabase/api/event';
import { getAssignedEvents } from '@/libs/supabase/api/faculty-assignments';
import { EventsViewResponse } from '@/libs/supabase/api/_response';
import { PageLoader } from '@/components/Loader/PageLoader';
import { useUser } from '@/components/Providers/UserProvider';

const EventAccordion = dynamic(
  () => import('./EventAccordion').then((mod) => mod.EventAccordion),
  {
    loading: () => <PageLoader />,
    ssr: false,
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

function EventsShellComponent() {
  const user = useUser();

  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState<string>('');
  const searchQuery = useDeferredValue<string>(query);

  // data
  const [assigned, setAssigned] = useState<EventsViewResponse>();
  const [ongoing, setOngoing] = useState<EventsViewResponse>();
  const [upcoming, setUpcoming] = useState<EventsViewResponse>();
  const [past, setPast] = useState<EventsViewResponse>();

  useEffect(() => {
    const eventsAssigned = getAssignedEvents({
      userId: user.id,
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
    <>
      <Group className="content-center" mb="md">
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
        role={user.role ?? 'student'}
        upcoming={upcoming}
      />
    </>
  );
}

export const EventsShell = memo(EventsShellComponent);
