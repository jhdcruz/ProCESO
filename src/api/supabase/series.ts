import { createBrowserClient } from '@/utils/supabase/client';
import type { ApiResponse } from '@/api/types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get event series that are active.
 *
 * @param filter - Ilike filter to apply to the query (case-insensitive).
 */
export async function getFilteredSeries(filter?: string): Promise<ApiResponse> {
  const supabase = createBrowserClient();

  const { data: series, error } = await supabase
    .from('series')
    .select()
    .eq('active', true)
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
}): Promise<ApiResponse> {
  if (!supabase) supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('series')
    .insert({ title })
    .select()
    .limit(1)
    .single();

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
