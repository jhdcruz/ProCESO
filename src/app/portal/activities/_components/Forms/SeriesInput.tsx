'use client';

import { memo, useState, useDeferredValue, useEffect } from 'react';
import { Autocomplete, type AutocompleteProps, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getFilteredSeries } from '@/libs/supabase/api/series';
import type { Tables } from '@/libs/supabase/_database';

/**
 * Activity series autocomplete input
 */
export const SeriesInput = memo((props: AutocompleteProps) => {
  const [query, setQuery] = useState('');
  const seriesQuery = useDeferredValue<string>(query);
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      const response = await getFilteredSeries(seriesQuery);

      if (response.data) {
        setData(response.data.map((s: Tables<'series'>) => s.title ?? []));
      } else {
        notifications.show({
          title: 'Unable to fetch series',
          message: response.message + ', you can set it later.',
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 8000,
        });
      }

      setLoading(false);
    };

    // practivities query on initial render
    if (seriesQuery) {
      // noinspection JSIgnoredPromiseFromCall
      void fetchSeries();
    }
  }, [seriesQuery]);

  return (
    <Autocomplete
      data={data}
      label="Activity Series"
      limit={5}
      onChangeCapture={(e) => setQuery(e.currentTarget.value)}
      placeholder="Brigada Eskwela"
      rightSection={loading ? <Loader size="1rem" /> : null}
      {...props}
    />
  );
});

SeriesInput.displayName = 'SeriesInput';
