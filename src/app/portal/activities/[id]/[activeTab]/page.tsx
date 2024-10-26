import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { metadata as defaultMetadata } from '@/app/layout';
import { systemUrl } from '@/app/routes';
import { createServerClient } from '@/libs/supabase/server';
import { getActivitiesDetails } from '@/libs/supabase/api/activity';
import { ActivityDetailsShell } from '@portal/activities/_components/ActivityDetails/ActivityDetailsShell';
import { siteUrl } from '@/utils/url';

// cache the activity details to avoid duplicated
// requests for the page and metadata generation.
const cacheActivityDetails = cache(async (id: string) => {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  return await getActivitiesDetails({
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
    title: `${activity.data.title} | T.I.P Community Extension Services Office – Manila`,
    description: sanitizeHtml(activity.data.description as string, {
      allowedTags: [],
    }),
    applicationName: 'ProCESO',
    publisher: activity.data.created_by,
    category: activity.data.series,
    robots: 'index, follow',
    openGraph: {
      siteName: 'ProCESO',
      url: `${siteUrl() + systemUrl}/activities/${activity.data.id}/info`,
      images: [{ url: activity.data.image_url as string }],
      publishedTime: activity.data.created_at as string,
      expirationTime: activity.data.date_ending as string,
    },
  };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await cacheActivityDetails(id);

  if (!activity.data) redirect('/not-found');

  return <ActivityDetailsShell activity={activity.data} />;
}
