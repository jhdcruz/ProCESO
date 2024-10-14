'use client';

import { memo, useEffect, useState } from 'react';
import {
  Accordion,
  type AccordionControlProps,
  ActionIcon,
  Center,
  Text,
  ColorSwatch,
  Flex,
  Group,
  rem,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Tables } from '@/libs/supabase/_database';
import { EventCard } from '@portal/events/_components/EventCard';
import { deleteSeries, getSeriesEvents } from '../actions';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { SeriesEditModal } from './SeriesEditModal';
import { useDisclosure } from '@mantine/hooks';
import { PageLoader } from '@/components/Loader/PageLoader';

interface AccordionProps extends AccordionControlProps {
  seriesId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function AccordionControl(props: AccordionProps) {
  return (
    <Center>
      <Accordion.Control {...props} />
      <ActionIcon
        color="gray"
        onClick={() => props.onEdit(props.seriesId)}
        size="lg"
        variant="subtle"
      >
        <IconEdit size={rem(18)} />
      </ActionIcon>
      <ActionIcon
        color="gray"
        mr="sm"
        onClick={() => props.onDelete(props.seriesId)}
        size="lg"
        variant="subtle"
      >
        <IconTrash size={rem(18)} />
      </ActionIcon>
    </Center>
  );
}

function SeriesAccordionComponent({ data }: { data: Tables<'series'>[] }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const [value, setValue] = useState<string | null>(null);
  const [series, setSeries] = useState<Tables<'series'>[]>(data);
  const [events, setEvents] = useState<Tables<'events'>[] | null>(null);
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
      children: <Text>This will not delete the events under this series.</Text>,
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
    setEvents([]);

    const seriesEvents = async () => {
      setLoading(true);

      if (!value) return;
      const events = await getSeriesEvents(value);

      setEvents(events?.data ?? []);

      setLoading(false);
    };

    void seriesEvents();
  }, [value]);

  const items = series.map((item) => (
    <Accordion.Item key={item.id} value={item.id}>
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
      <Accordion.Panel>
        {value === item.id && events?.length ? (
          <>
            <Flex
              align="flex-start"
              direction="row"
              gap="md"
              justify="flex-start"
              key={value}
              wrap="wrap"
            >
              {events?.map((event: Tables<'events'>) => {
                // value prevents duplicate events
                return <EventCard key={event?.id + value} {...event} />;
              })}
            </Flex>
          </>
        ) : (
          <>
            {loading ? (
              <PageLoader />
            ) : (
              <Text c="dimmed">No events found under this series.</Text>
            )}
          </>
        )}
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
      <SeriesEditModal close={close} opened={opened} series={seriesToEdit} />
      {items}
    </Accordion>
  );
}

export const SeriesAccordion = memo(SeriesAccordionComponent);
