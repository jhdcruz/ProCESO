'use client';

import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  NumberFormatter,
  Progress,
  rem,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import {
  IconDownload,
  IconFileSpreadsheet,
  IconHelpCircle,
  IconSearch,
} from '@tabler/icons-react';
import { createBrowserClient } from '@/libs/supabase/client';
import type { Tables } from '@/libs/supabase/_database';
import type { BeneficiariesFeedbackProps } from '@/app/eval/_components/Forms/BeneficiariesForm';
import type { PartnersFeedbackProps } from '@/app/eval/_components/Forms/PartnersForm';
import type { ImplementerFeedbackProps } from '@/app/eval/_components/Forms/ImplementersForm';
import type {
  Emotions,
  EmotionsResponse,
  SentimentResponse,
} from '@/libs/huggingface/types';
import { notifications } from '@mantine/notifications';
import { getEmotionColor, getEvaluatorColor } from '@/utils/colors';
import { PageLoader } from '@/components/Loader/PageLoader';
import dayjs from '@/libs/dayjs';
import classes from '@/styles/Table.module.css';
import utilStyles from '@/styles/Utilties.module.css';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';

interface EvaluationProps
  extends Omit<
    Tables<'activity_feedback'>,
    'score_emotions' | 'score_sentiment' | 'response'
  > {
  response:
    | BeneficiariesFeedbackProps
    | PartnersFeedbackProps
    | ImplementerFeedbackProps;
  score_emotions: EmotionsResponse | null;
  score_sentiment: SentimentResponse | null;
}

const BeneficiariesForm = dynamic(
  () => import('@/app/eval/_components/Forms/BeneficiariesForm'),
  {
    loading: () => <PageLoader />,
  },
);
const PartnersForm = dynamic(
  () => import('@/app/eval/_components/Forms/PartnersForm'),
  {
    loading: () => <PageLoader />,
  },
);
const ImplementersForm = dynamic(
  () => import('@/app/eval/_components/Forms/ImplementersForm'),
  {
    loading: () => <PageLoader />,
  },
);

export const EvaluationsTable = memo(
  ({ activity }: { activity: ActivityDetailsProps }) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [selected, setSelected] = useState<EvaluationProps>();

    const [data, setData] = useState<EvaluationProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [search, setSearch] = useState<string>('');
    const [query] = useDebouncedValue(search, 200);

    const { id } = activity;

    const handleModal = (row: EvaluationProps) => {
      setSelected(row);
      open();
    };

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
        setLoading(true);
        const supabase = createBrowserClient();

        let db = supabase
          .from('activity_feedback')
          .select()
          .eq('activity_id', id!)
          .order('submitted_at', { ascending: false });

        if (query) {
          // allow search on respondent->name, respondent->email, or id
          db = db.or(
            `response->respondent->>name.ilike.%${query}%,response->respondent->>email.ilike.%${query}%`,
          );
        }

        const { data: results } = await db.returns<EvaluationProps[]>();

        if (results) setData(results);

        setLoading(false);
      };

      void fetchEvals();
    }, [id, query]);

    const rows = data.map((row) => {
      const {
        response,
        score_emotions: emotions,
        score_sentiment: sentiments,
      } = row;

      const sentimentValues = {
        negative: sentiments?.negative ?? 0,
        neutral: sentiments?.neutral ?? 0,
        positive: sentiments?.positive ?? 0,
      };

      const totalSentiment =
        sentimentValues.negative +
        sentimentValues.neutral +
        sentimentValues.positive;

      const sentimentData = {
        negative: (sentimentValues.negative / totalSentiment) * 100,
        neutral: (sentimentValues.neutral / totalSentiment) * 100,
        positive: (sentimentValues.positive / totalSentiment) * 100,
      };

      const emotionTags: string[] = emotions?.emotions.map(
        (emotion) => emotion.label,
      ) ?? ['N/A'];

      return (
        <Table.Tr key={row.id}>
          <Table.Td maw={160}>
            <Stack align="start" gap={2}>
              <Group gap={6}>
                <Anchor
                  component="button"
                  fw={600}
                  fz="sm"
                  maw={110}
                  onClick={() => handleModal(row)}
                  truncate
                >
                  {response?.respondent.name ??
                    response?.respondent.email ??
                    row.id}
                </Anchor>

                <Badge
                  color={getEvaluatorColor(row.type)}
                  size="xs"
                  tt="capitalize"
                  variant="dot"
                >
                  {row.type}
                </Badge>
              </Group>
              <Text c="dimmed" size="xs">
                {dayjs(row.submitted_at).fromNow()}
              </Text>
            </Stack>
          </Table.Td>
          <Table.Td maw={180}>
            <Group gap={4}>
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
            </Group>
          </Table.Td>

          {/* Sentiment Bar */}
          <Table.Td>
            {totalSentiment === 0 ? (
              <Tooltip
                label="Check trigger.dev instance for more details."
                withArrow
              >
                <Text c="gray" fw={700} fz="xs" ta="center">
                  No sentiment data <IconHelpCircle size={16} />
                </Text>
              </Tooltip>
            ) : (
              <>
                <Group justify="space-between">
                  <Text c="red" fw={700} fz="xs">
                    <NumberFormatter
                      decimalScale={1}
                      suffix="%"
                      value={sentimentData.negative}
                    />
                  </Text>
                  <Text c="gray" fw={700} fz="xs">
                    <NumberFormatter
                      decimalScale={1}
                      suffix="%"
                      value={sentimentData.neutral}
                    />
                  </Text>
                  <Text c="teal" fw={700} fz="xs">
                    <NumberFormatter
                      decimalScale={1}
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
              </>
            )}
          </Table.Td>
        </Table.Tr>
      );
    });

    return (
      <>
        <Modal
          onClose={close}
          opened={opened}
          scrollAreaComponent={ScrollArea.Autosize}
          size="xl"
          title="Evaluation Form"
        >
          {selected?.type === 'beneficiaries' && (
            <BeneficiariesForm
              activity={activity}
              feedback={selected.response as BeneficiariesFeedbackProps}
            />
          )}
          {selected?.type === 'partners' && (
            <PartnersForm
              activity={activity}
              feedback={selected.response as PartnersFeedbackProps}
            />
          )}
          {selected?.type === 'implementers' && (
            <ImplementersForm
              activity={activity}
              feedback={selected.response as ImplementerFeedbackProps}
            />
          )}
        </Modal>

        <Group justify="space-between">
          <Group gap="xs">
            <Text fw={700} fz="lg">
              Evaluation Responses
            </Text>
            {loading && <Loader mx={6} size="sm" type="dots" />}
          </Group>

          <IconFileSpreadsheet
            className={utilStyles.icon}
            size="1.4rem"
            stroke={1.5}
          />
        </Group>

        <Text c="dimmed" fz="sm">
          Responses from evaluation participants.
        </Text>

        <Group gap="xs" my="md">
          <TextInput
            bg="light-dark(
            var(--mantine-color-gray-0),
            var(--mantine-color-dark-7)
          )"
            leftSection={<IconSearch size={16} />}
            miw={rem(400)}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search for name or email"
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
                <Table.Th>Respondent</Table.Th>
                <Table.Th>Emotions</Table.Th>
                <Table.Th>Sentiment</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </>
    );
  },
);
EvaluationsTable.displayName = 'EvaluationsTable';
