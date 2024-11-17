'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { Box, Grid, Paper } from '@mantine/core';
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

const EvaluationsTable = dynamic(
  () =>
    import('./EvaluationsTable').then((mod) => ({
      default: mod.EvaluationsTable,
    })),
  {
    ssr: false,
    loading: () => <PageLoader label={false} />,
  },
);

function ActivityAnalyticsShell({ id }: { id: string }) {
  return (
    <Box>
      <StatRatings id={id} />

      <Grid align="flex-start" columns={3} justify="space-between">
        <Grid.Col span="auto">
          {/* Respondents Table */}
          <Paper
            shadow="sm"
            bg="light-dark(
              var(--mantine-color-gray-0),
              var(--mantine-color-dark-7)
            )"
            p="md"
            withBorder
          >
            <EvaluationsTable id={id} />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 'auto', sm: 1 }}>
          <Paper
            shadow="sm"
            bg="light-dark(
        var(--mantine-color-gray-0),
        var(--mantine-color-dark-7)
      )"
            mb="xs"
            p="md"
            withBorder
          >
            <SentimentSegments id={id} />
          </Paper>

          <Paper
            shadow="sm"
            bg="light-dark(
          var(--mantine-color-gray-0),
          var(--mantine-color-dark-7)
        )"
            my="xs"
            p="md"
            withBorder
          >
            <EmotionsRadar id={id} />
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export const ActivityAnalytics = memo(ActivityAnalyticsShell);
