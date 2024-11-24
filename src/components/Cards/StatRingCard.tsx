import { memo, ReactNode } from 'react';
import {
  Paper,
  Group,
  Text,
  RingProgress,
  Center,
  NumberFormatter,
  rem,
} from '@mantine/core';

export const StatsRingCard = memo(
  ({
    label,
    value,
    color,
    icon,
  }: {
    label: string;
    value: number;
    color: string;
    icon?: ReactNode;
  }) => (
    <Paper
      bg="light-dark(
    var(--mantine-color-gray-0),
    var(--mantine-color-dark-7)
  )"
      mx={{ base: 'auto', sm: 0 }}
      p="md"
      shadow="xs"
      w={{ base: '100%', sm: rem(240) }}
      withBorder
    >
      <Group>
        <RingProgress
          label={<Center>{icon}</Center>}
          roundCaps
          sections={[{ value: value, color }]}
          size={80}
          thickness={8}
        />

        <div>
          <Text c="dimmed" fw={700} size="xs" tt="uppercase">
            {label}
          </Text>
          <Text fw={700} size="xl">
            {value > 0 ? (
              <NumberFormatter decimalScale={1} suffix="%" value={value} />
            ) : (
              '--'
            )}
          </Text>
        </div>
      </Group>
    </Paper>
  ),
);
StatsRingCard.displayName = 'StatsRingCard';
