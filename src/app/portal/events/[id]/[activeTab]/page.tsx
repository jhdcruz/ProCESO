import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import sanitizeHtml from 'sanitize-html';
import { metadata as defaultMetadata } from '@/app/layout';
import { createServerClient } from '@/libs/supabase/server';
import { getEventsDetails } from '@/libs/supabase/api/event';
import { EventDetailsShell } from '@portal/events/_components/EventDetails/EventDetailsShell';

// cache the event details to avoid duplicated
// requests for the page and metadata generation.
const cacheEventDetails = cache(async (id: string) => {
  const cookieStore = await cookies();
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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await cacheEventDetails(id);

  if (!event.data || event.data?.visibility !== 'Everyone') {
    return {
      title: '404 - Event not found ' + defaultMetadata.title,
      description: event?.message,
    };
  }

  return {
    title: `${event.data.title} - ${defaultMetadata.title}`,
    description: sanitizeHtml(event.data.description!, { allowedTags: [] }),
    applicationName: 'ProCESO',
    creator: event.data.created_by,
    category: event.data.series,
    robots: 'index, follow',
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await cacheEventDetails(id);

  return <EventDetailsShell event={event?.data ?? null} />;
}
