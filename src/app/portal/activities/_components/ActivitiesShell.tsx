'use client';

import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Group, TextInput, rem } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import { getActivities } from '@/libs/supabase/api/activity';
import { getAssignedActivities } from '@/libs/supabase/api/faculty-assignments';
import { ActivitiesViewResponse } from '@/libs/supabase/api/_response';
import { PageLoader } from '@/components/Loader/PageLoader';
import { useUser } from '@/components/Providers/UserProvider';

const ActivityAccordion = dynamic(
  () => import('./ActivityAccordion').then((mod) => mod.ActivityAccordion),
  {
    loading: () => <PageLoader />,
    ssr: false,
  },
);

const ActivityFormModal = dynamic(
  () =>
    import('./Forms/ActivityFormModal').then((mod) => ({
      default: mod.ActivityFormModal,
    })),
  {
    ssr: false,
  },
);

function ActivitiesShellComponent() {
  const user = useUser();

  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState<string>('');
  const [searchQuery] = useDebouncedValue(query, 200);

  // data
  const [assigned, setAssigned] = useState<ActivitiesViewResponse>();
  const [ongoing, setOngoing] = useState<ActivitiesViewResponse>();
  const [upcoming, setUpcoming] = useState<ActivitiesViewResponse>();
  const [undated, setUndated] = useState<ActivitiesViewResponse>();
  const [past, setPast] = useState<ActivitiesViewResponse>();

  useEffect(() => {
    const activitiesAssigned = getAssignedActivities({
      userId: user.id,
      search: searchQuery,
    });

    const activitiesOngoing = getActivities({
      filter: 'ongoing',
      search: searchQuery,
    });

    const activitiesUpcoming = getActivities({
      filter: 'upcoming',
      search: searchQuery,
    });

    const activitiesPast = getActivities({
      filter: 'past',
      search: searchQuery,
    });

    const activitiesUndated = getActivities({
      filter: 'undated',
      search: searchQuery,
    });

    const fetchActivities = async () => {
      const [assigned, ongoing, upcoming, past, undated] = await Promise.all([
        activitiesAssigned,
        activitiesOngoing,
        activitiesUpcoming,
        activitiesPast,
        activitiesUndated,
      ]);

      setAssigned(assigned);
      setOngoing(ongoing);
      setUpcoming(upcoming);
      setPast(past);
      setUndated(undated);
    };

    void fetchActivities();
  }, [searchQuery, user?.id]);

  return (
    <>
      <Group className="content-center" mb="md">
        {/* New activity */}
        <Button
          className="drop-shadow-sm"
          leftSection={<IconCalendarPlus size={16} />}
          onClick={open}
        >
          Schedule new activity
        </Button>
        <ActivityFormModal close={close} opened={opened} />

        {/*  activity search */}
        <TextInput
          leftSection={
            <IconSearch
              stroke={1.5}
              style={{ width: rem(16), height: rem(16) }}
            />
          }
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search for activies"
        />
      </Group>

      <ActivityAccordion
        assigned={assigned}
        ongoing={ongoing}
        past={past}
        role={user.role ?? 'student'}
        undated={undated}
        upcoming={upcoming}
      />
    </>
  );
}

export const ActivitiesShell = memo(ActivitiesShellComponent);
