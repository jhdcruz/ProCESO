'use client';

import { memo, useDeferredValue, useEffect, useState } from 'react';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  NumberFormatter,
  Pill,
  Progress,
  rem,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { createBrowserClient } from '@/libs/supabase/client';
import { IconDownload, IconSearch } from '@tabler/icons-react';
import type { Tables } from '@/libs/supabase/_database';
import type { BeneficiariesFeedbackProps } from '@/app/eval/_components/Forms/BeneficiariesForm';
import type { PartnersFeedbackProps } from '@/app/eval/_components/Forms/PartnersForm';
import type { ImplementerFeedbackProps } from '@/app/eval/_components/Forms/ImplementersForm';
import type {
  Emotions,
  EmotionsResponse,
  SentimentResponse,
} from '@/libs/huggingface/types';
import classes from '@/styles/Table.module.css';
import { notifications } from '@mantine/notifications';
import { getEmotionColor, getEvaluatorColor } from '@/utils/colors';

interface EvaluationProps
  extends Omit<
    Tables<'activity_feedback'>,
    'score_emotions' | 'score_sentiment' | 'response'
  > {
  response:
    | BeneficiariesFeedbackProps
    | PartnersFeedbackProps
    | ImplementerFeedbackProps;
  score_emotions: EmotionsResponse;
  score_sentiment: SentimentResponse;
}

export const EvaluationsTable = memo(({ id }: { id: string }) => {
  const [data, setData] = useState<EvaluationProps[]>([]);

  const [search, setSearch] = useState<string>('');
  const query = useDeferredValue(search);

  const handleExport = async () => {
    notifications.show({
      id: 'export',
      loading: true,
      message: 'Processing export request...',
      color: 'brand',
      withBorder: true,
    });

    const response = await fetch(`/api/activities/export?id=${id}`, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });

    if (response.ok) {
      notifications.show({
        id: 'export',
        loading: false,
        title: 'Processing completed',
        message: 'Downloading file...',
        color: 'brand',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations-${id}.csv`;
      a.click();
    } else {
      notifications.show({
        id: 'export',
        loading: false,
        title: 'Export request failed',
        message: response.statusText,
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    }
  };

  useEffect(() => {
    const fetchEvals = async () => {
      const supabase = createBrowserClient();

      let db = supabase
        .from('activity_feedback')
        .select()
        .eq('activity_id', id)
        .order('submitted_at', { ascending: false });

      if (query) {
        // allow search on respondent->name, respondent->email, or id
        db = db.or(
          `response->respondent(name,email).ilike.%${query}%,id.ilike.%${query}%`,
        );
      }

      const { data: results } = await db.returns<EvaluationProps[]>();

      if (results) setData(results);
    };

    void fetchEvals();
  }, [id, query]);

  const rows = data.map((row) => {
    const {
      response,
      score_emotions: emotions,
      score_sentiment: sentiments,
    } = row;

    const totalSentiment =
      sentiments?.negative + sentiments?.neutral + sentiments?.positive;
    const sentimentData = {
      negative: (sentiments?.negative / totalSentiment) * 100,
      neutral: (sentiments?.neutral / totalSentiment) * 100,
      positive: (sentiments?.positive / totalSentiment) * 100,
    };

    const emotionTags: string[] = emotions.emotions.map(
      (emotion) => emotion.label,
    );

    return (
      <Table.Tr key={row.id}>
        <Table.Td>
          <Badge
            color={getEvaluatorColor(row.type)}
            size="sm"
            tt="capitalize"
            variant="dot"
          >
            {row.type}
          </Badge>
        </Table.Td>

        <Table.Td>
          <Anchor component="button" fz="sm" truncate>
            {response?.respondent.name ?? response?.respondent.email ?? row.id}
          </Anchor>
        </Table.Td>
        <Table.Td>
          {emotionTags.map((tag) => (
            <Badge
              autoContrast
              color={getEmotionColor(tag as keyof Emotions)}
              key={tag}
              size="sm"
              tt="capitalize"
              variant="light"
            >
              {tag}
            </Badge>
          ))}
        </Table.Td>

        {/* Sentiment Bar */}
        <Table.Td>
          <Group justify="space-between">
            <Text c="red" fw={700} fz="xs">
              <NumberFormatter
                decimalScale={2}
                suffix="%"
                value={sentimentData.negative}
              />
            </Text>
            <Text c="gray" fw={700} fz="xs">
              <NumberFormatter
                decimalScale={2}
                suffix="%"
                value={sentimentData.neutral}
              />
            </Text>
            <Text c="teal" fw={700} fz="xs">
              <NumberFormatter
                decimalScale={2}
                suffix="%"
                value={sentimentData.positive}
              />
            </Text>
          </Group>
          <Progress.Root>
            <Progress.Section
              className={classes.progressSection}
              color="red"
              value={sentimentData.negative}
            />
            <Progress.Section
              className={classes.progressSection}
              color="gray"
              value={sentimentData.neutral}
            />
            <Progress.Section
              className={classes.progressSection}
              color="teal"
              value={sentimentData.positive}
            />
          </Progress.Root>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Group mb="xs">
        <TextInput
          bg="light-dark(
            var(--mantine-color-gray-0),
            var(--mantine-color-dark-7)
          )"
          leftSection={<IconSearch size={16} />}
          miw={rem(400)}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search for name, email or uuid"
          value={search}
        />

        <Button
          onClick={handleExport}
          rightSection={<IconDownload size={16} stroke={1.5} />}
          variant="default"
        >
          Export
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={600}>
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Type</Table.Th>
              <Table.Th>Respondent</Table.Th>
              <Table.Th>Emotions</Table.Th>
              <Table.Th>Sentiment</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Box>
  );
});
EvaluationsTable.displayName = 'EvaluationsTable';
