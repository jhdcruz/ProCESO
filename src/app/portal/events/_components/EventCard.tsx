import { memo } from 'react';
import NextImage from 'next/image';
import { Link } from 'react-transition-progress/next';
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendarClock,
  IconFolders,
  IconTimeline,
} from '@tabler/icons-react';
import { formatDateRange } from 'little-date';
import { Tables } from '@/utils/supabase/types';
import classes from '@/styles/Card.module.css';

export const EventCard = memo((data: Tables<'events'>) => (
  <Card className={classes.card} p="sm" radius="md" withBorder>
    <Card.Section
      component={Link}
      href={`events/${data.id}/info`}
      prefetch={false}
    >
      <Image
        alt=""
        className="object-scale-down"
        component={NextImage}
        fallbackSrc="/assets/no-image.png"
        h="180"
        height={180}
        src={data.image_url}
        w="320"
        width={320}
      />
    </Card.Section>

    <Card.Section
      className={classes.section}
      mt={data?.image_url ? 'md' : 'xs'}
    >
      <Stack align="stretch" gap={0} justify="flex-start">
        <Text fw={500} fz="lg">
          {data.title}
        </Text>
        {/* Date range badge label */}
        {data.date_starting && data.date_ending && (
          <Badge
            leftSection={<IconCalendarClock size={16} />}
            my="xs"
            variant="light"
          >
            {formatDateRange(
              new Date(data.date_starting),
              new Date(data.date_ending),
              {
                includeTime: true,
              },
            )}
          </Badge>
        )}
        {/* TODO: show other details, except description. */}
      </Stack>
    </Card.Section>

    <Group gap="xs" mt="xs" wrap="nowrap">
      <Button
        className="shadow-sm"
        component={Link}
        fullWidth
        href={`events/${data.id}/info`}
        prefetch={false}
      >
        Show details
      </Button>

      <Tooltip label="View event analytics" multiline withArrow>
        <ActionIcon
          component={Link}
          href={`events/${data.id}/analytics`}
          prefetch={false}
          size="lg"
          variant="default"
        >
          <IconTimeline size={16} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="View uploaded files" multiline withArrow>
        <ActionIcon
          component={Link}
          href={`events/${data.id}/storage`}
          prefetch={false}
          size="lg"
          variant="default"
        >
          <IconFolders size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  </Card>
));

EventCard.displayName = 'EventCard';
