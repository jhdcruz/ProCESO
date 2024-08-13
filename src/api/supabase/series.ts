import { createBrowserClient } from '@/utils/supabase/client';

/**
 * Get event series that are active.
 *
 * @param columns - Columns to select from the table.
 * @param filter - Ilike filter to apply to the query (case-insensitive).
 */
export const getFilteredSeries = async (filter?: string) => {
  const supabase = createBrowserClient();

  const { data: series, error } = await supabase
    .from('series')
    .select()
    .eq('active', true)
    .ilike('title', `%${filter}%`);

  return { series, error };
};
