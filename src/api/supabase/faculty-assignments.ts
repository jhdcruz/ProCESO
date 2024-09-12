import { type DateValue } from '@mantine/dates';
import { type SupabaseClient } from '@supabase/supabase-js';
import type {
  EventResponse,
  FacultyAssignmentsResponse,
  EventFacultiesResponse,
  FacultyConflictsResponse,
} from '../types';
import { createBrowserClient } from '@/utils/supabase/client';
import type { Tables } from '@/utils/supabase/types';

/**
 * Get events that are assigned to a faculty
 * with matching userId.
 *
 * @param userId - The faculty id to filter.
 * @param search - Similar/matching event title.
 * @param supabase - The Supabase client to use.
 */
export async function getAssignedEvents({
  userId,
  search,
  supabase,
}: {
  userId: string;
  search?: string;
  supabase?: SupabaseClient;
}): Promise<EventResponse> {
  if (!supabase) supabase = createBrowserClient();

  let query = supabase
    .from('faculty_assignments')
    .select(
      `
      events (*)
      `,
    )
    .eq('user_id', userId)
    .order('date_starting', { referencedTable: 'events', ascending: false });

  if (search) query = query.ilike('events.title', `%${search}%`);
  const { data: events, error } = await query;

  if (error) {
    return {
      status: 2,
      title: 'Unable to get faculty users',
      message: error.message,
    };
  }

  // flatten result similar to `.from('events')`
  const assignedEvents: Tables<'events'>[] = events.flatMap(
    (event) => event.events,
  );

  return {
    status: 0,
    title: 'Faculty users fetched',
    message: 'List of faculty users have been successfully fetched.',
    data: assignedEvents,
  };
}

/**
 * Get list of assigned faculty for an event.
 *
 * @param eventId - The event ID to filter.
 * @param supabase - The Supabase client to use.
 */
export async function getAssignedFaculties({
  eventId,
  supabase,
}: {
  eventId: string;
  supabase?: SupabaseClient;
}): Promise<EventFacultiesResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: events, error } = await supabase
    .from('events_faculties_view')
    .select()
    .eq('event_id', eventId);

  if (error) {
    return {
      status: 2,
      title: 'Unable to get faculty users',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Faculty users fetched',
    message: 'List of faculty users have been successfully fetched.',
    data: events,
  };
}

/**
 * Check if the faculty of the given user ID
 * has conflicts with the given date range.
 *
 * @param date_starting - The starting date of the range.
 * @param date_ending - The ending date of the range.
 */
export async function getFacultyConflicts(
  date_starting: DateValue | undefined,
  date_ending: DateValue | undefined,
): Promise<FacultyConflictsResponse> {
  // skip if no dates
  if (!date_starting || !date_ending) {
    return {
      status: 0,
      title: 'Skipped checking conflicts',
      message: 'No date provided.',
    };
  }

  const supabase = createBrowserClient();

  const { data: assigned, error } = await supabase
    .from('events')
    .select(
      `
      faculty_assignments (
        user_id
      )
      `,
    )
    .gte('date_starting', date_starting.toISOString())
    .lte('date_ending', date_ending.toISOString());

  if (error) {
    return {
      status: 2,
      title: 'Unable to get faculty users',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Faculty users fetched',
    message: 'List of faculty users have been successfully fetched.',
    data: assigned,
  };
}

/**
 * Assign a faculty to an event.
 *
 * @param userId - The user ID of the faculty to assign.
 * @param eventId - The event ID to assign.
 * @param supabase - The Supabase client to use.
 */
export async function postFacultyAssignment({
  userId,
  eventId,
  supabase,
}: {
  userId: string[];
  eventId: string;
  supabase: SupabaseClient;
}): Promise<FacultyAssignmentsResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('faculty_assignments')
    .upsert(
      userId.map((user_id) => ({
        user_id,
        event_id: eventId,
      })),
      {
        onConflict: 'user_id, event_id',
        ignoreDuplicates: true,
      },
    )
    .select();

  if (error) {
    return {
      status: 2,
      title: 'Unable to assign faculty',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Faculty assigned',
    message: 'The faculty has been successfully assigned.',
    data: data,
  };
}
