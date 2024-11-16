'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import {
  Progress,
  Box,
  Text,
  Group,
  SimpleGrid,
  NumberFormatter,
} from '@mantine/core';
import { IconDeviceAnalytics } from '@tabler/icons-react';
import type { SentimentResponse } from '@/libs/huggingface/types';
import { createBrowserClient } from '@/libs/supabase/client';
import { aggregateSentiments } from '@/utils/json-restructure';
import classes from '@/styles/StatSegments.module.css';
import utilStyles from '@/styles/Utilties.module.css';

/**
 * Sentiment progress bar stats.
 *
 * @param data Accumulated sentiments data
 * @returns
 */
function StatsSegmentsComponent({ id }: { id: string }) {
  const [data, setData] = useState<SentimentResponse>({
    negative: 0,
    neutral: 0,
    positive: 0,
  });

  // Calculate percentages using useMemo
  const sentimentPercentages = useMemo(() => {
    const total = data.negative + data.neutral + data.positive;
    if (total === 0) return { negative: 0, neutral: 0, positive: 0 };

    return {
      negative: (data.negative / total) * 100,
      neutral: (data.neutral / total) * 100,
      positive: (data.positive / total) * 100,
    };
  }, [data]);

  useEffect(() => {
    const fetchSentiments = async () => {
      const supabase = createBrowserClient();

      const { data: results } = await supabase
        .from('activity_feedback')
        .select('score_sentiment')
        .eq('activity_id', id)
        .limit(1000);

      if (results)
        setData(
          aggregateSentiments(
            results?.map(
              (r) => r.score_sentiment,
            ) as unknown as SentimentResponse[],
          ),
        );
    };

    void fetchSentiments();
  }, [id]);

  const Segments = () => (
    <>
      <Progress.Section color="red" value={sentimentPercentages.negative}>
        <Progress.Label className={classes.progressLabel}>
          <NumberFormatter
            decimalScale={2}
            suffix="%"
            value={sentimentPercentages.negative}
          />
        </Progress.Label>
      </Progress.Section>

      <Progress.Section color="gray" value={sentimentPercentages.neutral}>
        <Progress.Label className={classes.progressLabel}>
          <NumberFormatter
            decimalScale={2}
            suffix="%"
            value={sentimentPercentages.neutral}
          />
        </Progress.Label>
      </Progress.Section>

      <Progress.Section color="teal" value={sentimentPercentages.positive}>
        <Progress.Label className={classes.progressLabel}>
          <NumberFormatter
            decimalScale={2}
            suffix="%"
            value={sentimentPercentages.positive}
          />
        </Progress.Label>
      </Progress.Section>
    </>
  );

  const Descriptions = () => (
    <>
      <Box className={classes.stat} style={{ borderBottomColor: '#f03e3e' }}>
        <Text mb={4} size="sm">
          Negative
        </Text>
        <Text c="#f03e3e" className={classes.statCount} fw="bold" size="sm">
          <NumberFormatter
            decimalScale={2}
            suffix="%"
            value={sentimentPercentages.negative}
          />
        </Text>
      </Box>
      <Box className={classes.stat} style={{ borderBottomColor: '#495057' }}>
        <Text mb={4} size="sm">
          Neutral
        </Text>
        <Text c="#495057" className={classes.statCount} fw="bold" size="sm">
          <NumberFormatter
            decimalScale={2}
            suffix="%"
            value={sentimentPercentages.neutral}
          />
        </Text>
      </Box>
      <Box className={classes.stat} style={{ borderBottomColor: '#38d9a9' }}>
        <Text mb={4} size="sm">
          Positive
        </Text>
        <Text c="#38d9a9" className={classes.statCount} fw="bold" size="sm">
          <NumberFormatter
            decimalScale={2}
            suffix="%"
            value={sentimentPercentages.positive}
          />
        </Text>
      </Box>
    </>
  );

  // Rest of the component remains the same
  return (
    <>
      <Group justify="space-between">
        <Group align="flex-end" gap="xs">
          <Text fw={700} fz="lg">
            Sentiment Overview
          </Text>
        </Group>

        <IconDeviceAnalytics
          className={utilStyles.icon}
          size="1.4rem"
          stroke={1.5}
        />
      </Group>

      <Text c="dimmed" fz="sm">
        Overall sentiment of respondents
      </Text>

      <Progress.Root
        classNames={{ label: classes.progressLabel }}
        mt="md"
        size={28}
      >
        <Segments />
      </Progress.Root>

      <SimpleGrid cols={{ base: 1, xs: 3 }} mt="md">
        <Descriptions />
      </SimpleGrid>
    </>
  );
}

export const SentimentSegments = memo(StatsSegmentsComponent);
