'use client';

import { lazy, memo, Suspense, useState } from 'react';
import NextImage from 'next/image';
import {
  Avatar,
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  rem,
  Space,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCalendarClock,
  IconCalendarEvent,
  IconEdit,
  IconEditOff,
} from '@tabler/icons-react';
import { formatDateRange } from 'little-date';
import dayjs from '@/utils/dayjs';
import type { EventDetailsProps } from '@/api/types';
import { EventFormModal, EventFormProps } from '../Forms/EventFormModal';
import { updateEventDescription } from '@/api/supabase/event';

const RTEditor = lazy(() =>
  import('@/components/RichTextEditor/RTEditor').then((mod) => ({
    default: mod.RTEditor,
  })),
);

/**
 * Main event information such as title, scheduled date & time,
 * Event cover image and edit button.
 */
function EventDetailsHeader({
  editable,
  event,
  toggleEdit,
  toggleModal,
}: {
  editable: boolean;
  event: EventDetailsProps;
  toggleEdit: () => void;
  toggleModal: () => void;
}) {
  return (
    <Group justify="space-between">
      <Stack gap={0}>
        <Title order={2}>{event?.title}</Title>

        {/* Event date and end */}
        {event?.date_starting && event?.date_ending && (
          <Badge
            leftSection={<IconCalendarClock size={16} />}
            my="xs"
            size="lg"
            variant="light"
          >
            {formatDateRange(
              new Date(event.date_starting),
              new Date(event.date_ending),
              {
                includeTime: true,
              },
            )}
          </Badge>
        )}

        {/* Event control buttons */}
        <Group gap="xs" mt={16}>
          <Button
            leftSection={
              <IconCalendarEvent style={{ width: rem(16), height: rem(16) }} />
            }
            onClick={toggleModal}
            variant="default"
          >
            Adjust Details
          </Button>

          <Button
            leftSection={
              editable ? (
                <IconEditOff style={{ width: rem(16), height: rem(16) }} />
              ) : (
                <IconEdit style={{ width: rem(16), height: rem(16) }} />
              )
            }
            onClick={toggleEdit}
            variant="default"
          >
            {editable ? 'Hide Toolbars' : 'Edit Description'}
          </Button>
        </Group>
      </Stack>

      <Image
        alt=""
        className="shadow-lg"
        component={NextImage}
        fallbackSrc="/assets/no-image.png"
        h="auto"
        height={340}
        mb={16}
        radius="md"
        src={event.image_url}
        w="auto"
        width={340}
      />
    </Group>
  );
}

/**
 * Mainly description of the event with aside information
 * for published by, date created and updated, etc.
 */
function EventInfoContent({
  content,
  event,
  editable,
  loading,
  onSave,
}: {
  content: string | null;
  event: EventDetailsProps;
  editable: boolean;
  loading: boolean;
  onSave: (content: string) => void;
}) {
  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, sm: 'auto' }}>
        <Suspense
          fallback={<Loader className="mx-auto my-5" size="md" type="dots" />}
        >
          <RTEditor
            content={content}
            editable={editable}
            loading={loading}
            onSubmit={onSave}
          />
        </Suspense>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 3 }}>
        <Text c="dimmed">Published by</Text>
        <Group my={16}>
          <Avatar
            alt={event?.created_by ?? ''}
            color="initials"
            radius="xl"
            src={event?.creator_avatar}
          />
          <div>
            <Text lineClamp={1} size="sm">
              {event?.created_by}
            </Text>
            <Text c="dimmed" size="xs">
              {dayjs(event?.created_at).fromNow()}
            </Text>
          </div>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

export const EventInfo = memo((event: Readonly<EventDetailsProps>) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(event?.description ?? null);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const eventForm: EventFormProps = {
    title: event.title ?? '',
    series: event.series ?? '',
    visibility: event.visibility ?? 'Everyone',
    handled_by: event.users?.map((user) => user.faculty_id!) ?? [],
    date_starting: dayjs(event.date_starting).toDate(),
    date_ending: dayjs(event.date_ending).toDate(),
    image_url: event.image_url ?? '',
  };

  const saveDescription = async (content: string) => {
    if (!event?.id || !editable) return;
    setLoading(true);

    const result = await updateEventDescription({
      eventId: event.id,
      description: content,
    });

    if (result.status !== 0) {
      notifications.show({
        title: 'Cannot update event description',
        message: result.message,
        icon: <IconAlertTriangle />,
        color: result.status === 1 ? 'yellow' : 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
    } else {
      // reflect changes locally
      setContent(content);
      setEditable(false);
    }

    setLoading(false);
  };

  return (
    <Container fluid>
      <EventDetailsHeader
        editable={editable}
        event={event}
        toggleEdit={() => setEditable(!editable)}
        toggleModal={open}
      />

      {/* Event Details Modal */}
      <EventFormModal close={close} event={eventForm} opened={opened} />

      <Space h={12} />
      <EventInfoContent
        content={content}
        editable={editable}
        event={event}
        loading={loading}
        onSave={saveDescription}
      />
    </Container>
  );
});
EventInfo.displayName = 'EventInfo';
