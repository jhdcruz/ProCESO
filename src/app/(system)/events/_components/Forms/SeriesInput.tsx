'use client';

import { memo, useState, useDeferredValue, useEffect } from 'react';
import { Autocomplete, type AutocompleteProps, Loader } from '@mantine/core';
import { useEventSeries } from '@/hooks/supabase/useEventSeries';

/**
 * Event series autocomplete input
 */
export const SeriesInput = memo((props: AutocompleteProps) => {
  const [query, setQuery] = useState('');
  const seriesQuery = useDeferredValue<string>(query);
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const FetchSeries = async () => {
      setLoading(true);
      const { series } = await useEventSeries(seriesQuery);

      if (series) {
        setData(series.map((s) => s.title ?? []));
      }

      setLoading(false);
    };

    // prevents query on initial render
    if (seriesQuery) {
      FetchSeries();
    }
  }, [seriesQuery]);

  return (
    <Autocomplete
      value={query}
      data={data}
      limit={5}
      onChange={setQuery}
      rightSection={loading ? <Loader size="1rem" /> : null}
      label="Event Series"
      placeholder="Brigada Eskwela"
      {...props}
    />
  );
});

SeriesInput.displayName = 'SeriesInput';
