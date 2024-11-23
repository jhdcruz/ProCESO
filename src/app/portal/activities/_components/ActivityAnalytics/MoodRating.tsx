import { memo } from 'react';
import { Group, Progress, Text, Stack, Tooltip } from '@mantine/core';
import {
  IconMoodSad,
  IconMoodSmile,
  IconMoodHappy,
  IconMoodCrazyHappy,
  IconMoodAngry,
  IconHeartbeat,
} from '@tabler/icons-react';
import utilStyles from '@/styles/Utilties.module.css';

function MoodRatingComponent({ rating }: { rating: number }) {
  const iconSize = 48;

  return (
    <>
      <Group justify="space-between">
        <Group align="flex-end" gap="xs">
          <Text fw={700} fz="lg">
            Satisfaction Rating
          </Text>
        </Group>

        <IconHeartbeat className={utilStyles.icon} size="1.4rem" stroke={1.5} />
      </Group>

      <Text c="dimmed" fz="sm">
        Satisfactory level of the service provided.
      </Text>

      <Stack gap="xs" mt="md">
        {/* Mood Faces */}
        <Group justify="space-around" mt={2}>
          <Tooltip label="Strongly Disapprove" withArrow>
            <IconMoodAngry color="red" size={iconSize} />
          </Tooltip>
          <Tooltip label="Disapprove" withArrow>
            <IconMoodSad color="orange" size={iconSize} />
          </Tooltip>
          <Tooltip label="Neutral" withArrow>
            <IconMoodSmile color="#adb5bd" size={iconSize} />
          </Tooltip>
          <Tooltip label="Approve" withArrow>
            <IconMoodHappy color="#37b24d" size={iconSize} />
          </Tooltip>
          <Tooltip label="Strongly Approve" withArrow>
            <IconMoodCrazyHappy color="lime" size={iconSize} />
          </Tooltip>
        </Group>

        {/* Progress Bar */}
        <Group gap={0} grow mt="xs">
          <Progress
            color="red"
            radius={0}
            value={rating <= 25 ? rating * 4 : 100}
          />
          <Progress
            color="orange"
            radius={0}
            value={rating <= 45 ? Math.max(0, (rating - 25) * 4) : 100}
          />
          <Progress
            color="gray.5"
            radius={0}
            value={rating <= 65 ? Math.max(0, (rating - 45) * 4) : 100}
          />
          <Progress
            color="green"
            radius={0}
            value={rating <= 100 ? Math.max(0, (rating - 65) * 4) : 100}
          />
          <Progress color="lime" radius={0} value={rating === 100 ? 100 : 0} />
        </Group>
      </Stack>
    </>
  );
}

export const MoodRating = memo(MoodRatingComponent);
