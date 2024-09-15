import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Grid, Group, Avatar, Text, Loader } from '@mantine/core';
import { EventDetailsProps, EventFacultiesResponse } from '@/api/types';
import dayjs from '@/utils/dayjs';
import { getAssignedFaculties } from '@/api/supabase/faculty-assignments';
import { notifications } from '@mantine/notifications';

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
  const [faculties, setFaculties] = useState<EventFacultiesResponse>();

  // get assigned faculties for the event
  useEffect(() => {
    const fetchFaculties = async () => {
      const response = await getAssignedFaculties({
        eventId: event?.id ?? '',
      });

      if (response?.status !== 0) {
        notifications.show({
          title: 'Cannot get assigned faculties',
          message: response.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      setFaculties(response);
    };

    void fetchFaculties();
  }, [event?.id]);

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
          <Text c="dimmed" size="sm">
            Published by
          </Text>
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
        </>

        <>
          <Text c="dimmed" size="sm">
            Handled by
          </Text>
          {faculties?.data ? (
            <>
              {faculties?.data?.length ? (
                <>
                  {faculties?.data?.map((faculty) => (
                    <Group key={faculty?.faculty_email} my={16}>
                      <Avatar
                        alt={faculty?.faculty_name ?? ''}
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
      </Grid.Col>
    </Grid>
  );
}

export const EventInfoBody = memo(EventDetailsBody);
