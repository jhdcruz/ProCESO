import { createBrowserClient } from '@/libs/supabase/client';
import type {
  SeriesResponse,
  SingleSeriesResponse,
} from '@/libs/supabase/api/_response';
import type { SupabaseClient } from '@supabase/supabase-js';
import { systemUrl } from '@/app/routes';
import { revalidatePath } from 'next/cache';

/**
 * Get series based on title.
 *
 * @param title - The title of the series.
 */
export async function getSeriesByTitle({
  title,
  supabase,
}: {
  title: string;
  supabase?: SupabaseClient;
}): Promise<SingleSeriesResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data: series, error } = await supabase
    .from('series')
    .select()
    .eq('title', title)
    .limit(1)
    .single();

  if (error) {
    return {
      status: 2,
      title: 'Unable to fetch series',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Series fetched',
    message: 'The series has been successfully fetched.',
    data: series,
  };
}

/**
 * Get activity series that are active.
 *
 * @param filter - Ilike filter to apply to the query (case-insensitive).
 */
export async function getFilteredSeries(
  filter?: string,
  limit?: number,
): Promise<SeriesResponse> {
  const supabase = createBrowserClient();

  let query = supabase
    .from('series')
    .select()
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);
  if (filter) query = query.ilike('title', `%${filter}%`);

  const { data: series, error } = await query;

  if (error) {
    return {
      status: 2,
      title: 'Unable to fetch series',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Series fetched',
    message: 'The series have been successfully fetched.',
    data: series,
  };
}

/**
 * Create a new series.
 *
 * @param title - The title of the series.
 * @param supabase - The Supabase client to use.
 */
export async function postSeries({
  title,
  supabase,
}: {
  title: string;
  supabase?: SupabaseClient;
}): Promise<SeriesResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('series')
    .insert({ title })
    .select();

  revalidatePath(`${systemUrl}/activities/series`);

  if (error) {
    return {
      status: 2,
      title: 'Unable to create series',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Series created',
    message: 'The series has been successfully created.',
    data: data,
  };
}
