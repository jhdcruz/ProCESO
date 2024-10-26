'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { systemUrl } from '@/app/routes';
import { createServerClient } from '@/libs/supabase/server';
import { postEvent, updateEvent } from '@/libs/supabase/api/event';
import { postSeries } from '@/libs/supabase/api/series';
import { postEventCover } from '@/libs/supabase/api/storage';
import { postFacultyAssignment } from '@/libs/supabase/api/faculty-assignments';
import type { EventResponse } from '@/libs/supabase/api/_response';
import type { EventFormProps } from './_components/Forms/EventFormModal';
import type ApiResponse from '@/utils/response';
import { emailAssigned } from '@/trigger/email-assigned';
import { rescheduleReminders } from '@/libs/triggerdev/reminders';
import { emailUnassigned } from '@/trigger/email-unassigned';

/**
 * Create and process new event.
 *
 * 1. Check is session is still valid
 * 2. Create event series if it doesn't exist
 * 3. Create the event
 * 4. Save uploaded image to storage and update url of event
 *
 * @param event - The event data to create.
 * @param original - The original event data for comparisons.
 * @param existingId - If provided, update the event instead of creating.
 *
 * @returns {ApiResponse} which can be used for displaying notifications.
 */
export async function submitEvent(
  event: EventFormProps,
  original?: Readonly<EventFormProps>,
  existingId?: Readonly<string>,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

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

  // if event is internal
  if (event.visibility === 'Internal' && existingId) {
    // remove any existing faculty assignment
    const { error: removeFacultyError } = await supabase
      .from('faculty_assignments')
      .delete()
      .eq('event_id', eventId);

    if (removeFacultyError) {
      return {
        status: 2,
        title: 'Unable to remove faculty assignment',
        message: removeFacultyError.message,
      };
    }
  } else {
    // save assigned faculty
    if (event.handled_by?.length) {
      const assignResponse = await postFacultyAssignment({
        userId: event.handled_by,
        eventId,
        supabase,
      });

      // check if there are changes in assignments
      if (existingId && original?.handled_by !== event.handled_by) {
        // send email notice to unassigned faculties
        emailUnassigned.trigger({
          event: event.title,
          ids: event.handled_by.filter(
            (id) => !original?.handled_by?.includes(id),
          ),
        });
        // send email notice to newly assigned faculties
        emailAssigned.trigger({
          event: event.title,
          ids: event.handled_by.filter(
            (id) => !original?.handled_by?.includes(id),
          ),
        });
      } else {
        // send email notice to assign faculties
        emailAssigned.trigger({
          event: event.title,
          ids: event?.handled_by,
        });
      }
      if (!assignResponse.data) return assignResponse;
    }
  }

  // schedule (delay) email reminders
  if (event.date_starting) {
    rescheduleReminders({
      eventId: eventId,
      eventTitle: event.title,
      eventStartingDate: event.date_starting,
    });
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

/**
 * Delete an event.
 *
 * @param eventId - The event id to delete.
 */
export async function deleteEventAction(eventId: string): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // delete record from events table
  const { error: tableError } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (tableError) {
    return {
      status: 2,
      title: 'Unable to delete event',
      message: tableError.message,
    };
  }

  // delete storage usage
  const { error: storageError } = await supabase.storage
    .from('event_cover')
    .remove([eventId]);

  if (storageError) {
    return {
      status: 1,
      title: 'Unable to delete event cover',
      message: storageError.message,
    };
  }

  // delete storage record
  const { error: metadataError } = await supabase
    .from('event_files')
    .delete()
    .eq('event', eventId);

  if (metadataError) {
    return {
      status: 1,
      title: 'Unable to delete event files metadata',
      message: metadataError.message,
    };
  }

  revalidatePath('/api/events/feed');
  revalidatePath(`${systemUrl}/events`);

  return {
    status: 0,
    title: 'Event deleted',
    message: 'The event has been successfully deleted.',
  };
}

/**
 * Download event file based on its checksum.
 *
 * @param eventId - The event id to download.
 * @param checksum - The checksum of the file.
 */
export async function downloadEventFile(
  eventId: string,
  checksum: string,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase.storage
    .from('events')
    .download(`${eventId}/${checksum}`);

  if (error) {
    return {
      status: 1,
      title: 'Unable to download file',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'File downloaded',
    message: 'File has been successfully downloaded.',
    data: data,
  };
}

/**
 * Check if user is subscribed to the event
 *
 * @param eventId - The event id to check.
 * @param userId - The user id to check.
 */
export async function isSubscribed(
  eventId: string,
  userId: string,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('event_subscriptions')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    return {
      status: 2,
      title: 'Unable to check subscription',
      message: error.message,
    };
  }

  if (!data.length) {
    return {
      status: 1,
      title: 'Subscription not found',
      message: 'Subscription not found.',
    };
  } else {
    return {
      status: 0,
      title: 'Subscription found',
      message: 'Subscription has been successfully found.',
    };
  }
}

/**
 * Subscribe user for email reminders
 *
 * @param eventId - The event id to subscribe.
 */
export async function subscribeToEvent(
  eventId: string,
  userId: string,
  subscribe: boolean,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  let error;

  if (subscribe) {
    error = await supabase.from('event_subscriptions').upsert({
      event_id: eventId,
      user_id: userId,
    });
  } else {
    error = await supabase
      .from('event_subscriptions')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
  }

  if (error?.error) {
    return {
      status: 1,
      title: subscribe ? 'Unable to subscribe' : 'Unable to unsubscribe',
      message: subscribe ? error?.error?.message! : error?.error?.message!,
    };
  }

  return {
    status: 0,
    title: `${subscribe ? 'Subscribed' : 'Unsubscribed'} from the event`,
    message: subscribe
      ? 'You will receive email reminders for the event.'
      : 'You will no longer receive email reminders for the event.',
  };
}
