import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { redirect, RedirectType } from 'next/navigation';
import { Badge, Group, Stack, Title, Image, Divider } from '@mantine/core';
import sanitizeHtml from 'sanitize-html';
import { metadata as defaultMetadata } from '@/app/layout';
import { createServerClient } from '@/libs/supabase/server';
import { getActivityDetails } from '@/libs/supabase/api/activity';
import { siteUrl } from '@/utils/url';
import { PageLoader } from '@/components/Loader/PageLoader';
import { IconCalendarClock } from '@tabler/icons-react';
import dayjs from '@/libs/dayjs';

const BeneficiariesForm = dynamic(
  () => import('@/app/eval/_components/Forms/BeneficiariesForm'),
  {
    loading: () => <PageLoader />,
  },
);

// cache the activity details to avoid duplicated
// requests for the page and metadata generation.
const cacheActivityDetails = cache(async (id: string) => {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  return await getActivityDetails({
    activityId: id,
    supabase,
  });
});

/**
 * For generating dynamic OpenGraph metadata for sharing links.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const activity = await cacheActivityDetails(id);

  if (
    !activity.data ||
    (activity.data.visibility !== 'Everyone' && typeof window !== 'undefined')
  ) {
    return {
      title: 'Activity not found – ' + defaultMetadata.title,
      description: activity.message,
    };
  }

  return {
    title: `${activity.data.title} Evaluation for Beneficiaries | T.I.P Community Extension Services Office – Manila`,
    description: sanitizeHtml(activity.data.description as string, {
      allowedTags: [],
    }),
    applicationName: 'ProCESO',
    publisher: activity.data.created_by,
    category: activity.data.series,
    robots: 'index, follow',
    openGraph: {
      siteName: 'ProCESO',
      url: `${siteUrl()}/eval/${activity.data.id}/beneficiaries`,
      images: [{ url: activity.data.image_url as string }],
      publishedTime: activity.data.created_at as string,
    },
  };
}

export default async function BeneficiariesFeedback({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await cacheActivityDetails(id);

  if (!activity?.data?.feedback) {
    redirect('/eval/closed', RedirectType.replace);
  }

  return (
    <>
      <Divider label="Beneficiaries' Evaluation Form" my="lg" />

      {/* Activity Details */}
      <Group mb="md">
        <Image
          alt=""
          className="object-contain"
          component={NextImage}
          fallbackSrc="/assets/no-image.png"
          h="auto"
          height={300}
          mb={16}
          radius="md"
          src={activity.data.image_url}
          w="auto"
          width={300}
        />

        <Stack gap={6}>
          <Title order={3}>{activity.data.title}</Title>
          {/* Activity date and end */}
          {activity.data.date_starting && activity.data.date_ending && (
            <Badge
              leftSection={<IconCalendarClock size={16} />}
              size="lg"
              variant="light"
            >
              {dayjs(activity.data.date_starting).format('MMM D, YYYY h:mm A')}
              {' - '}
              {dayjs(activity.data.date_ending).format('MMM D, YYYY h:mm A')}
            </Badge>
          )}
        </Stack>
      </Group>

      <BeneficiariesForm activity={activity.data} />
    </>
  );
}
