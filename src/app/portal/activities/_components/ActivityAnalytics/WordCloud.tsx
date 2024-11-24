import { memo, useEffect, useState } from 'react';
import { Text, Group, Box, Image, Center, Button } from '@mantine/core';
import { IconDeviceAnalytics, IconPhotoDown } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { createBrowserClient } from '@/libs/supabase/client';
import {
  type EvaluationRemarksProps,
  getTextInputs,
} from '@/utils/evaluation-inputs';
import utilStyles from '@/styles/Utilties.module.css';

function WordCloudComponent({ id }: { id: string }) {
  const [image, setImage] = useState('');

  useEffect(() => {
    const generateCloud = async (supabase: SupabaseClient) => {
      const { data, error } = await supabase
        .from('activity_feedback')
        .select('response')
        .eq('activity_id', id)
        .returns<EvaluationRemarksProps[]>();

      if (error) {
        notifications.show({
          title: 'Unable to generate word cloud',
          message: error.message,
          autoClose: 4000,
          withBorder: true,
        });
        return;
      }

      // ignore word cloud when no responses
      if (data.length === 0) return;

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
          text: getTextInputs(data).join(),
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
        .upload(`${id}/wordcloud.png`, cloudSvgBlob, {
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
      if (data && dayjs().diff(dayjs(data?.updated_at), 'hour') < 2) {
        const { data } = await supabase.storage
          .from('activity_analytics')
          .download(`${id}/wordcloud.png`);

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

        <Group gap="xs">
          <Button
            disabled={image === ''}
            leftSection={<IconPhotoDown size={16} />}
            onClick={() => {
              const a = document.createElement('a');
              a.href = image;
              a.download = `wordcloud-${id}.png`;
              a.click();
            }}
            size="xs"
            variant="default"
          >
            Export
          </Button>

          <IconDeviceAnalytics
            className={utilStyles.icon}
            size="1.4rem"
            stroke={1.5}
          />
        </Group>
      </Group>

      <Text c="dimmed" fz="sm">
        See what the majority are saying about the activity.
      </Text>

      <Box>
        {image ? (
          <Image
            alt="Word Cloud"
            fit="contain"
            mah={590}
            p="sm"
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
