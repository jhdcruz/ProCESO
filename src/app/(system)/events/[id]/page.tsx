import { lazy, Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notifications } from '@mantine/notifications';
import { metadata as defaultMetadata } from '@/app/layout';
import { PageLoader } from '@/components/Loader/PageLoader';
import { createServerClient } from '@/utils/supabase/server';
import EventPageShell from '../_components/EventDetails/EventPageShell';

const EventDetails = lazy(() =>
  import('../_components/EventDetails/EventDetails').then((mod) => ({
    default: mod.EventDetails,
  })),
);

interface Props {
  params: { id: string };
}

/**
 * For generating dynamic OpenGraph metadata for sharing links.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: event, error } = await supabase
    .from('events')
    .select(
      `
      title,
      description,
      visibility,
      series,
      created_by,
      created_at,
      date_ending,
      image_url
      `,
    )
    .eq('id', id)
    .single();

  if (error) {
    return {
      title: error.message,
      description: error.details,
    };
  }

  return {
    title: `${event.title} - ${defaultMetadata.title}`,
    description: event.description,
    applicationName: 'ProCESO',
    creator: event.created_by,
    category: event.series,
    robots:
      event.visibility === 'Everyone' ? 'index, follow' : 'noindex, nofollow',
    openGraph: {
      images: [{ url: event.image_url ?? '' }],
      publishedTime: event.created_at,
      expirationTime: event.date_ending ?? '',
    },
  };
}

export default async function EventPage({ params }: Props) {
  const id = params.id;

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: event, error } = await supabase
    .from('events')
    .select(
      `
      *,
      
      users (
        name,
        avatar_url
      )
      `,
    )
    .eq('id', id)
    .single();

  if (error) {
    return notifications.show({
      title: 'Error',
      message: error.message,
      color: 'red',
      withBorder: true,
      withCloseButton: true,
      autoClose: 8000,
    });
  }

  return (
    <EventPageShell>
      <Suspense fallback={<PageLoader />}>
        <EventDetails {...event} />
      </Suspense>
    </EventPageShell>
  );
}
