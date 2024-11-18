'use client';

import { memo, useEffect, useState } from 'react';
import { RadarChart } from '@mantine/charts';
import { Group, Text } from '@mantine/core';
import { IconChartRadar } from '@tabler/icons-react';
import { createBrowserClient } from '@/libs/supabase/client';
import type { EmotionsResponse } from '@/libs/huggingface/types';
import {
  type CategorizedEmotions,
  aggregateCommonEmotions,
} from '@/utils/json-restructure';
import classes from '@/styles/Utilties.module.css';
import { getEvaluatorColor } from '@/utils/colors';

function EmotionsRadarComponent({ id }: { id: string }) {
  const [data, setData] = useState<CategorizedEmotions[]>([]);

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

      if (results) setData(aggregateCommonEmotions(results));
    };

    void fetchEmotions();
  }, [id]);

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
        Analyzed emotions of evaluation respondents.
      </Text>
      <RadarChart
        data={data}
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
    </>
  );
}

export const EmotionsRadar = memo(EmotionsRadarComponent);
