import { type DateValue } from '@mantine/dates';
import { type SupabaseClient } from '@supabase/supabase-js';
import type {
  FacultyAssignmentsResponse,
  ActivityFacultiesResponse,
  FacultyConflictsResponse,
  ActivitiesViewResponse,
} from './_response';
import { createBrowserClient } from '@/libs/supabase/client';
import type { Tables } from '@/libs/supabase/_database';

/**
 * Get activities that are assigned to a faculty
 * with matching userId.
 *
 * @param userId - The faculty id to filter.
 * @param search - Similar/matching activity title.
 * @param supabase - The Supabase client to use.
 */
export async function getAssignedActivities({
  userId,
  search,
  supabase,
}: {
  userId: string;
  search?: string;
  supabase?: SupabaseClient;
}): Promise<ActivitiesViewResponse> {
  if (!supabase) supabase = createBrowserClient();
  const now = new Date().toISOString();

  let query = supabase
    .from('faculty_assignments')
    .select(
      `
      activities:activities_details_view (*)
      `,
    )
    .eq('user_id', userId)
    .gte('activities.date_starting', now)
    .order('date_starting', {
      referencedTable: 'activities_details_view',
      ascending: false,
    });

  if (search) query = query.ilike('activities.title', `%${search}%`);
  const { data: activities, error } = await query;

  if (error) {
    return {
      status: 2,
      title: 'Unable to get faculty users',
      message: error.message,
    };
  }

  // flatten result similar to `.from('activities')`
  const assignedActivities: Tables<'activities_details_view'>[] =
    activities.flatMap((activity) => activity?.activities || []);

  return {
    status: 0,
    title: 'Faculty users fetched',
    message: 'List of faculty users have been successfully fetched.',
    data: assignedActivities,
  };
}

/**
 * Get list of assigned faculty for an activity.
 *
 * @param activityId - The activity ID to filter.
 * @param supabase - The Supabase client to use.
 */
export async function getAssignedFaculties({
  activityId,
  supabase,
}: {
  activityId: string;
  supabase?: SupabaseClient;
}): Promise<ActivityFacultiesResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: activities, error } = await supabase
    .from('activities_faculties_view')
    .select()
    .eq('activity_id', activityId);

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
    data: activities,
  };
}

/**
 * Get list of faculty users that
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
    .from('activities')
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
 * Assign a faculty to an activity.
 *
 * @param userId - The user ID of the faculty to assign.
 * @param activityId - The activity ID to assign.
 * @param supabase - The Supabase client to use.
 */
export async function postFacultyAssignment({
  userId,
  activityId,
  supabase,
}: {
  userId: string[];
  activityId: string;
  supabase: SupabaseClient;
}): Promise<FacultyAssignmentsResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('faculty_assignments')
    .upsert(
      userId.map((user_id) => ({
        user_id,
        activity_id: activityId,
      })),
      {
        onConflict: 'user_id, activity_id',
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

/**
 * Remove faculty from an activity assignment.
 *
 * @param userId - The user ID of the faculty to assign.
 * @param activityId - The activity ID to assign.
 * @param supabase - The Supabase client to use.
 */
export async function deleteFacultyAssignment({
  userId,
  activityId,
  supabase,
}: {
  userId: string[];
  activityId: string;
  supabase: SupabaseClient;
}): Promise<FacultyAssignmentsResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('faculty_assignments')
    .delete()
    .eq('activity_id', activityId)
    .in('user_id', userId)
    .select();

  if (error) {
    return {
      status: 2,
      title: 'Unable to remove faculty',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Faculty removed',
    message: 'The faculty has been successfully removed.',
    data: data,
  };
}
