import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { metadata as defaultMetadata } from '@/app/layout';
import { systemUrl } from '@/app/routes';
import { createServerClient } from '@/libs/supabase/server';
import { getEventsDetails } from '@/libs/supabase/api/event';
import { EventDetailsShell } from '@portal/events/_components/EventDetails/EventDetailsShell';
import { siteUrl } from '@/utils/url';

// cache the event details to avoid duplicated
// requests for the page and metadata generation.
const cacheEventDetails = cache(async (id: string) => {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

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

  if (
    !event.data ||
    (event.data.visibility !== 'Everyone' && typeof window !== 'undefined')
  ) {
    return {
      title: 'Event not found – ' + defaultMetadata.title,
      description: event.message,
    };
  }

  return {
    title: `${event.data.title} | T.I.P Community Extension Services Office – Manila`,
    description: sanitizeHtml(event.data.description!, {
      allowedTags: [],
    }),
    applicationName: 'ProCESO',
    publisher: event.data.created_by,
    category: event.data.series,
    robots: 'index, follow',
    openGraph: {
      siteName: 'ProCESO',
      url: `${siteUrl() + systemUrl}/events/${event.data.id}/info`,
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

  if (!event.data) redirect('/not-found');

  return <EventDetailsShell event={event.data} />;
}
