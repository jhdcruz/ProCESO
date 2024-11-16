'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { Grid, Paper, ScrollArea, rem } from '@mantine/core';
import { PageLoader } from '@/components/Loader/PageLoader';
import { StatRatings } from './StatRatings';

const EmotionsRadar = dynamic(
  () =>
    import('./EmotionsRadar').then((mod) => ({
      default: mod.EmotionsRadar,
    })),
  {
    ssr: false,
    loading: () => <PageLoader label={false} />,
  },
);

const SentimentSegments = dynamic(
  () =>
    import('./SentimentSegments').then((mod) => ({
      default: mod.SentimentSegments,
    })),
  {
    ssr: false,
    loading: () => <PageLoader label={false} />,
  },
);

function ActivityAnalyticsShell({ id }: { id: string }) {
  return (
    <Grid align="flex-start" columns={3} gutter="xs" justify="space-between">
      <Grid.Col span="auto">
        <ScrollArea.Autosize offsetScrollbars type="auto">
          <StatRatings id={id} />
        </ScrollArea.Autosize>
      </Grid.Col>

      <Grid.Col span="content">
        <Paper
          bg="light-dark(
        var(--mantine-color-gray-0),
        var(--mantine-color-dark-7)
      )"
          mb="xs"
          p="md"
          w={{ base: '100%', sm: rem(350) }}
          withBorder
        >
          <SentimentSegments id={id} />
        </Paper>

        <Paper
          bg="light-dark(
          var(--mantine-color-gray-0),
          var(--mantine-color-dark-7)
        )"
          my="xs"
          p="md"
          w={{ base: '100%', sm: rem(350) }}
          withBorder
        >
          <EmotionsRadar id={id} />
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

export const ActivityAnalytics = memo(ActivityAnalyticsShell);
