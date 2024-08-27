import { SupabaseClient } from '@supabase/supabase-js';
import type { CountResponse, EventResponse } from '@/api/types';
import type { Tables, TablesInsert } from '@/utils/supabase/types';
import { createBrowserClient } from '@/utils/supabase/client';

/**
 * Get events based on filters and/or limit, if provided.
 *
 * @param countOnly - Return only the exact count of events (no data).
 * @param filter - Filter events based on 'recent' (recently created),
 *                 'ongoing', 'upcoming', or 'past'.
 * @param limit - Limit the number of events to be fetched.
 * @param supabase - Supabase client instance.
 */
export async function getEvents({
  filter,
  limit,
  supabase,
}: {
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
 * Get events based on filters and/or limit, if provided.
 *
 * @param countOnly - Return only the exact count of events (no data).
 * @param filter - Filter events based on 'recent' (recently created),
 *                 'ongoing', 'upcoming', or 'past'.
 * @param limit - Limit the number of events to be fetched.
 * @param supabase - Supabase client instance.
 */
export async function getEventsCount({
  filter,
  supabase,
}: {
  filter?: 'ongoing' | 'upcoming' | 'past';
  supabase?: SupabaseClient;
}): Promise<CountResponse> {
  if (!supabase) supabase = createBrowserClient();

  let query = supabase
    .from('events')
    .select('id', { count: 'exact', head: true });

  // filters based on event dates
  if (filter) {
    const now = new Date().toISOString();

    switch (filter) {
      case 'ongoing':
        query = query.lte('date_starting', now).gte('date_ending', now);
        break;

      case 'upcoming':
        query = query.gte('date_starting', now);
        break;

      case 'past':
        query = query.lte('date_ending', now);
        break;
    }
  }

  const { count, error } = await query;

  if (error) {
    return {
      status: 2,
      title: 'Unable to fetch event count',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Event count fetched',
    message: `The exact count of ${count} events has been fetched.`,
    data: count,
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
