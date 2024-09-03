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
 * Get list of faculty assignments.
 *
 * @param userId - The user ID of the faculty to filter.
 * @param eventId - The event ID to filter.
 * @param supabase - The Supabase client to use.
 */
export async function getFacultyAssignments({
  userId,
  eventId,
  supabase,
}: {
  userId?: string;
  eventId?: string;
  supabase?: SupabaseClient;
}): Promise<FacultyAssignmentsResponse> {
  if (!supabase) supabase = createBrowserClient();

  let query = supabase.from('faculty_assignments').select();

  if (userId) query = query.eq('user_id', userId);
  if (eventId) query = query.eq('event_id', eventId);

  const { data: assignments, error } =
    await query.returns<Tables<'faculty_assignments'>[]>();

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
    data: assignments,
  };
}

export async function getFacultyAssignedEvents({
  userId,
  supabase,
}: {
  userId: string;
  supabase?: SupabaseClient;
}): Promise<EventResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: events, error } = await supabase
    .from('events')
    .select()
    .eq('faculty_assignments.user_id', userId);

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
    .insert(
      userId.map((user_id) => ({
        user_id,
        event_id: eventId,
      })),
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
