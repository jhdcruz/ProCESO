import type { SupabaseClient } from '@supabase/supabase-js';
import type { NewEvent } from '@/app/(system)/events/_components/Forms/NewEventModal';
import type { ApiResponse } from '@/api/types';
import { createBrowserClient } from '@/utils/supabase/client';

// supabase doesn't accept DateValue as value,
// adding string to existing `NewEvent` disables some functions.
export interface NewEventRequest
  extends Omit<NewEvent, 'date_starting' | 'date_ending' | 'image_url'> {
  date_starting?: string | null;
  date_ending?: string | null;
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
}): Promise<ApiResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: createdEvent, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_by: userId,
    })
    .select()
    .limit(1)
    .single();

  if (error)
    return {
      status: 2,
      title: 'Unable to create event',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Event created',
    message: 'The event has been successfully',
    data: createdEvent,
  };
}
