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
  IconCalendarClock,
  IconCalendarEvent,
  IconEdit,
  IconEditOff,
  IconRss,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { useProgress } from 'react-transition-progress';
import { formatDateRange } from 'little-date';
import { EventDetailsProps } from '@/libs/supabase/api/_response';
import { uploadEventFiles } from '@/libs/supabase/api/storage';
import { systemUrl } from '@/app/routes';
import {
  deleteEventAction,
  isSubscribed,
  subscribeToEvent,
} from '@portal/events/actions';
import { EventFormProps } from '../Forms/EventFormModal';
import type { Enums } from '@/libs/supabase/_database';
import { isInternal } from '@/utils/access-control';
import { useUser } from '@/components/Providers/UserProvider';

const EventFormModal = dynamic(
  () =>
    import('../Forms/EventFormModal').then((mod) => ({
      default: mod.EventFormModal,
    })),
  {
    ssr: false,
  },
);

// subscribe student user to event
const onUserSubscribe = async (
  eventId: string,
  userId: string,
  subscribe: boolean,
  setSubscribed: (value: boolean) => void,
) => {
  const response = await subscribeToEvent(eventId, userId, subscribe);

  notifications.show({
    title: response?.title,
    message: response?.message,
    color: response?.status === 0 ? 'green' : 'red',
    withBorder: true,
    withCloseButton: true,
    autoClose: 4000,
  });

  if (response?.status === 0) {
    setSubscribed(subscribe);
  }
};

// event deletion confirmation modal
const deleteModal = (
  id: string,
  router: ReturnType<typeof useRouter>,
  startProgress: ReturnType<typeof useProgress>,
) =>
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
      const response = await deleteEventAction(id);

      notifications.show({
        title: response?.title,
        message: response?.message,
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

/**
 * Main event information such as title, scheduled date & time,
 * Event cover image and edit button.
 */
function EventDetailsHeader({
  role,
  editable,
  event,
  toggleEdit,
}: {
  role: Enums<'roles_user'>;
  editable: boolean;
  event: EventDetailsProps;
  toggleEdit: () => void;
}) {
  const { id: userId } = useUser();

  const [opened, { open, close }] = useDisclosure(false);
  const [localFiles, setLocalFiles] = useState<File[]>();
  const [subscribed, setSubscribed] = useState(false);

  const router = useRouter();
  const startProgress = useProgress();

  const eventForm: EventFormProps = {
    id: event.id as string,
    title: event.title as string,
    series: event.series,
    visibility: event.visibility ?? 'Everyone',
    handled_by:
      event.users?.map((user) => user.faculty_id as string) ?? undefined,
    date_starting: new Date(event.date_starting as string),
    date_ending: new Date(event.date_ending as string),
    image_url: event.image_url ?? undefined,
  };

  useEffect(() => {
    if (role !== 'student' && localFiles?.length && event.id) {
      // upload files to storage
      const uploadFiles = async () => {
        await uploadEventFiles(event.id as string, {
          files: localFiles,
          notify: notifications,
        });
      };

      void uploadFiles();
    }
  }, [event.id, localFiles, role]);

  // check if student is subscribed to event
  useEffect(() => {
    if (role === 'student' && event.id) {
      const checkSubscription = async () => {
        const response = await isSubscribed(event.id!, userId);

        setSubscribed(response?.status === 0);
      };

      void checkSubscription();
    }
  }, [subscribed, role, event.id, userId]);

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
                <Badge color={event.series_color as string} variant="dot">
                  {event.series}
                </Badge>
              </Tooltip>
            </Group>
          )}

          {/* Event control buttons */}
          <Group gap="xs" mt={16}>
            {isInternal(role) ? (
              <>
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
                      editable ? (
                        <IconEditOff size={16} />
                      ) : (
                        <IconEdit size={16} />
                      )
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
                  onClick={() =>
                    deleteModal(event.id as string, router, startProgress)
                  }
                  variant="filled"
                >
                  Delete Event
                </Button>
              </>
            ) : (
              <>
                <Button
                  leftSection={<IconRss size={16} />}
                  onClick={() =>
                    onUserSubscribe(
                      event.id as string,
                      userId,
                      subscribed ? !subscribed : true,
                      setSubscribed,
                    )
                  }
                  variant={subscribed ? 'default' : 'filled'}
                >
                  {subscribed ? 'Unsubscribe' : 'Subscribe'}
                </Button>
              </>
            )}
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
