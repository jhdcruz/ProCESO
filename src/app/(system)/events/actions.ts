import { redirect } from 'next/navigation';
import { createBrowserClient } from '@/utils/supabase/client';
import { postEvent } from '@/api/supabase/event';
import type { ApiResponse } from '@/api/types';
import { NewEvent } from './_components/Forms/NewEventModal';
import { postSeries } from '@/api/supabase/series';
import { postEventCover } from '@/api/supabase/storage';

/**
 * Create and process new event.
 *
 * 1. Check is session is still valid
 * 2. Create event series if it doesn't exist
 * 3. Create the event
 * 4. Save uploaded image to storage and update url of event
 *
 * @returns {ApiResponse} which can be used for displaying notifications.
 */
export async function submitEvent(event: NewEvent): Promise<ApiResponse> {
  const supabase = createBrowserClient();

  // get current user id for created_by
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // just in case the session is expired
    redirect('/login');
  }

  // create event series if it doesn't exist
  let seriesId = null;
  if (event.series) {
    const seriesResponse = await postSeries({
      title: event.series,
      supabase,
    });
    if (!seriesResponse.data) return seriesResponse;

    // return the id for event link
    seriesId = seriesResponse.data.id;
  }

  // create the event
  const eventResponse = await postEvent({
    userId: session.user.id,
    event: {
      ...event,
      series: seriesId,
      date_ending: event.date_ending?.toISOString(),
      date_starting: event.date_starting?.toISOString(),
      created_by: session.user.id,
    },
    supabase,
  });
  if (!eventResponse.data) return eventResponse;
  const eventId = eventResponse.data?.id;

  // we process the image after the event is created for the id
  if (event.image_url) {
    const uploadResponse = await postEventCover({
      file: event.image_url,
      eventId,
      supabase,
    });

    if (!uploadResponse.data) return uploadResponse;
  }

  return {
    status: 0,
    title: 'New event created',
    message: 'Event has been successfully created.',
  };
}