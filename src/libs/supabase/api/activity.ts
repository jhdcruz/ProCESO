import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createBrowserClient } from '../client';
import type { Tables, TablesInsert } from '../_database';
import { getAssignedFaculties } from './faculty-assignments';
import type {
  ActivityResponse,
  ActivityDetailsResponse,
  ActivitiesViewResponse,
} from './_response';
import { systemUrl } from '@/app/routes';

/**
 * Get activities based on filters and/or limit, if provided.
 *
 * IMPORTANT: this calls the `activities_details` materialized view,
 *            instead of `activities` table.
 *
 * @param countOnly - Return only the exact count of activities (no data).
 * @param filter - Filter activities based on 'recent' (recently created),
 *                 'ongoing', 'upcoming', or 'past'.
 * @param limit - Limit the number of activities to be fetched.
 * @param supabase - Supabase client instance.
 */
export async function getActivities({
  search,
  filter,
  limit,
  supabase,
}: {
  search?: string;
  filter?: 'recent' | 'ongoing' | 'upcoming' | 'past';
  limit?: number;
  supabase?: SupabaseClient;
}): Promise<ActivitiesViewResponse> {
  if (!supabase) supabase = createBrowserClient();
  let query = supabase.from('activities_details_view').select();

  // filters based on activity dates
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

  const { data: activities, error } =
    await query.returns<Tables<'activities_details_view'>[]>();

  if (error) {
    return {
      status: 2,
      title: 'Unable to fetch activities',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Activities fetched',
    message: 'Activities have been successfully fetched.',
    data: activities,
  };
}

/**
 * Get activities withing a specific date range.
 *
 * @param start - The starting date of the range.
 * @param end - The ending date of the range.
 * @param exclude - List of activity IDs to exclude from the results.
 * @param supabase - Supabase client instance.
 */
export async function getActivitiesInRange({
  start,
  end,
  exclude,
  supabase,
}: {
  start: string;
  end: string;
  exclude?: string;
  supabase?: SupabaseClient;
}): Promise<ActivitiesViewResponse> {
  if (!supabase) supabase = createBrowserClient();

  let query = supabase
    .from('activities_details_view')
    .select()
    .gte('date_starting', start)
    .lte('date_ending', end);

  // exclude activities with specified IDs
  if (exclude) query = query.neq('id', exclude);

  const { data: activities, error } = await query;

  if (error) {
    return {
      status: 2,
      title: 'Unable to fetch activities within specified range',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Activities within range fetched',
    message: 'Activities have been successfully fetched.',
    data: activities,
  };
}

/**
 * Get activity details based on the activity ID.
 *
 * @param activityId - The activity ID to fetch details for.
 * @param supabase - Supabase client instance.
 */
export async function getActivitiesDetails({
  activityId,
  supabase,
}: {
  activityId: string;
  supabase?: SupabaseClient;
}): Promise<ActivityDetailsResponse> {
  if (!supabase) supabase = createBrowserClient();

  // get activity details from materialized view
  const activityDetails = supabase
    .from('activities_details_view')
    .select()
    .eq('id', activityId)
    .limit(1)
    .returns<Tables<'activities_details_view'>[]>()
    .single();

  // get assigned faculties
  const faculties = getAssignedFaculties({
    activityId: activityId,
    supabase: supabase,
  });

  const [activity, assigned] = await Promise.all([activityDetails, faculties]);

  if (activity.error) {
    return {
      status: 2,
      title: 'Unable to fetch activity details',
      message: activity.error.message,
    };
  }

  if (assigned.status !== 0 || !assigned.data) {
    return {
      status: assigned.status,
      title: assigned.title,
      message: assigned.message,
    };
  }

  return {
    status: 0,
    title: 'Activities fetched',
    message: 'Activities have been successfully fetched.',
    data: {
      ...activity.data,
      users: assigned.data,
    },
  };
}

/**
 * Create a new activity.
 *
 * @param userId - The user ID of the current user (for `created_by`).
 * @param activity - The activity data to create.
 * @param supabase - The Supabase client to use.
 */
export async function postActivity({
  userId,
  activity,
  supabase,
}: {
  userId: string;
  activity: TablesInsert<'activities'>;
  supabase?: SupabaseClient;
}): Promise<ActivityResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: createdActivity, error } = await supabase
    .from('activities')
    .insert({
      ...activity,
      created_by: userId,
    })
    .select();

  revalidatePath('/api/activities/feed');
  revalidatePath(`${systemUrl}/activities`);

  if (error)
    return {
      status: 2,
      title: 'Unable to create activity',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Activity created',
    message: 'The activity has been successfully created.',
    data: createdActivity,
  };
}

/**
 * Update existing activity.
 *
 * @param activityId - The activity ID to update.
 * @param activity - The activity data to update.
 * @param supabase - The Supabase client to use.
 */
export async function updateActivity({
  activityId,
  activity,
  supabase,
}: {
  activityId: string;
  activity: TablesInsert<'activities'>;
  supabase?: SupabaseClient;
}): Promise<ActivityResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: updatedActivity, error } = await supabase
    .from('activities')
    .update(activity)
    .eq('id', activityId)
    .select();

  revalidatePath(`${systemUrl}/activities/${activityId}/info`);

  if (error)
    return {
      status: 2,
      title: 'Unable to update activity',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Activity updated',
    message: 'The activity has been successfully updated.',
    data: updatedActivity,
  };
}

/**
 * Update activity description.
 *
 * @param activityId - The activity ID to update description for.
 * @param description - The new description for the activity.
 * @param supabase - The Supabase client to use.
 */
export async function updateActivityDescription({
  activityId,
  description,
  supabase,
}: {
  activityId: string;
  description: string;
  supabase?: SupabaseClient;
}): Promise<ActivityResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: updatedActivity, error } = await supabase
    .from('activities')
    .update({ description: description })
    .eq('id', activityId)
    .select();

  if (error)
    return {
      status: 2,
      title: 'Unable to update activity description',
      message: error.message,
    };

  return {
    status: 0,
    title: 'Activity description updated',
    message: 'The activity description has been successfully updated.',
    data: updatedActivity,
  };
}
