'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { sidebarRoutes, systemUrl } from '@/app/routes';
import { createServerClient } from '@/libs/supabase/server';
import { postActivity, updateActivity } from '@/libs/supabase/api/activity';
import { getSeriesByTitle, postSeries } from '@/libs/supabase/api/series';
import { postActivityCover } from '@/libs/supabase/api/storage';
import {
  deleteFacultyAssignment,
  postFacultyAssignment,
} from '@/libs/supabase/api/faculty-assignments';
import type { ActivityResponse } from '@/libs/supabase/api/_response';
import type { ActivityFormProps } from './_components/Forms/ActivityFormModal';
import type ApiResponse from '@/utils/response';
import { emailAssigned } from '@/trigger/email-assigned';
import {
  rescheduleReminders,
  scheduleReminders,
} from '@/libs/triggerdev/reminders';
import { emailUnassigned } from '@/trigger/email-unassigned';
import { revalidate } from '@/app/actions';

/**
 * Create and process new activity.
 *
 * 1. Check is session is still valid
 * 2. Create activity series if it doesn't exist
 * 3. Create the activity
 * 4. Save uploaded image to storage and update url of activity
 *
 * @param activity - The activity data to create.
 * @param original - The original activity data for comparisons.
 * @param existingId - If provided, update the activity instead of creating.
 *
 * @returns {ApiResponse} which can be used for displaying notifications.
 */
export async function submitActivity(
  activity: ActivityFormProps,
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

  // create activity series if it doesn't exist
  let seriesId = null;
  if (activity.series) {
    const seriesCheck = await getSeriesByTitle({
      title: activity.series,
      supabase,
    });

    if (seriesCheck.data?.id) {
      seriesId = seriesCheck.data.id;
    } else {
      const seriesResponse = await postSeries({
        title: activity.series,
        supabase,
      });
      if (!seriesResponse.data) return seriesResponse;

      // return the id for activity link
      seriesId = seriesResponse.data[0].id;
    }
  }

  // create or update the activity
  let activityResponse: ActivityResponse;
  if (!existingId) {
    activityResponse = await postActivity({
      userId: session.user.id,
      activity: {
        title: activity.title,
        visibility: activity.visibility,
        series: seriesId,
        date_ending: activity.date_ending?.toISOString(),
        date_starting: activity.date_starting?.toISOString(),
        created_by: session.user.id,
        objectives: [
          activity.objective_1?.trim() ?? '',
          activity.objective_2?.trim() ?? '',
          activity.objective_3?.trim() ?? '',
        ],
      },
      supabase,
    });
  } else {
    activityResponse = await updateActivity({
      activityId: existingId,
      activity: {
        title: activity.title,
        visibility: activity.visibility,
        series: seriesId,
        date_ending: activity.date_ending?.toISOString(),
        date_starting: activity.date_starting?.toISOString(),
        objectives: [
          activity.objective_1?.trim() ?? '',
          activity.objective_2?.trim() ?? '',
          activity.objective_3?.trim() ?? '',
        ],
      },
      supabase,
    });
  }

  if (!activityResponse?.data) return activityResponse;
  const activityId = existingId ?? activityResponse.data[0].id;

  // we process the image after the activity is created for the id
  if (activity.image_url && typeof activity.image_url === 'object') {
    const uploadResponse = await postActivityCover({
      file: activity.image_url,
      activityId,
      supabase,
    });

    if (!uploadResponse.data) return uploadResponse;
  }

  // if activity is internal
  if (activity.visibility === 'Internal' && existingId) {
    // remove any existing faculty assignment
    const delResponse = await deleteFacultyAssignment({
      userId: [],
      activityId,
      supabase,
    });

    if (delResponse.status !== 0) return delResponse;
  } else {
    // schedule (delay) email reminders
    if (existingId && activity.date_starting) {
      rescheduleReminders({
        activityId: activityId,
        activityStartingDate: activity.date_starting,
      });
    } else {
      scheduleReminders({
        activityId: activityId,
        activityStartingDate: activity.date_starting!,
      });
    }
  }

  if (existingId) {
    return {
      status: 0,
      title: 'Activity updated',
      message: 'Activity has been successfully updated.',
    };
  } else {
    return {
      status: 0,
      title: 'New activity created',
      message: 'Activity has been successfully created.',
    };
  }
}

/**
 * Assign faculty to an activity.
 *
 * @param faculty - The faculty ids to assign.
 * @param activityId - The activity id to assign.
 */
export async function assignFaculty(
  activityId: string,
  faculty: string[],
  original?: string[] | null,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // determine faculties to add and remove
  const facultiesToAdd = faculty.filter((id) => !original?.includes(id));
  const facultiesToRemove =
    original?.filter((id) => !faculty.includes(id)) ?? [];

  // assign faculty to activity
  if (facultiesToAdd.length) {
    const assignResponse = await postFacultyAssignment({
      userId: facultiesToAdd,
      activityId,
      supabase,
    });

    if (assignResponse.status !== 0) return assignResponse!;

    // send email notice to newly assigned faculties
    emailAssigned.trigger({
      activityId: activityId,
      ids: faculty.filter((id) => !original?.includes(id)),
    });
  }

  // remove unassigned faculties
  if (facultiesToRemove.length) {
    const delResponse = await deleteFacultyAssignment({
      userId: facultiesToRemove,
      activityId,
      supabase,
    });

    if (delResponse.status !== 0) return delResponse;

    // send email notice to unassigned faculties
    emailUnassigned.trigger({
      activityId: activityId,
      ids: faculty.filter((id) => !original?.includes(id)),
    });
  }

  revalidate(
    `${sidebarRoutes.find((route) => route.label === 'Activities')?.links?.[0]?.link}/${activityId}/info`,
  );

  return {
    status: 0,
    title: 'Assigned faculty updated',
    message: 'Changes in faculty assignment has been successfully updated.',
  };
}

/**
 * Delete an activity.
 *
 * @param activityId - The activity id to delete.
 */
export async function deleteActivityAction(
  activityId: string,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // delete record from activities table
  const { error: tableError } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);

  if (tableError) {
    return {
      status: 2,
      title: 'Unable to delete activity',
      message: tableError.message,
    };
  }

  // delete storage usage
  const { error: storageError } = await supabase.storage
    .from('activity_cover')
    .remove([activityId]);

  if (storageError) {
    return {
      status: 1,
      title: 'Unable to delete activity cover',
      message: storageError.message,
    };
  }

  // delete storage record
  const { error: metadataError } = await supabase
    .from('activity_files')
    .delete()
    .eq('activity', activityId);

  if (metadataError) {
    return {
      status: 1,
      title: 'Unable to delete activity files metadata',
      message: metadataError.message,
    };
  }

  revalidatePath('/api/activities/feed');
  revalidatePath(`${systemUrl}/activities`);

  return {
    status: 0,
    title: 'Activity deleted',
    message: 'The activity has been successfully deleted.',
  };
}

/**
 * Download activity file based on its checksum.
 *
 * @param activityId - The activity id to download.
 * @param checksum - The checksum of the file.
 */
export async function downloadActivityFile(
  activityId: string,
  checksum: string,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase.storage
    .from('activities')
    .download(`${activityId}/${checksum}`);

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
 * Check if user is subscribed to the activity
 *
 * @param activityId - The activity id to check.
 * @param userId - The user id to check.
 */
export async function isSubscribed(
  activityId: string,
  userId: string,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('activity_subscriptions')
    .select('id')
    .eq('activity_id', activityId)
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
 * @param activityId - The activity id to subscribe.
 */
export async function subscribeToActivity(
  activityId: string,
  userId: string,
  subscribe: boolean,
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  let error;

  if (subscribe) {
    error = await supabase.from('activity_subscriptions').upsert(
      {
        activity_id: activityId,
        user_id: userId,
      },
      {
        onConflict: 'user_id, activity_id',
        ignoreDuplicates: true,
      },
    );
  } else {
    error = await supabase
      .from('activity_subscriptions')
      .delete()
      .eq('activity_id', activityId)
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
    title: `${subscribe ? 'Subscribed' : 'Unsubscribed'} from the activity`,
    message: subscribe
      ? 'You will receive email reminders for the activity.'
      : 'You will no longer receive email reminders for the activity.',
  };
}
