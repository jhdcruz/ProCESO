'use client';

import { memo, Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Accordion,
  type AccordionControlProps,
  ActionIcon,
  Center,
  Text,
  ColorSwatch,
  Flex,
  Group,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Tables } from '@/libs/supabase/_database';
import { PageLoader } from '@/components/Loader/PageLoader';
import { deleteSeries, getSeriesActivities } from '../actions';
import { useUser } from '@/components/Providers/UserProvider';

const SeriesEditModal = dynamic(
  () => import('./SeriesEditModal').then((mod) => mod.SeriesEditModal),
  { ssr: false },
);

const ActivityCard = dynamic(
  () =>
    import('@/components/Cards/ActivityCard').then((mod) => mod.ActivityCard),
  { ssr: false },
);
interface AccordionProps extends AccordionControlProps {
  seriesId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function AccordionControl({
  seriesId,
  onEdit,
  onDelete,
  ...rest
}: AccordionProps) {
  return (
    <Center>
      <Accordion.Control {...rest} />
      <ActionIcon
        aria-label="Edit series"
        color="gray"
        onClick={() => onEdit(seriesId)}
        variant="subtle"
      >
        <IconEdit size={18} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        aria-label="Delete series"
        color="gray"
        mr="sm"
        onClick={() => onDelete(seriesId)}
        variant="subtle"
      >
        <IconTrash size={18} stroke={1.5} />
      </ActionIcon>
    </Center>
  );
}

function SeriesAccordionComponent({ data }: { data: Tables<'series'>[] }) {
  const { role } = useUser();

  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  // accordion control
  const [value, setValue] = useState<string | null>(null);

  // data
  const [series, setSeries] = useState<Tables<'series'>[]>(data);
  const [activities, setActivities] =
    useState<Tables<'activities_details_view'>[]>();
  const [seriesToEdit, setSeriesToEdit] = useState<Tables<'series'> | null>(
    null,
  );

  const handleEdit = (seriesId: string) => {
    const seriesData = series.find((s) => s.id === seriesId) || null;
    setSeriesToEdit(seriesData);
    open();
  };

  const deleteSeriesModal = (seriesId: string) =>
    modals.openConfirmModal({
      centered: true,
      title: `Delete Series?`,
      children: (
        <Text>This will not delete the activities under this series.</Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: {
        color: 'red',
        leftSection: <IconTrash size={20} stroke={1.6} />,
      },
      onCancel: () => console.log('Cancel'),
      onConfirm: async () => {
        const response = await deleteSeries(seriesId);

        notifications.show({
          title: response?.title,
          message: response?.message,
          color: response?.status === 2 ? 'red' : 'green',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });

        // update local data
        setSeries(series.filter((s) => s.id !== seriesId));
      },
    });

  useEffect(() => {
    // fixes erratic behavior when changing series
    setActivities([]);

    const seriesActivities = async () => {
      setLoading(true);

      if (!value) return;
      const activities = await getSeriesActivities(value);

      setActivities(activities?.data ?? []);

      setLoading(false);
    };

    void seriesActivities();
  }, [value]);

  const items = series.map((item) => (
    <Accordion.Item key={item.id} value={item.title}>
      {role !== 'student' && (
        <AccordionControl
          onDelete={() => deleteSeriesModal(item.id)}
          onEdit={handleEdit}
          seriesId={item.id}
        >
          <Group>
            {item.color && (
              <ColorSwatch color={item.color} size={20} withShadow={false} />
            )}
            {item.title}
          </Group>
        </AccordionControl>
      )}
      <Accordion.Panel>
        <Suspense fallback={<PageLoader />}>
          {value === item.title && activities?.length ? (
            <>
              <Flex
                align="stretch"
                direction="row"
                gap="md"
                justify="flex-start"
                key={value}
                wrap="wrap"
              >
                {activities.map(
                  (activity: Tables<'activities_details_view'>) => {
                    // value practivities duplicate activities
                    return (
                      <ActivityCard key={activity?.id + value} {...activity} />
                    );
                  },
                )}
              </Flex>
            </>
          ) : (
            <>
              {loading ? (
                <PageLoader />
              ) : (
                <Text c="dimmed">No activities found under this series.</Text>
              )}
            </>
          )}
        </Suspense>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion
      chevronPosition="left"
      onChange={setValue}
      value={value}
      variant="separated"
    >
      {role !== 'student' && (
        <SeriesEditModal close={close} opened={opened} series={seriesToEdit} />
      )}
      {items}
    </Accordion>
  );
}

export const SeriesAccordion = memo(SeriesAccordionComponent);
