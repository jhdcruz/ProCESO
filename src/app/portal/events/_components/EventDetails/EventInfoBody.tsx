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
import type { Tables } from '@/libs/supabase/_database';
import { EventDetailsProps } from '@/libs/supabase/api/_response';
import { getAssignedFaculties } from '@/libs/supabase/api/faculty-assignments';
import { getEventReports } from '@/libs/supabase/api/storage';
import {
  IconFileText,
  IconRosetteDiscountCheck,
  IconScanEye,
  IconUsersGroup,
} from '@tabler/icons-react';
import { downloadEventFile } from '@portal/events/actions';
import dayjs from '@/libs/dayjs';

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
 * Description of the event with aside information
 * for published by, date created and updated, etc.
 */
function EventDetailsBody({
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
  const clipboard = useClipboard({ timeout: 1000 });

  const [faculties, setFaculties] = useState<
    Tables<'events_faculties_view'>[] | null
  >();
  const [files, setFiles] = useState<Tables<'event_files'>[] | null>();

  const saveFile = async (fileName: string, checksum: string) => {
    notifications.show({
      id: checksum,
      loading: true,
      title: `Downloading ${fileName}`,
      message: 'It may open in a new tab instead of downloading.',
      color: 'gray',
      withBorder: true,
    });

    const blob = await downloadEventFile(event.id!, checksum);

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

  // fetch additional event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      const getAssigned = getAssignedFaculties({
        eventId: event.id!,
      });

      const getFiles = getEventReports(event.id!);

      const [eventFiles, eventFaculties] = await Promise.all([
        getFiles,
        getAssigned,
      ]);

      if (eventFaculties?.status !== 0) {
        notifications.show({
          title: 'Cannot get assigned faculties',
          message: eventFaculties.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      if (eventFiles?.status !== 0) {
        notifications.show({
          title: 'Cannot get event files',
          message: eventFiles.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      setFaculties(eventFaculties?.data);
      setFiles(eventFiles?.data);
    };

    void fetchEventDetails();
  }, [event.id]);

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, sm: 'auto' }}>
        <RTEditor
          content={content}
          editable={editable}
          loading={loading}
          onSubmit={onSave}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 3 }}>
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
              alt={event.created_by!}
              color="initials"
              radius="xl"
              src={event.creator_avatar}
            />
            <div>
              <Text lineClamp={1} size="sm">
                {event.created_by}
              </Text>
              <Text c="dimmed" size="xs">
                {dayjs(event.created_at).fromNow()}
              </Text>
            </div>
          </Group>
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
                        alt={faculty?.faculty_name!}
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

        {files && (
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

            {files.map((file) => (
              <>
                <Group align="flex-start" gap={8} key={file.checksum} my={16}>
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
                          leftSection={<IconRosetteDiscountCheck size={16} />}
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
        )}
      </Grid.Col>
    </Grid>
  );
}

export const EventInfoBody = memo(EventDetailsBody);
