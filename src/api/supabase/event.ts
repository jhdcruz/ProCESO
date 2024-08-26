import { SupabaseClient } from '@supabase/supabase-js';
import type { NewEvent } from '@/app/(system)/events/_components/Forms/EventFormModal';
import type { ApiResponse, EventResponse } from '@/api/types';
import { createBrowserClient } from '@/utils/supabase/client';
import { Tables } from '@/utils/supabase/types';

// TODO: move this to types.ts
// supabase doesn't accept DateValue as value,
// adding string to existing `NewEvent` disables some functions.
export interface NewEventRequest
  extends Omit<NewEvent, 'date_starting' | 'date_ending' | 'image_url'> {
  date_starting?: string | null;
  date_ending?: string | null;
}

/**
 * Get events based on filters and/or limit, if provided.
 *
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
  event: NewEventRequest;
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
