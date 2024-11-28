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
import sanitizeHtml from 'sanitize-html';
import { Tables } from '@/libs/supabase/_database';
import classes from '@/components/Cards/Card.module.css';
import { useUser } from '@/components/Providers/UserProvider';
import dayjs from '@/libs/dayjs';

export const ActivityCard = memo((data: Tables<'activities_details_view'>) => {
  const { role } = useUser();

  return (
    <Card className={classes.card} p="sm" radius="md" shadow="sm" withBorder>
      <Card.Section
        component={Link}
        href={`activities/${data.id}/info`}
        prefetch={false}
      >
        {data.series && (
          <Tooltip
            label={`This activity is part of "${data.series}" activity group.`}
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
          className="object-cover"
          component={NextImage}
          fallbackSrc="/assets/no-image.png"
          h="auto"
          height={180}
          src={data.image_url}
          w={326}
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
              {dayjs(data.date_starting).format('MMMM D, YYYY h:mm A')}
              {' - '}
              {dayjs(data.date_ending).format('MMMM D, YYYY h:mm A')}
            </Badge>
          )}

          <Text fz="sm" lineClamp={2} mt="sm">
            {data.description?.length
              ? sanitizeHtml(data.description, { allowedTags: [] })
              : 'No description provided for this activity yet.'}
          </Text>
        </Stack>
      </Card.Section>

      <Group className={classes.links} gap="xs" wrap="nowrap">
        <Button
          className="shadow-sm"
          component={Link}
          fullWidth
          href={`activities/${data.id}/info`}
          prefetch={false}
        >
          Show details
        </Button>

        {['admin', 'staff'].includes(role!) && (
          <Tooltip label="View activity analytics" multiline withArrow>
            <ActionIcon
              aria-label="View activity analytics"
              component={Link}
              href={`activities/${data.id}/analytics`}
              prefetch={false}
              size="lg"
              variant="default"
            >
              <IconTimeline size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Card>
  );
});
ActivityCard.displayName = 'ActivityCard';
