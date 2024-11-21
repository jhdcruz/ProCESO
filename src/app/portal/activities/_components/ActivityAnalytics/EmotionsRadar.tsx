'use client';

import { memo, useEffect, useState } from 'react';
import { RadarChart } from '@mantine/charts';
import { Center, Button, Group, Text, Tooltip } from '@mantine/core';
import { IconChartRadar } from '@tabler/icons-react';
import { createBrowserClient } from '@/libs/supabase/client';
import type { EmotionsResponse } from '@/libs/huggingface/types';
import {
  type CategorizedEmotions,
  aggregateCommonEmotions,
  aggregateEmotions,
} from '@/utils/json-restructure';
import classes from '@/styles/Utilties.module.css';
import { getEvaluatorColor } from '@/utils/colors';

function EmotionsRadarComponent({ id }: { id: string }) {
  const [data, setData] = useState<EmotionsResponse[]>([]);
  const [processed, setProcessed] = useState<CategorizedEmotions[]>([]);

  // filters
  const [neutral, showNeutral] = useState<boolean>(false);
  const [common, showCommon] = useState<boolean>(true);

  useEffect(() => {
    const fetchEmotions = async () => {
      const supabase = createBrowserClient();

      const { data: results } = await supabase
        .from('activity_feedback')
        .select('type, score_emotions->emotions')
        .eq('activity_id', id)
        .not('score_emotions', 'is', null)
        .limit(1000)
        .returns<EmotionsResponse[]>();

      // exclude neutral from results, overwhelms the rest of the emotions
      if (results) setData(results);
    };

    void fetchEmotions();
  }, [id]);

  useEffect(() => {
    if (common) {
      setProcessed(aggregateCommonEmotions(data, neutral));
    } else {
      setProcessed(aggregateEmotions(data, neutral));
    }
  }, [common, neutral, data]);

  return (
    <>
      <Group justify="space-between">
        <Group align="flex-end" gap="xs">
          <Text fw={700} fz="lg">
            Emotional Impact
          </Text>
        </Group>

        <IconChartRadar className={classes.icon} size="1.4rem" stroke={1.5} />
      </Group>

      <Text c="dimmed" fz="sm">
        Common emotions across all feedback types.
      </Text>

      <Group gap={4} mt={4} wrap="nowrap">
        <Tooltip
          label="Filters common emotions across response types"
          multiline
          openDelay={300}
          withArrow
        >
          <Button
            color={common ? 'brand' : ''}
            onClick={() => showCommon(!common)}
            size="compact-xs"
            variant={common ? 'light' : 'default'}
          >
            Common
          </Button>
        </Tooltip>

        <Tooltip
          label="Show neutral emotion on the chart"
          multiline
          openDelay={300}
          withArrow
        >
          <Button
            color={neutral ? 'blue' : ''}
            onClick={() => showNeutral(!neutral)}
            size="compact-xs"
            variant={neutral ? 'light' : 'default'}
          >
            Neutral
          </Button>
        </Tooltip>
      </Group>

      {processed.length == 0 ? (
        <Center h={360}>
          <Text c="dimemd" fs="italic" my="xs" size="xs" ta="center">
            No available data on current filter, <br />
            try turning &quot;common&quot; setting off.
          </Text>
        </Center>
      ) : (
        <RadarChart
          data={processed}
          dataKey="label"
          h={360}
          series={[
            {
              label: 'Partners',
              name: 'partners',
              color: getEvaluatorColor('partners'),
              opacity: 0.2,
            },
            {
              label: 'Implementers',
              name: 'implementers',
              color: getEvaluatorColor('implementers'),
              opacity: 0.2,
            },
            {
              label: 'Beneficiaries',
              name: 'beneficiaries',
              color: getEvaluatorColor('beneficiaries'),
              opacity: 0.2,
            },
          ]}
          w="100%"
          withLegend
        />
      )}
    </>
  );
}

export const EmotionsRadar = memo(EmotionsRadarComponent);
