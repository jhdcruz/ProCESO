'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { Box, Grid, Paper, Skeleton } from '@mantine/core';
import { StatRatings } from './StatRatings';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';

const EmotionsRadar = dynamic(
  () =>
    import('./EmotionsRadar').then((mod) => ({
      default: mod.EmotionsRadar,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={370} w="100%" />,
  },
);

const SentimentSegments = dynamic(
  () =>
    import('./SentimentSegments').then((mod) => ({
      default: mod.SentimentSegments,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={194} w="100%" />,
  },
);

const EvaluationsTable = dynamic(
  () =>
    import('./EvaluationsTable').then((mod) => ({
      default: mod.EvaluationsTable,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={330} w="100%" />,
  },
);

const WordCloud = dynamic(
  () =>
    import('./WordCloud').then((mod) => ({
      default: mod.WorldCloud,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={600} w="100%" />,
  },
);

function ActivityAnalyticsShell({
  activity,
}: {
  activity: ActivityDetailsProps;
}) {
  const { id } = activity;

  return (
    <Box>
      <StatRatings id={id!} />

      <Grid align="flex-start" justify="space-between">
        <Grid.Col span={{ base: 'auto', md: 12, lg: 8 }}>
          {/* Respondents Table */}
          <Paper
            bg="light-dark(
              var(--mantine-color-gray-0),
              var(--mantine-color-dark-7)
            )"
            p="md"
            shadow="sm"
            withBorder
          >
            <WordCloud id={id!} />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 'auto', md: 12, lg: 4 }}>
          <Paper
            bg="light-dark(
        var(--mantine-color-gray-0),
        var(--mantine-color-dark-7)
      )"
            mb="xs"
            p="md"
            shadow="sm"
            withBorder
          >
            <SentimentSegments id={id!} />
          </Paper>

          <Paper
            bg="light-dark(
          var(--mantine-color-gray-0),
          var(--mantine-color-dark-7)
        )"
            my="xs"
            p="md"
            shadow="sm"
            withBorder
          >
            <EmotionsRadar id={id!} />
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Respondents Table */}
      <Paper
        bg="light-dark(
          var(--mantine-color-gray-0),
          var(--mantine-color-dark-7)
        )"
        p="md"
        shadow="sm"
        withBorder
      >
        <EvaluationsTable activity={activity} />
      </Paper>
    </Box>
  );
}

export const ActivityAnalytics = memo(ActivityAnalyticsShell);
