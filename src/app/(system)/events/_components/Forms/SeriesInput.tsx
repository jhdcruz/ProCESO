'use client';

import { memo, useState, useDeferredValue, useEffect } from 'react';
import { Autocomplete, type AutocompleteProps, Loader } from '@mantine/core';
import { getFilteredSeries } from '@/api/supabase/series';

/**
 * Event series autocomplete input
 */
export const SeriesInput = memo((props: AutocompleteProps) => {
  const [query, setQuery] = useState('');
  const seriesQuery = useDeferredValue<string>(query);
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      const { series } = await getFilteredSeries(seriesQuery);

      if (series) {
        setData(series.map((s) => s.title ?? []));
      }

      setLoading(false);
    };

    // prevents query on initial render
    if (seriesQuery) {
      fetchSeries();
    }
  }, [seriesQuery]);

  return (
    <Autocomplete
      value={query}
      data={data}
      limit={5}
      onChangeCapture={(e) => setQuery(e.currentTarget.value)}
      rightSection={loading ? <Loader size="1rem" /> : null}
      label="Event Series"
      placeholder="Brigada Eskwela"
      {...props}
    />
  );
});

SeriesInput.displayName = 'SeriesInput';
