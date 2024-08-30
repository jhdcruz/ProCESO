import { memo } from 'react';
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { Tables } from '@/utils/supabase/types';
import {
  IconCalendarClock,
  IconFolders,
  IconTimeline,
} from '@tabler/icons-react';
import { formatDateRange } from 'little-date';
import NextImage from 'next/image';
import Link from 'next/link';
import classes from '@/styles/Card.module.css';

export const EventCard = memo((data: Tables<'events'>) => (
  <Card className={classes.card} p="sm" radius="md" withBorder>
    {data?.image_url && (
      <Card.Section>
        <Image alt="" component={NextImage} height={180} width={340} src={data.image_url} />
      </Card.Section>
    )}

    <Card.Section
      className={classes.section}
      mt={data?.image_url ? 'md' : 'xs'}
    >
      <Text component={Link} fw={500} fz="lg" href={`/events/${data.id}`}>
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

      <Text fz="sm" lineClamp={4} mt="sm">
        {data.description}
      </Text>
    </Card.Section>

    <Group gap="xs" mt="xs" wrap="nowrap">
      <Button
        className="shadow-sm"
        component={Link}
        fullWidth
        href={`events/${data.id}`}
      >
        Show details
      </Button>

      <Tooltip label="View event analytics" multiline withArrow>
        <ActionIcon
          component={Link}
          href={`events/${data.id}/analytics`}
          size="lg"
          variant="default"
        >
          <IconTimeline size={16} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="View uploaded files" multiline withArrow>
        <ActionIcon
          component={Link}
          href={`events/${data.id}/drive`}
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
