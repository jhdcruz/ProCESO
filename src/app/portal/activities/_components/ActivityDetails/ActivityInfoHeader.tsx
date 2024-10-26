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
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { uploadActivityFiles } from '@/libs/supabase/api/storage';
import { systemUrl } from '@/app/routes';
import {
  deleteActivityAction,
  isSubscribed,
  subscribeToActivity,
} from '@portal/activities/actions';
import { ActivityFormProps } from '../Forms/ActivityFormModal';
import type { Enums } from '@/libs/supabase/_database';
import { isInternal } from '@/utils/access-control';
import { useUser } from '@/components/Providers/UserProvider';

const ActivityFormModal = dynamic(
  () =>
    import('../Forms/ActivityFormModal').then((mod) => ({
      default: mod.ActivityFormModal,
    })),
  {
    ssr: false,
  },
);

// subscribe student user to activity
const onUserSubscribe = async (
  activityId: string,
  userId: string,
  subscribe: boolean,
  setSubscribed: (value: boolean) => void,
) => {
  const response = await subscribeToActivity(activityId, userId, subscribe);

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

// activity deletion confirmation modal
const deleteModal = (
  id: string,
  router: ReturnType<typeof useRouter>,
  startProgress: ReturnType<typeof useProgress>,
) =>
  modals.openConfirmModal({
    centered: true,
    title: 'Delete activity?',
    children: (
      <>
        <Text>
          Are you sure you want to delete this activity? This action is
          irreversible.
        </Text>
        <Text fw="bold" mt="sm">
          All data associated with this activity will be lost.
        </Text>
      </>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onCancel: () => console.log('Cancel'),
    onConfirm: async () => {
      const response = await deleteActivityAction(id);

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
          router.replace(`${systemUrl}/activities`);
        });
      }
    },
  });

/**
 * Main activity information such as title, scheduled date & time,
 * Activity cover image and edit button.
 */
function ActivityDetailsHeader({
  role,
  editable,
  activity,
  toggleEdit,
}: {
  role: Enums<'roles_user'>;
  editable: boolean;
  activity: ActivityDetailsProps;
  toggleEdit: () => void;
}) {
  const { id: userId } = useUser();

  const [opened, { open, close }] = useDisclosure(false);
  const [localFiles, setLocalFiles] = useState<File[]>();
  const [subscribed, setSubscribed] = useState(false);

  const router = useRouter();
  const startProgress = useProgress();

  const activityForm: ActivityFormProps = {
    id: activity.id as string,
    title: activity.title as string,
    series: activity.series,
    visibility: activity.visibility ?? 'Everyone',
    handled_by:
      activity.users?.map((user) => user.faculty_id as string) ?? undefined,
    date_starting: new Date(activity.date_starting as string),
    date_ending: new Date(activity.date_ending as string),
    image_url: activity.image_url ?? undefined,
  };

  useEffect(() => {
    if (role !== 'student' && localFiles?.length && activity.id) {
      // upload files to storage
      const uploadFiles = async () => {
        await uploadActivityFiles(activity.id as string, {
          files: localFiles,
          notify: notifications,
        });
      };

      void uploadFiles();
    }
  }, [activity.id, localFiles, role]);

  // check if student is subscribed to activity
  useEffect(() => {
    if (role === 'student' && activity.id) {
      const checkSubscription = async () => {
        const response = await isSubscribed(activity.id!, userId);

        setSubscribed(response?.status === 0);
      };

      void checkSubscription();
    }
  }, [subscribed, role, activity.id, userId]);

  return (
    <>
      <ActivityFormModal
        activity={activityForm}
        close={close}
        key={activity.id}
        opened={opened}
      />

      <Group justify="space-between">
        <Stack gap={0}>
          <Title mb="lg" order={2}>
            {activity?.title}
          </Title>

          {/* Activity date and end */}
          {activity?.date_starting && activity?.date_ending && (
            <Group mb="xs">
              <Text c="dimmed">When:</Text>
              <Badge
                leftSection={<IconCalendarClock size={16} />}
                size="lg"
                variant="light"
              >
                {formatDateRange(
                  new Date(activity.date_starting),
                  new Date(activity.date_ending),
                  {
                    includeTime: true,
                  },
                )}
              </Badge>
            </Group>
          )}

          {activity?.series && (
            <Group mb="xs">
              <Text c="dimmed">Series:</Text>
              <Tooltip
                label={`This activity is part of the "${activity.series}" activity group.`}
                position="bottom"
              >
                <Badge color={activity.series_color as string} variant="dot">
                  {activity.series}
                </Badge>
              </Tooltip>
            </Group>
          )}

          {/* Activity control buttons */}
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
                    deleteModal(activity.id as string, router, startProgress)
                  }
                  variant="filled"
                >
                  Delete Activity
                </Button>
              </>
            ) : (
              <>
                <Button
                  leftSection={<IconRss size={16} />}
                  onClick={() =>
                    onUserSubscribe(
                      activity.id as string,
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
          src={activity.image_url}
          w="auto"
          width={340}
        />
      </Group>
    </>
  );
}

export const ActivityInfoHeader = memo(ActivityDetailsHeader);
