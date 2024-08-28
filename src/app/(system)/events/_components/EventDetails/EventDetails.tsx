'use client';

import { Suspense, memo, lazy, useState } from 'react';
import {
  Avatar,
  Badge,
  Container,
  Grid,
  Group,
  Text,
  Loader,
  Space,
  Image,
  Title,
  Button,
  rem,
} from '@mantine/core';
import type { Tables } from '@/utils/supabase/types';
import dayjs from '@/utils/dayjs';
import '@mantine/tiptap/styles.css';
import NextImage from 'next/image';
import {
  IconCalendarClock,
  IconEdit,
  IconCircleCheck,
} from '@tabler/icons-react';
import { formatDateRange } from 'little-date';

export interface EventDetailsProps extends Partial<Tables<'events'>> {
  users: Partial<Tables<'users'>> | null;
}

const RichEditor = lazy(() => import('@/components/RichTextEditor/RichEditor'));

function EventDetailsHeader({
  event,
  editable,
  toggleEdit,
}: {
  event: EventDetailsProps;
  editable: boolean;
  toggleEdit: () => void;
}) {
  return (
    <Group justify="space-between">
      <div>
        {/* Only display image when available */}
        {event?.image_url && (
          <Image
            alt=""
            component={NextImage}
            h={300}
            height={300}
            mb={16}
            radius="md"
            src={event.image_url}
            w={300}
            width={300}
          />
        )}
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
      </div>

      <Group>
        <Button
          autoContrast
          leftSection={
            editable ? (
              <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
            ) : (
              <IconEdit style={{ width: rem(16), height: rem(16) }} />
            )
          }
          onClick={toggleEdit}
          variant={editable ? 'filled' : 'default'}
        >
          {editable ? 'Save Changes' : 'Edit Event'}
        </Button>
      </Group>
    </Group>
  );
}

function EventDetailsContent({
  event,
  editable,
}: {
  event: EventDetailsProps;
  editable: boolean;
}) {
  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, sm: 'auto' }}>
        <Suspense
          fallback={<Loader className="mx-auto my-5" size="md" type="dots" />}
        >
          <RichEditor content={event?.description} editable={editable} />
        </Suspense>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 3 }}>
        <Text c="dimmed">Published by</Text>
        <Group my={16}>
          <Avatar
            alt={event?.users?.name}
            color="initials"
            radius="xl"
            src={event?.users?.avatar_url}
          />
          <div>
            <Text lineClamp={1} size="sm">
              {event?.users?.name}
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

export const EventDetails = memo((event: EventDetailsProps) => {
  const [editable, setEditable] = useState(false);

  return (
    <Container fluid>
      <EventDetailsHeader
        editable={editable}
        event={event}
        toggleEdit={() => setEditable(!editable)}
      />
      <Space h={12} />
      <EventDetailsContent editable={editable} event={event} />
    </Container>
  );
});
EventDetails.displayName = 'EventDetails';
