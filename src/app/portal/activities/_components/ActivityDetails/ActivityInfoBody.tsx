import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Grid,
  Group,
  Avatar,
  Divider,
  Text,
  Loader,
  Badge,
  Anchor,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import type { Enums, Tables } from '@/libs/supabase/_database';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { getAssignedFaculties } from '@/libs/supabase/api/faculty-assignments';
import { getActivityReports } from '@/libs/supabase/api/storage';
import {
  IconFileText,
  IconRosetteDiscountCheck,
  IconScanEye,
  IconUsersGroup,
} from '@tabler/icons-react';
import { downloadActivityFile } from '@portal/activities/actions';
import dayjs from '@/libs/dayjs';
import { isElevated, isInternal } from '@/utils/access-control';

const RTEditor = dynamic(
  () =>
    import('@/components/RTEditor/RTEditor').then((mod) => ({
      default: mod.RTEditor,
    })),
  {
    loading: () => <Loader className="mx-auto my-5" size="md" type="dots" />,
    ssr: false,
  },
);

/**
 * Description of the activity with aside information
 * for published by, date created and updated, etc.
 */
function ActivityDetailsBody({
  role,
  content,
  activity,
  editable,
  loading,
  onSave,
}: {
  role: Enums<'roles_user'>;
  content: string | null;
  activity: ActivityDetailsProps;
  editable: boolean;
  loading: boolean;
  onSave: (content: string) => void;
}) {
  const clipboard = useClipboard({ timeout: 1000 });

  const [faculties, setFaculties] = useState<
    Tables<'activities_faculties_view'>[] | null
  >();
  const [files, setFiles] = useState<Tables<'activity_files'>[] | null>();

  const saveFile = async (fileName: string, checksum: string) => {
    notifications.show({
      id: checksum,
      loading: true,
      title: `Downloading ${fileName}`,
      message: 'It may open in a new tab instead of downloading.',
      color: 'gray',
      withBorder: true,
    });

    const blob = await downloadActivityFile(activity.id as string, checksum);

    notifications.show({
      id: checksum,
      loading: false,
      title: blob.title,
      message: blob.message,
      color: blob.status === 0 ? 'green' : 'red',
      withBorder: true,
      withCloseButton: true,
      autoClose: 4000,
    });

    if (blob?.data) {
      const url = URL.createObjectURL(blob.data);
      window.open(url, '_blank');
    }
  };

  // show notification when email is copied to clipboard
  useEffect(() => {
    // fixes notification appearing twice
    if (clipboard.copied) {
      notifications.show({
        message: 'Checksum copied to clipboard',
        color: 'green',
        withBorder: true,
        withCloseButton: true,
        autoClose: 1400,
      });
    }
  }, [clipboard.copied]);

  // fetch additional activity details
  useEffect(() => {
    const fetchActivityDetails = async () => {
      const getAssigned = getAssignedFaculties({
        activityId: activity.id as string,
      });

      let getFiles;
      if (isInternal(role)) {
        getFiles = getActivityReports(activity.id as string);
      }

      const [activityFiles, activityFaculties] = await Promise.all([
        getFiles,
        getAssigned,
      ]);

      if (activityFaculties?.status !== 0) {
        notifications.show({
          title: 'Cannot get assigned faculties',
          message: activityFaculties.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      if (getFiles && activityFiles?.status !== 0) {
        notifications.show({
          title: 'Cannot get activity files',
          message: activityFiles?.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      setFaculties(activityFaculties?.data);
      setFiles(activityFiles?.data ?? null);
    };

    void fetchActivityDetails();
  }, [activity.id, role]);

  return (
    <Grid grow gutter="xl">
      <Grid.Col span={{ base: 12, xs: 9 }}>
        <RTEditor
          content={content}
          editable={editable}
          loading={loading}
          onSubmit={onSave}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, xs: 3 }}>
        <>
          {isElevated(role) && (
            <>
              <Divider
                label={
                  <Group gap={0} preventGrowOverflow wrap="nowrap">
                    <IconScanEye className="mr-2" size={16} />
                    Published by
                  </Group>
                }
                labelPosition="left"
                mt="xs"
                my="md"
              />

              <Group my={16}>
                <Avatar
                  alt={activity.created_by as string}
                  color="initials"
                  radius="xl"
                  src={activity.creator_avatar}
                />
                <div>
                  <Text lineClamp={1} size="sm">
                    {activity.created_by}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {dayjs(activity.created_at).fromNow()}
                  </Text>
                </div>
              </Group>
            </>
          )}
        </>

        <>
          <Divider
            label={
              <Group gap={0} preventGrowOverflow wrap="nowrap">
                <IconUsersGroup className="mr-2" size={16} />
                Faculty
              </Group>
            }
            labelPosition="left"
            mt="xs"
            my="md"
          />

          {faculties ? (
            <>
              {faculties.length ? (
                <>
                  {faculties.map((faculty) => (
                    <Group key={faculty?.faculty_email} my={16}>
                      <Avatar
                        alt={faculty?.faculty_name as string}
                        color="initials"
                        radius="xl"
                        src={faculty?.faculty_avatar}
                      />
                      <div>
                        <Text lineClamp={1} size="sm">
                          {faculty?.faculty_name}
                        </Text>
                        <Text c="dimmed" mt={2} size="xs">
                          {faculty?.faculty_email}
                        </Text>
                      </div>
                    </Group>
                  ))}
                </>
              ) : (
                <Text>No faculties assigned</Text>
              )}
            </>
          ) : (
            <Loader className="mx-auto my-5" size="sm" type="dots" />
          )}
        </>

        {isElevated(role) && files && (
          <>
            <Divider
              label={
                <Group gap={0} preventGrowOverflow wrap="nowrap">
                  <IconFileText className="mr-2" size={16} />
                  Reports
                </Group>
              }
              labelPosition="left"
              mt="xs"
              my="md"
            />

            {files.length > 0 ? (
              <>
                {files.map((file) => (
                  <>
                    <Group
                      align="flex-start"
                      gap={8}
                      key={file.checksum}
                      my={16}
                    >
                      <Badge mr={4} size="sm" variant="default">
                        {file.type.split('/')[1]}
                      </Badge>

                      <div>
                        <Anchor
                          component="button"
                          fw={500}
                          lineClamp={1}
                          onClick={() => saveFile(file.name, file.checksum)}
                          size="sm"
                        >
                          {file.name}
                        </Anchor>
                        <Group gap={2} mt={4}>
                          <Text c="dimmed" size="xs">
                            {dayjs(file.uploaded_at).fromNow()}
                          </Text>

                          <Tooltip label="Verified checksum of the uploaded file, should match the downloaded file.">
                            <Badge
                              className="cursor-pointer"
                              color="gray"
                              leftSection={
                                <IconRosetteDiscountCheck size={16} />
                              }
                              onClick={() => clipboard.copy(file.checksum)}
                              size="xs"
                              variant="transparent"
                            >
                              {file.checksum.slice(0, 8)}
                            </Badge>
                          </Tooltip>
                        </Group>
                      </div>
                    </Group>
                  </>
                ))}
              </>
            ) : (
              <Text c="dimmed" fs="italic" mt="xs" size="xs" ta="center">
                No reports uploaded yet.
              </Text>
            )}
          </>
        )}
      </Grid.Col>
    </Grid>
  );
}

export const ActivityInfoBody = memo(ActivityDetailsBody);
