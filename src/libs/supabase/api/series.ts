import { createBrowserClient } from '@/libs/supabase/client';
import type { SeriesResponse } from '@/libs/supabase/api/_response';
import type { SupabaseClient } from '@supabase/supabase-js';
import { systemUrl } from '@/app/routes';
import { revalidatePath } from 'next/cache';

/**
 * Get activity series that are active.
 *
 * @param filter - Ilike filter to apply to the query (case-insensitive).
 */
export async function getFilteredSeries(
  filter?: string,
): Promise<SeriesResponse> {
  const supabase = createBrowserClient();

  const { data: series, error } = await supabase
    .from('series')
    .select()
    .ilike('title', `%${filter}%`);

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
