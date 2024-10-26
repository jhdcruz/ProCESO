'use server';

import { cookies } from 'next/headers';
import type {
  ActivitiesViewResponse,
  SeriesResponse,
} from '@/libs/supabase/api/_response';
import { createServerClient } from '@/libs/supabase/server';
import ApiResponse from '@/utils/response';
import { Tables } from '@/libs/supabase/_database';

export async function getSeries(): Promise<SeriesResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('series')
    .select()
    .order('title', { ascending: false });

  if (error) {
    return {
      status: 2,
      title: error.message,
      message: error.details,
    };
  }

  return {
    status: 0,
    title: 'Activity series fetched',
    message: 'Activity series fetched successfully',
    data: data,
  };
}

export async function getSeriesActivities(
  series: string,
): Promise<ActivitiesViewResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('activities_details_view')
    .select()
    .eq('series', series);

  if (error) {
    return {
      status: 2,
      title: error.message,
      message: error.details,
    };
  }

  return {
    status: 0,
    title: 'Series activities fetched',
    message: 'Series activities fetched successfully',
    data: data,
  };
}

export async function deleteSeries(seriesId: string): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { error } = await supabase.from('series').delete().eq('id', seriesId);

  if (error) {
    return {
      status: 2,
      title: 'Unable to delete series',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Series deleted',
    message: 'The series has been successfully deleted.',
  };
}

export async function updateSeries({
  seriesId,
  series,
}: {
  seriesId: string;
  series: Partial<Tables<'series'>>;
}): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { error } = await supabase
    .from('series')
    .update(series)
    .eq('id', seriesId);

  if (error) {
    return {
      status: 2,
      title: 'Unable to update series',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Series updated',
    message: 'The series has been successfully updated.',
  };
}
