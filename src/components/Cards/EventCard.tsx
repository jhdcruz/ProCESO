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
import { IconCalendarClock, IconTimeline } from '@tabler/icons-react';
import { formatDateRange } from 'little-date';
import sanitizeHtml from 'sanitize-html';
import { Tables } from '@/libs/supabase/_database';
import classes from '@/components/Cards/Card.module.css';

export const EventCard = memo((data: Tables<'events_details_view'>) => (
  <Card className={classes.card} p="sm" radius="md" shadow="sm" withBorder>
    <Card.Section
      component={Link}
      href={`events/${data.id}/info`}
      prefetch={false}
    >
      {data.series && (
        <Tooltip
          label={`This event is part of "${data.series}" event group.`}
          position="bottom"
        >
          <Badge
            className="absolute left-2 top-2 shadow-md"
            color={data.series_color as string}
            variant="dot"
          >
            {data.series}
          </Badge>
        </Tooltip>
      )}

      <Image
        alt=""
        className="object-scale-down"
        component={NextImage}
        fallbackSrc="/assets/no-image.png"
        h="180"
        height={180}
        src={data.image_url}
        w="326"
        width={326}
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

        <Text fz="sm" lineClamp={2} mt="sm">
          {data.description?.length
            ? sanitizeHtml(data.description, { allowedTags: [] })
            : 'No description provided for this event yet.'}
        </Text>
      </Stack>
    </Card.Section>

    <Group className={classes.links} gap="xs" wrap="nowrap">
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
    </Group>
  </Card>
));

EventCard.displayName = 'EventCard';
