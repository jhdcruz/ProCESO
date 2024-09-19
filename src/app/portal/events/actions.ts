'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/libs/supabase/server';
import { postEvent, updateEvent } from '@/libs/supabase/api/event';
import { postSeries } from '@/libs/supabase/api/series';
import { postEventCover } from '@/libs/supabase/api/storage';
import { postFacultyAssignment } from '@/libs/supabase/api/faculty-assignments';
import type { EventResponse } from '@/libs/supabase/api/_response';
import type ApiResponse from '@/utils/response';
import { EventFormProps } from './_components/Forms/EventFormModal';
import { emailAssigned } from '@/trigger/email-assigned';

/**
 * Revalidate path.
 *
 * Use for every updating and inserting of data.
 *
 * @params pathname - The path to revalidate.
 */
export async function revalidate(pathname: string) {
  revalidatePath(pathname);
}

/**
 * Create and process new event.
 *
 * 1. Check is session is still valid
 * 2. Create event series if it doesn't exist
 * 3. Create the event
 * 4. Save uploaded image to storage and update url of event
 *
 * @param event - The event data to create.
 * @param existingId - If provided, update the event instead of creating.
 *
 * @returns {ApiResponse} which can be used for displaying notifications.
 */
export async function submitEvent(
  event: EventFormProps,
  existingId?: string,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  // get current user id for created_by
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      status: 2,
      title: 'Session expired',
      message: 'Please log in again to continue.',
    };
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
    seriesId = seriesResponse.data[0].id;
  }

  // create or update the event
  let eventResponse: EventResponse;
  if (!existingId) {
    eventResponse = await postEvent({
      userId: session.user.id,
      event: {
        title: event.title,
        visibility: event.visibility,
        series: seriesId,
        date_ending: event.date_ending?.toISOString(),
        date_starting: event.date_starting?.toISOString(),
        created_by: session.user.id,
      },
      supabase,
    });
  } else {
    eventResponse = await updateEvent({
      eventId: existingId,
      event: {
        title: event.title,
        visibility: event.visibility,
        series: seriesId,
        date_ending: event.date_ending?.toISOString(),
        date_starting: event.date_starting?.toISOString(),
      },
      supabase,
    });
  }

  if (!eventResponse?.data) return eventResponse;
  const eventId = existingId ?? eventResponse.data[0].id;

  // we process the image after the event is created for the id
  if (event.image_url && typeof event.image_url === 'object') {
    const uploadResponse = await postEventCover({
      file: event.image_url,
      eventId,
      supabase,
    });

    if (!uploadResponse.data) return uploadResponse;
  }

  // save assigned faculty
  if (event.handled_by?.length) {
    const assignResponse = await postFacultyAssignment({
      userId: event.handled_by,
      eventId,
      supabase,
    });

    // send email reminders to assign faculties
    await emailAssigned.trigger({ event: event.title, ids: event.handled_by });

    if (!assignResponse.data) return assignResponse;
  }

  if (existingId) {
    return {
      status: 0,
      title: 'Event updated',
      message: 'Event has been successfully updated.',
    };
  } else {
    return {
      status: 0,
      title: 'New event created',
      message: 'Event has been successfully created.',
    };
  }
}
