'use client';

import { memo, useState, useEffect } from 'react';
import { Autocomplete, type AutocompleteProps, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getFilteredSeries } from '@/libs/supabase/api/series';
import type { Tables } from '@/libs/supabase/_database';
import { useDebouncedValue } from '@mantine/hooks';

/**
 * Activity series autocomplete input
 */
export const SeriesInput = memo((props: AutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [seriesQuery] = useDebouncedValue(query, 200);
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dataLimit = 5;

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      const response = await getFilteredSeries(seriesQuery, dataLimit);

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

    void fetchSeries();
  }, [seriesQuery]);

  return (
    <Autocomplete
      data={data}
      label="Activity Series"
      limit={dataLimit}
      onChangeCapture={(e) => setQuery(e.currentTarget.value)}
      placeholder="Brigada Eskwela"
      rightSection={loading ? <Loader size="1rem" /> : null}
      {...props}
    />
  );
});

SeriesInput.displayName = 'SeriesInput';
