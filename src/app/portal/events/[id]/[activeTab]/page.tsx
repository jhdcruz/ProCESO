import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import sanitizeHtml from 'sanitize-html';

import { metadata as defaultMetadata } from '@/app/layout';
import { createServerClient } from '@/libs/supabase/server';
import { getEventsDetails } from '@/libs/supabase/api/event';
import { EventDetailsShell } from '../../_components/EventDetails/EventDetailsShell';

// cache the event details to avoid duplicated
// requests for the page and metadata generation.
const cacheEventDetails = cache(async (id: string) => {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  return await getEventsDetails({
    eventId: id,
    supabase,
  });
});

/**
 * For generating dynamic OpenGraph metadata for sharing links.
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const event = await cacheEventDetails(params.id);

  if (!event.data) {
    return {
      title: '404 - Event not found ' + defaultMetadata.title,
      description: event?.message,
    };
  }

  return {
    title: `${event.data.title} - ${defaultMetadata.title}`,
    description: sanitizeHtml(event.data.description!),
    applicationName: 'ProCESO',
    creator: event.data.created_by,
    category: event.data.series,
    robots:
      event.data.visibility === 'Everyone'
        ? 'index, follow'
        : 'noindex, nofollow',
    openGraph: {
      images: [{ url: event.data.image_url! }],
      publishedTime: event.data.created_at!,
      expirationTime: event.data.date_ending!,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await cacheEventDetails(params.id);

  return <EventDetailsShell event={event?.data ?? null} />;
}
