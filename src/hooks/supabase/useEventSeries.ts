import { useClient } from './useClient';

/**
 * Get event series that are active.
 *
 * @param columns - Columns to select from the table.
 * @param filter - Filter to apply to the query (case-insensitive).
 */
export const useEventSeries = async (filter?: string) => {
  const supabase = useClient();

  const { data: series, error } = await supabase
    .from('series')
    .select()
    .eq('active', true)
    .ilike('title', `%${filter}%`);

  return { series, error };
};
