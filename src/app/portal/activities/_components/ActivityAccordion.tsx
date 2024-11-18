'use client';

import { memo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Accordion, Text, Flex, Badge, Group } from '@mantine/core';
import type { ActivitiesViewResponse } from '@/libs/supabase/api/_response';
import type { Tables, Enums } from '@/libs/supabase/_database';
import { PageLoader } from '@/components/Loader/PageLoader';
import { isInternal } from '@/utils/access-control';

const ActivityCard = dynamic(() =>
  import('@/components/Cards/ActivityCard').then((mod) => ({
    default: mod.ActivityCard,
  })),
);

function ActivityAccordionShell({
  assigned,
  ongoing,
  upcoming,
  undated,
  past,
  role,
}: {
  assigned: ActivitiesViewResponse | undefined;
  ongoing: ActivitiesViewResponse | undefined;
  upcoming: ActivitiesViewResponse | undefined;
  undated: ActivitiesViewResponse | undefined;
  past: ActivitiesViewResponse | undefined;
  role: Enums<'roles_user'>;
}) {
  // Activity Accordion Items Component
  const ActivityItems = ({
    type,
    activities,
  }: {
    type: string;
    activities: Readonly<ActivitiesViewResponse> | undefined;
  }) => (
    <Accordion.Item key={type} value={type}>
      <Accordion.Control>
        <Group>
          <Text tt="capitalize">{type} Activities</Text>
          <Badge variant="default">{activities?.data?.length ?? 0}</Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Suspense fallback={<PageLoader />}>
          {activities?.data ? (
            <>
              {activities?.data?.length ? (
                <Flex
                  align="stretch"
                  direction="row"
                  gap="md"
                  justify="flex-start"
                  key={type}
                  wrap="wrap"
                >
                  {activities?.data?.map(
                    (activity: Tables<'activities_details_view'>) => {
                      // `type` practivities error on duplicate card with assigned activities
                      return (
                        <ActivityCard key={activity?.id + type} {...activity} />
                      );
                    },
                  )}
                </Flex>
              ) : (
                <Text c="dimmed">No {type} activities found.</Text>
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
      defaultValue={['assigned', 'ongoing', 'upcoming', 'undated']}
      multiple={true}
      variant="separated"
    >
      {!isInternal(role) && (
        <ActivityItems
          activities={assigned}
          type={role === 'faculty' ? 'assigned' : 'joined'}
        />
      )}

      <ActivityItems activities={ongoing} type="ongoing" />
      <ActivityItems activities={upcoming} type="upcoming" />
      <ActivityItems activities={undated} type="undated" />
      <ActivityItems activities={past} type="past" />
    </Accordion>
  );
}

export const ActivityAccordion = memo(ActivityAccordionShell);
