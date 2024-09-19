import { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '../client';
import type { Tables, TablesInsert } from '../_database';
import { getAssignedFaculties } from './faculty-assignments';
import type { EventResponse, EventDetailsResponse } from './_response';

/**
 * Get events based on filters and/or limit, if provided.
 *
 * IMPORTANT: this calls the `events_details` materialized view,
 *            instead of `events` table.
 *
 * @param countOnly - Return only the exact count of events (no data).
 * @param filter - Filter events based on 'recent' (recently created),
 *                 'ongoing', 'upcoming', or 'past'.
 * @param limit - Limit the number of events to be fetched.
 * @param supabase - Supabase client instance.
 */
export async function getEvents({
  search,
  filter,
  limit,
  supabase,
}: {
  search?: string;
  filter?: 'recent' | 'ongoing' | 'upcoming' | 'past';
  limit?: number;
  supabase?: SupabaseClient;
}): Promise<EventResponse> {
  if (!supabase) supabase = createBrowserClient();

  let query = supabase.from('events').select();

  // filters based on event dates
  if (filter) {
    const now = new Date().toISOString();

    switch (filter) {
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;

      case 'ongoing':
        query = query
          .lte('date_starting', now)
          .gte('date_ending', now)
          .order('date_starting', { ascending: true });
        break;

      case 'upcoming':
        query = query
          .gte('date_starting', now)
          .order('date_starting', { ascending: true });
        break;

      case 'past':
        query = query
          .lte('date_ending', now)
          .order('date_starting', { ascending: false });
        break;
    }
  }

  if (search) query = query.ilike('title', `%${search}%`);
  if (limit) query = query.limit(limit);
  const { data: events, error } = await query.returns<Tables<'events'>[]>();

  if (error) {
    return {
      status: 2,
      title: 'Unable to fetch events',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Events fetched',
    message: 'Events have been successfully fetched.',
    data: events,
  };
}

/**
 * Get event details based on the event ID.
 *
 * @param eventId - The event ID to fetch details for.
 * @param supabase - Supabase client instance.
 */
export async function getEventsDetails({
  eventId,
  supabase,
}: {
  eventId: string;
  supabase?: SupabaseClient;
}): Promise<EventDetailsResponse> {
  if (!supabase) supabase = createBrowserClient();

  // get event details from materialized view
  const eventDetails = supabase
    .from('events_details_view')
    .select()
    .eq('id', eventId)
    .returns<Tables<'events_details_view'>[]>();

  // get assigned faculties
  const faculties = getAssignedFaculties({
    eventId: eventId,
    supabase: supabase,
  });

  const [event, assigned] = await Promise.all([eventDetails, faculties]);

  if (event.error) {
    return {
      status: 2,
      title: 'Unable to fetch event details',
      message: event.error.message,
    };
  }

  if (assigned.status !== 0) {
    return {
      status: assigned.status,
      title: assigned.title,
      message: assigned.message,
    };
  }

  return {
    status: 0,
    title: 'Events fetched',
    message: 'Events have been successfully fetched.',
    data: {
      ...event.data[0],
      users: assigned?.data ?? null,
    },
  };
}

/**
 * Create a new event.
 *
 * @param userId - The user ID of the current user (for `created_by`).
 * @param event - The event data to create.
 * @param supabase - The Supabase client to use.
 */
export async function postEvent({
  userId,
  event,
  supabase,
}: {
  userId: string;
  event: TablesInsert<'events'>;
  supabase?: SupabaseClient;
}): Promise<EventResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: createdEvent, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_by: userId,
    })
    .select();

  if (error)
    return {
      status: 2,
      title: 'Unable to create event',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Event created',
    message: 'The event has been successfully created.',
    data: createdEvent,
  };
}

/**
 * Update existing event.
 *
 * @param eventId - The event ID to update.
 * @param event - The event data to update.
 * @param supabase - The Supabase client to use.
 */
export async function updateEvent({
  eventId,
  event,
  supabase,
}: {
  eventId: string;
  event: TablesInsert<'events'>;
  supabase?: SupabaseClient;
}): Promise<EventResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: updatedEvent, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', eventId)
    .select();

  if (error)
    return {
      status: 2,
      title: 'Unable to update event',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Event updated',
    message: 'The event has been successfully updated.',
    data: updatedEvent,
  };
}

/**
 * Update event description.
 *
 * @param eventId - The event ID to update description for.
 * @param description - The new description for the event.
 * @param supabase - The Supabase client to use.
 */
export async function updateEventDescription({
  eventId,
  description,
  supabase,
}: {
  eventId: string;
  description: string;
  supabase?: SupabaseClient;
}): Promise<EventResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: updatedEvent, error } = await supabase
    .from('events')
    .update({ description: description })
    .eq('id', eventId)
    .select();

  if (error)
    return {
      status: 2,
      title: 'Unable to update event description',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Event description updated',
    message: 'The event description has been successfully updated.',
    data: updatedEvent,
  };
}
