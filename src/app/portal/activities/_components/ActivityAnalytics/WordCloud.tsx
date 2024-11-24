import { memo, useEffect, useRef } from 'react';
import { Text, Group, Box, Image } from '@mantine/core';
import { IconDeviceAnalytics } from '@tabler/icons-react';
import utilStyles from '@/styles/Utilties.module.css';
import { createBrowserClient } from '@/libs/supabase/client';
import { notifications } from '@mantine/notifications';

// TODO: Use types from /eval forms
//       currently having a hard time using union types.
interface ResponseData {
  response: {
    reflections?: {
      interpersonal?: string;
      productivity?: string;
      social?: string;
    };
    sentiments?: {
      beneficial?: string;
      improve?: string;
      comments?: string;
      learning?: string;
      value?: string;
    };
    implementations?: Array<{ remarks: string }>;
    objectives?: Array<{ remarks: string }>;
    outcomes?: Array<{ remarks: string }>;
    feedback?: Array<{ remarks: string }>;
  };
}

function WordCloudComponent({ id }: { id: string }) {
  const image = useRef('');

  useEffect(() => {
    const generateCloud = async () => {
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('activity_feedback')
        .select('response')
        .eq('activity_id', id);

      if (error) {
        notifications.show({
          title: 'Unable to generate word cloud',
          message: error.message,
          autoClose: 4000,
          withBorder: true,
        });
        return;
      }

      const response = (data as ResponseData[])?.[0]?.response;

      const sentiments: string[] =
        [
          response?.reflections?.interpersonal,
          response?.reflections?.productivity,
          response?.reflections?.social,
          response?.sentiments?.beneficial,
          response?.sentiments?.improve,
          response?.sentiments?.comments,
          response?.sentiments?.learning,
          response?.sentiments?.value,
        ].filter((text): text is string => !!text?.trim()) || [];

      const allRemarks: string[] = [
        ...(
          response?.implementations?.map(
            (obj: { remarks: string }) => obj.remarks,
          ) ?? []
        ).filter((text: string) => text.trim() !== ''),
        ...(
          response?.objectives?.map(
            (obj: { remarks: string }) => obj.remarks,
          ) ?? []
        ).filter((text: string) => text.trim() !== ''),
        ...(
          response?.outcomes?.map((obj: { remarks: string }) => obj.remarks) ??
          []
        ).filter((text: string) => text.trim() !== ''),
        ...(
          response?.feedback?.map((obj: { remarks: string }) => obj.remarks) ??
          []
        ).filter((text: string) => text.trim() !== ''),
        ...sentiments,
      ];

      // generate word cloud using quickcharts API
      const cloudSvg = await fetch('https://quickcharts.io/wordcloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'svg',
          width: 800,
          height: 800,
          rotation: 0,
          removeStopwords: true,
          loadGoogleFonts: 'Inter',
          fontFamily: 'Inter',
          scale: 'linear',
          text: allRemarks.join(' '),
        }),
      });

      image.current = URL.createObjectURL(await cloudSvg.blob());

      // save svg to supabase storage
      await supabase.storage
        .from('activity_analytics')
        .upload(`${id}/wordcloud.svg`, await cloudSvg.blob());

      // save metadata to supabase 'analytics_metadata'
      await supabase.from('analytics_metadata').upsert({
        activity_id: id,
        type: 'wordcloud',
      });
    };

    void generateCloud();
  }, [id]);

  return (
    <>
      <Group justify="space-between">
        <Group align="flex-end" gap="xs">
          <Text fw={700} fz="lg">
            Word Cloud
          </Text>
        </Group>

        <IconDeviceAnalytics
          className={utilStyles.icon}
          size="1.4rem"
          stroke={1.5}
        />
      </Group>

      <Text c="dimmed" fz="sm">
        See what the majority are saying about the activity.
      </Text>

      <Box>
        <Image
          alt="Word Cloud"
          h="auto"
          radius="md"
          src={image.current}
          w="100%"
        />
      </Box>
    </>
  );
}

export const WorldCloud = memo(WordCloudComponent);
