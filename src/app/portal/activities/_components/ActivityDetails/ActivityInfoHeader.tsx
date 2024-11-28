'use client';

import { memo, startTransition, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  Anchor,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconCalendarClock,
  IconCalendarEvent,
  IconCheck,
  IconEdit,
  IconEditOff,
  IconInbox,
  IconInboxOff,
  IconQrcode,
  IconRss,
  IconTrash,
  IconUpload,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useProgress } from 'react-transition-progress';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { uploadActivityFiles } from '@/libs/supabase/api/storage';
import { systemUrl } from '@/app/routes';
import {
  deleteActivityAction,
  isSubscribed,
  setFeedback,
  subscribeToActivity,
} from '@portal/activities/actions';
import { ActivityFormProps } from '../Forms/ActivityFormModal';
import type { Enums } from '@/libs/supabase/_database';
import { isElevated, isInternal, isPublic } from '@/utils/access-control';
import { useUser } from '@/components/Providers/UserProvider';
import { FacultyAssignmentModal } from '../Forms/FacultyAssignmentModal';
import { revalidate } from '@/app/actions';
import dayjs from '@/libs/dayjs';
import { siteUrl } from '@/utils/url';

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
  const { id: userId, other_roles } = useUser();

  const [editOpened, { open: editOpen, close: editClose }] =
    useDisclosure(false);
  const [assignOpened, { open: assignOpen, close: assignClose }] =
    useDisclosure(false);
  const [localFiles, setLocalFiles] = useState<File[]>();
  const [responses, setResponses] = useState(activity.feedback);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const startProgress = useProgress();

  // convert activity details to form props
  const activityForm: ActivityFormProps = {
    id: activity.id as string,
    title: activity.title as string,
    series: activity.series,
    visibility: activity.visibility ?? 'Everyone',
    handled_by: activity.users?.map((user) => user.id as string) ?? undefined,
    objectives: activity.objectives!,
    date_starting: new Date(activity.date_starting as string),
    date_ending: new Date(activity.date_ending as string),
    image_url: activity.image_url ?? undefined,
  };

  // set activity feedback responses status
  const setActivityFeedback = async (status: boolean) => {
    setLoading(true);
    const response = await setFeedback(activity.id as string, status);

    if (response?.status === 0) {
      notifications.show({
        title: response?.title,
        message: response?.message,
        color: 'green',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    } else {
      notifications.show({
        title: response?.title,
        message: response?.message,
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    }

    setResponses(status);
    setLoading(false);
  };

  const exportQr = async (type: string, link: string) => {
    notifications.show({
      id: 'qr-code',
      loading: true,
      title: 'Generating QR Code',
      message: 'Please wait while we generate the QR code.',
      withBorder: true,
      autoClose: false,
    });

    const QRCode = await import('qrcode');
    const qrImage = await QRCode.toDataURL(link, {
      width: 500,
      margin: 2,
      type: 'image/png',
    });

    notifications.update({
      id: 'qr-code',
      loading: false,
      title: 'QR Code Generated',
      message: `QR Code for ${type} has been generated, downloading...`,
      icon: <IconCheck />,
      withBorder: true,
      autoClose: 5000,
    });

    // download qr code
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `${type}-eval_${activity?.title}.png`;
    a.click();
  };

  useEffect(() => {
    if (role !== 'student' && localFiles?.length && activity.id) {
      // upload files to storage
      const uploadFiles = async () => {
        await uploadActivityFiles(activity.id as string, {
          files: localFiles,
          notify: notifications,
        });

        revalidate(pathname);
      };

      void uploadFiles();
    }
    // ignore pathname from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id, localFiles, role]);

  // check if student is subscribed to activity
  useEffect(() => {
    if (activity.id) {
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
        close={editClose}
        opened={editOpened}
      />
      <FacultyAssignmentModal
        activity={activityForm}
        close={assignClose}
        opened={assignOpened}
      />

      <Group justify="space-between" wrap="wrap-reverse">
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
                {dayjs(activity.date_starting).format('MMM D, YYYY h:mm A')}
                {' - '}
                {dayjs(activity.date_ending).format('MMM D, YYYY h:mm A')}
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

          {isInternal(role) && (
            <Group mb="xs">
              <Text c="dimmed">Feedback:</Text>
              <Group>
                <Tooltip
                  label={
                    responses
                      ? 'Accepting feedback responses'
                      : 'Currently not accepting feedback responses'
                  }
                  position="bottom"
                >
                  <Button
                    color={responses ? 'green' : 'red'}
                    leftSection={
                      responses ? (
                        <IconInbox size={18} />
                      ) : (
                        <IconInboxOff size={18} />
                      )
                    }
                    loaderProps={{ type: 'dots' }}
                    loading={loading}
                    onClick={() => setActivityFeedback(!responses)}
                    size="xs"
                    variant="filled"
                  >
                    {responses ? 'Accepting' : 'Not Accepting'}
                  </Button>
                </Tooltip>

                {/* Feedback links */}
                {responses && (
                  <>
                    {/* Partners Evaluation Link */}
                    <Group gap={4}>
                      <Anchor
                        href={`${siteUrl()}/eval/${activity.id}/partners`}
                        size="xs"
                        target="_blank"
                      >
                        Partners
                      </Anchor>

                      <ActionIcon
                        aria-label="Export Partners' QR"
                        onClick={() =>
                          exportQr(
                            'partners',
                            `${siteUrl()}/eval/${activity.id}/partners`,
                          )
                        }
                        variant="subtle"
                      >
                        <IconQrcode size={18} />
                      </ActionIcon>
                    </Group>

                    <Divider orientation="vertical" />

                    {/* Implementers Evaluation Link */}
                    <Group gap={4}>
                      <Anchor
                        href={`${siteUrl()}/eval/${activity.id}/implementers`}
                        size="xs"
                        target="_blank"
                      >
                        Implementers
                      </Anchor>

                      <ActionIcon
                        aria-label="Export Implementers' QR"
                        onClick={() =>
                          exportQr(
                            'implementers',
                            `${siteUrl()}/eval/${activity.id}/implementers`,
                          )
                        }
                        variant="subtle"
                      >
                        <IconQrcode size={16} />
                      </ActionIcon>
                    </Group>

                    <Divider orientation="vertical" />

                    {/* Beneficiaries Evaluation Link */}
                    <Group gap={4}>
                      <Anchor
                        href={`/eval/${activity.id}/beneficiaries`}
                        size="xs"
                        target="_blank"
                      >
                        Beneficiaries
                      </Anchor>

                      <ActionIcon
                        aria-label="Export Beneficiaries' QR"
                        onClick={() =>
                          exportQr(
                            'beneficiaries',
                            `/eval/${activity.id}/beneficiaries`,
                          )
                        }
                        variant="subtle"
                      >
                        <IconQrcode size={16} />
                      </ActionIcon>
                    </Group>
                  </>
                )}
              </Group>
            </Group>
          )}

          {/* Activity control buttons */}
          <Group gap="xs" mt={16}>
            <>
              {isPublic(role) && (
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
              )}

              <Button.Group>
                {/* Internal-only controls */}
                {isInternal(role) && (
                  <>
                    <Button
                      leftSection={<IconCalendarEvent size={16} />}
                      onClick={editOpen}
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
                  </>
                )}

                {/* Faculty Assignment */}
                {isElevated(role, other_roles) && (
                  <Button
                    disabled={
                      activity.visibility === 'Internal' ||
                      new Date(activity.date_starting!).getTime() <
                        new Date().getTime()
                    }
                    leftSection={<IconUsersGroup size={16} />}
                    onClick={assignOpen}
                    variant="default"
                  >
                    Assign Faculty
                  </Button>
                )}
              </Button.Group>

              {isInternal(role) && (
                <>
                  <Divider orientation="vertical" />

                  <FileButton
                    accept=".odt,.doc,.docx,.pdf,.pptx,.ppt,.xls,.xlsx,.csv,image/*"
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
                    variant="outline"
                  >
                    Delete Activity
                  </Button>
                </>
              )}
            </>
          </Group>
        </Stack>
        <Image
          alt=""
          className="object-contain shadow-sm"
          component={NextImage}
          fallbackSrc="/assets/no-image.png"
          h="auto"
          height={200}
          radius="md"
          src={activity.image_url}
          w="auto"
          width={280}
        />
      </Group>
    </>
  );
}

export const ActivityInfoHeader = memo(ActivityDetailsHeader);
