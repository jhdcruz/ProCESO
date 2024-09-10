import { memo } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { useDisclosure } from '@mantine/hooks';
import { Badge, Button, Group, Image, rem, Stack, Title } from '@mantine/core';
import {
  IconCalendarClock,
  IconCalendarEvent,
  IconEdit,
  IconEditOff,
} from '@tabler/icons-react';
import { formatDateRange } from 'little-date';
import { EventDetailsProps } from '@/api/types';
import dayjs from '@/utils/dayjs';
import { EventFormProps } from '../Forms/EventFormModal';

const EventFormModal = dynamic(
  () =>
    import('../Forms/EventFormModal').then((mod) => ({
      default: mod.EventFormModal,
    })),
  {
    ssr: false,
  },
);

/**
 * Main event information such as title, scheduled date & time,
 * Event cover image and edit button.
 */
function EventDetailsHeader({
  editable,
  event,
  toggleEdit,
}: {
  editable: boolean;
  event: EventDetailsProps;
  toggleEdit: () => void;
}) {
  const [opened, { open, close }] = useDisclosure(false);

  const eventForm: EventFormProps = {
    id: event.id ?? '',
    title: event.title ?? '',
    series: event.series ?? '',
    visibility: event.visibility ?? 'Everyone',
    handled_by: event.users?.map((user) => user.faculty_id!) ?? [],
    date_starting: dayjs(event.date_starting).toDate(),
    date_ending: dayjs(event.date_ending).toDate(),
    image_url: event.image_url ?? '',
  };

  console.log(eventForm);

  return (
    <>
      <EventFormModal
        close={close}
        event={eventForm}
        key={event.id}
        opened={opened}
      />

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
                <IconCalendarEvent
                  style={{ width: rem(16), height: rem(16) }}
                />
              }
              onClick={open}
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
    </>
  );
}

export const EventInfoHeader = memo(EventDetailsHeader);
