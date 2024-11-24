import { memo, useEffect, useState } from 'react';
import { Text, Group, Box, Image, Center } from '@mantine/core';
import { IconDeviceAnalytics } from '@tabler/icons-react';
import utilStyles from '@/styles/Utilties.module.css';
import { createBrowserClient } from '@/libs/supabase/client';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { SupabaseClient } from '@supabase/supabase-js';

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
  const [image, setImage] = useState('');

  useEffect(() => {
    const generateCloud = async (supabase: SupabaseClient) => {
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
      const cloudSvg = await fetch('https://quickchart.io/wordcloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'png',
          width: 800,
          height: 800,
          rotation: 0,
          removeStopwords: true,
          fontFamily: 'sans',
          scale: 'linear',
          text: allRemarks.join(),
        }),
      });

      if (cloudSvg.status !== 200) {
        notifications.show({
          title: 'Unable to generate word cloud',
          message: cloudSvg.statusText,
          autoClose: 4000,
          withBorder: true,
        });
        return;
      }

      const cloudSvgBlob = await cloudSvg.blob();
      setImage(URL.createObjectURL(cloudSvgBlob));

      await supabase.storage
        .from('activity_analytics')
        .upload(`${id}/wordcloud.svg`, cloudSvgBlob, {
          cacheControl: '3600', // 1 hour in seconds
          upsert: true,
        });

      // save metadata to supabase 'analytics_metadata'
      const { error: dbError } = await supabase
        .from('analytics_metadata')
        .upsert(
          {
            activity_id: id,
            type: 'wordcloud',
          },
          {
            onConflict: 'activity_id, type',
          },
        );

      if (dbError) {
        console.error(dbError);
      }
    };

    // get saved/cached word cloud, and use them if they are 1hr fresh
    const getSavedCloud = async () => {
      const supabase = createBrowserClient();

      // check if word cloud is already saved in 'analytics_metadata'
      const { data } = await supabase
        .from('analytics_metadata')
        .select('updated_at')
        .eq('activity_id', id)
        .eq('type', 'wordcloud')
        .limit(1)
        .maybeSingle();

      // check if record is within 1 hour, if not, regenerate word cloud
      if (data && dayjs().diff(dayjs(data?.updated_at), 'hour') < 1) {
        const { data } = await supabase.storage
          .from('activity_analytics')
          .download(`${id}/wordcloud.svg`);

        setImage(URL.createObjectURL(data!));
      } else {
        void generateCloud(supabase);
      }
    };

    void getSavedCloud();
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
        {image ? (
          <Image
            alt="Word Cloud"
            fit="contain"
            h={590}
            radius="md"
            src={image}
            w="100%"
          />
        ) : (
          <Center h={590}>
            <Text c="dimemd" fs="italic" my="xs" size="xs" ta="center">
              Word cloud is not available yet, <br />
              Come back again after a few hours.
            </Text>
          </Center>
        )}
      </Box>
    </>
  );
}

export const WorldCloud = memo(WordCloudComponent);