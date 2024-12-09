import { memo, useEffect, useState } from 'react';
import {
  Button,
  Group,
  Text,
  Tooltip,
  Spoiler,
  TypographyStylesProvider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconFileExport,
  IconFileTextAi,
  IconFileTextSpark,
} from '@tabler/icons-react';
import sanitizeHtml from 'sanitize-html';
import { createBrowserClient } from '@/libs/supabase/client';
import { triggerSummary } from './analytics.actions';
import type { RatingsProps } from './StatRatings';
import utilStyles from '@/styles/Utilties.module.css';

function Summary({
  id,
  ratings,
  partners,
  implementers,
  beneficiaries,
}: {
  id: string;
  ratings: RatingsProps;
  partners: number;
  implementers: number;
  beneficiaries: number;
}) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const total = partners + implementers + beneficiaries;

  const handleGenerate = async () => {
    setLoading(true);
    notifications.show({
      id: 'summary',
      loading: true,
      title: 'Generating summary',
      message: 'Please wait...',
      withBorder: true,
      autoClose: false,
    });

    await triggerSummary(id, ratings, {
      partners,
      implementers,
      beneficiaries,
      total,
    });

    void fetchSummary(id);

    notifications.update({
      id: 'summary',
      loading: false,
      icon: <IconCheck />,
      message: 'Summary generated successfully',
      withBorder: true,
      autoClose: 4000,
    });

    setLoading(false);
  };

  const handleExport = async () => {
    setLoading(true);

    notifications.show({
      id: 'export',
      loading: true,
      title: 'Exporting summary',
      message: 'Please wait...',
      withBorder: true,
      autoClose: false,
    });

    const [
      unifiedLib,
      markdown,
      docx,
      rehypeRemark,
      rehypeParse,
      remarkStringify,
    ] = await Promise.all([
      import('unified').then((u) => u.unified),
      import('remark-parse').then((r) => r.default),
      import('remark-docx').then((d) => d.default),
      import('rehype-remark').then((r) => r.default),
      import('rehype-parse').then((r) => r.default),
      import('remark-stringify').then((r) => r.default),
    ]);

    // HTML >> MD
    const htmProcessor = await unifiedLib()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkStringify)
      .process(summary);

    // MD >> DOCX
    const mdProcessor = unifiedLib()
      .use(markdown)
      // @ts-expect-error i dunno
      .use(docx, { output: 'blob' });

    const doc = await mdProcessor.process(String(htmProcessor));
    const blob = (await doc.result) as Blob;

    // download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${id}.docx`;
    a.click();

    notifications.update({
      id: 'export',
      loading: false,
      icon: <IconCheck />,
      message: 'Summary exported successfully',
      withBorder: true,
      autoClose: 4000,
    });

    setLoading(false);
  };

  const fetchSummary = async (activity: string) => {
    setLoading(true);
    const supabase = createBrowserClient();

    const { data } = await supabase
      .from('analytics_metadata')
      .select('content, updated_at')
      .eq('activity_id', activity)
      .eq('type', 'summary')
      .limit(1)
      .maybeSingle();

    setSummary(data?.content ?? '');
    setLoading(false);
  };

  useEffect(() => {
    void fetchSummary(id);
  }, [id]);

  return (
    <>
      <Group justify="space-between">
        <Group align="flex-end" gap="xs">
          <Text fw={700} fz="lg">
            Evaluation Summary
          </Text>
        </Group>

        <Group gap="xs">
          <Tooltip
            label="Generate a summary report sparingly, preferably after the evaluation period."
            multiline
            withArrow
          >
            <Button
              disabled={loading || total === 0}
              leftSection={<IconFileTextSpark size={14} />}
              loaderProps={{ type: 'dots' }}
              onClick={() => handleGenerate()}
              size="xs"
              variant="light"
            >
              {summary === '' ? 'Generate' : 'Regenerate'}
            </Button>
          </Tooltip>

          <Button
            disabled={summary.length === 0}
            leftSection={<IconFileExport size={14} />}
            loaderProps={{ type: 'dots' }}
            onClick={() => handleExport()}
            size="xs"
            variant="default"
          >
            Export
          </Button>

          <IconFileTextAi
            className={utilStyles.icon}
            size="1.4rem"
            stroke={1.5}
          />
        </Group>
      </Group>

      <Spoiler hideLabel="Show less" maxHeight={158} showLabel="Show more">
        {summary ? (
          <TypographyStylesProvider mt="xs">
            <article
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(summary) }}
            />
          </TypographyStylesProvider>
        ) : (
          <div>
            <Text c="dimmed" fs="italic" my="xs" size="sm">
              No generated summary yet.
            </Text>
          </div>
        )}
      </Spoiler>
    </>
  );
}

export const SummaryText = memo(Summary);
