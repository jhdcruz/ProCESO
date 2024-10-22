'use client';

import { memo, startTransition, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Divider,
  Group,
  Image,
  Text,
  Stack,
  Title,
  Tooltip,
  FileButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconAlertTriangle,
  IconCalendarClock,
  IconCalendarEvent,
  IconCheck,
  IconEdit,
  IconEditOff,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { useProgress } from 'react-transition-progress';
import { formatDateRange } from 'little-date';
import { EventDetailsProps } from '@/libs/supabase/api/_response';
import { uploadEventFiles } from '@/libs/supabase/api/storage';
import { systemUrl } from '@/app/routes';
import { deleteEventAction } from '@portal/events/actions';
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
  const [localFiles, setLocalFiles] = useState<File[]>();

  const router = useRouter();
  const startProgress = useProgress();

  const eventForm: EventFormProps = {
    id: event.id!,
    title: event.title!,
    series: event.series,
    visibility: event.visibility ?? 'Everyone',
    handled_by: event.users?.map((user) => user.faculty_id!) ?? undefined,
    date_starting: new Date(event.date_starting!),
    date_ending: new Date(event.date_ending!),
    image_url: event.image_url ?? undefined,
  };

  // event deletion confirmation modal
  const deleteModal = () =>
    modals.openConfirmModal({
      centered: true,
      title: 'Delete event?',
      children: (
        <>
          <Text>
            Are you sure you want to delete this event? This action is
            irreversible.
          </Text>
          <Text fw="bold" mt="sm">
            All data associated with this event will be lost.
          </Text>
        </>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: async () => {
        const response = await deleteEventAction(event.id!);

        notifications.show({
          title: response?.title,
          message: response?.message,
          icon: response?.status === 2 ? <IconAlertTriangle /> : <IconCheck />,
          color: response?.status === 2 ? 'red' : 'green',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });

        // only redirect when successful
        if (response?.status === 0) {
          startTransition(() => {
            startProgress();
            router.replace(`${systemUrl}/events`);
          });
        }
      },
    });

  useEffect(() => {
    if (localFiles?.length && event.id) {
      // upload files to storage
      const uploadFiles = async () => {
        await uploadEventFiles(event.id!, {
          files: localFiles,
          notify: notifications,
        });
      };

      void uploadFiles();
    }
  }, [event.id, localFiles]);

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
          <Title mb="lg" order={2}>
            {event?.title}
          </Title>

          {/* Event date and end */}
          {event?.date_starting && event?.date_ending && (
            <Group mb="xs">
              <Text c="dimmed">When:</Text>
              <Badge
                leftSection={<IconCalendarClock size={16} />}
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
            </Group>
          )}

          {event?.series && (
            <Group mb="xs">
              <Text c="dimmed">Series:</Text>
              <Tooltip
                label={`This event is part of the "${event.series}" event group.`}
                position="bottom"
              >
                <Badge color={event.series_color!} variant="dot">
                  {event.series}
                </Badge>
              </Tooltip>
            </Group>
          )}

          {/* Event control buttons */}
          <Group gap="xs" mt={16}>
            <Button.Group>
              <Button
                leftSection={<IconCalendarEvent size={16} />}
                onClick={open}
                variant="default"
              >
                Adjust Details
              </Button>

              <Button
                leftSection={
                  editable ? <IconEditOff size={16} /> : <IconEdit size={16} />
                }
                onClick={toggleEdit}
                variant="default"
              >
                {editable ? 'Hide Toolbars' : 'Edit Description'}
              </Button>
            </Button.Group>

            <Divider orientation="vertical" />

            <FileButton
              accept=".odt,.doc,.docx,.pdf,.pptx,.ppt,.xls,.xlsx,.csv"
              multiple
              onChange={setLocalFiles}
            >
              {(props) => (
                <Tooltip label="Only visible to admins/staffs. Max. 50mb per file">
                  <Button
                    leftSection={<IconUpload size={16} />}
                    variant="default"
                    {...props}
                  >
                    Upload Reports
                  </Button>
                </Tooltip>
              )}
            </FileButton>

            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={deleteModal}
              variant="filled"
            >
              Delete Event
            </Button>
          </Group>
        </Stack>

        <Image
          alt=""
          className="object-contain shadow-md"
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
