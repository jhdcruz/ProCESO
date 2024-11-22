'use client';

import { memo, useState, useEffect } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Autocomplete,
  type AutocompleteProps,
  Avatar,
  Group,
  Text,
  Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getActivities } from '@/libs/supabase/api/activity';
import type { Tables } from '@/libs/supabase/_database';
import { formatDateRange } from 'little-date';

export const ActivityInput = memo((props: AutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [activityQuery] = useDebouncedValue(query, 200);
  const [data, setData] = useState<Tables<'activities_details_view'>[]>([]);
  const [loading, setLoading] = useState(false);

  // custom autocomplete item ui
  const renderAutocompleteOption: AutocompleteProps['renderOption'] = ({
    option,
  }) => {
    const activity = data.find((activity) => activity.id === option.value);
    return (
      <Group gap="sm">
        <Avatar
          className="object-contain"
          color="initials"
          name={activity?.title as string}
          radius="md"
          size={90}
          src={activity?.image_url}
        />
        <div>
          <Text fw="bold" size="sm">
            {data.find((activity) => activity.id === option.value)?.title}
          </Text>
          <Text c="dimmed" size="xs">
            {activity?.date_starting &&
              formatDateRange(
                new Date(activity.date_starting),
                new Date(activity?.date_ending!),
                {
                  includeTime: true,
                },
              )}
          </Text>
        </div>
      </Group>
    );
  };

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      const response = await getActivities({ search: activityQuery });

      if (response.data) {
        setData(response.data);
      } else {
        notifications.show({
          title: 'Unable to fetch activity',
          message: response.message,
          color: 'red',
          withBorder: true,
          withCloseButton: true,
          autoClose: 5000,
        });
      }

      setLoading(false);
    };

    // practivities query on initial render
    if (activityQuery) {
      // noinspection JSIgnoredPromiseFromCall
      void fetchSeries();
    }
  }, [activityQuery]);

  return (
    <Autocomplete
      data={data.map((activity) => ({
        value: activity.id!,
        label: activity.title,
      }))}
      label="Activity Title"
      limit={5}
      onChangeCapture={(e) => setQuery(e.currentTarget.value)}
      placeholder="Brigada Eskwela"
      renderOption={renderAutocompleteOption}
      rightSection={loading ? <Loader size="1rem" /> : null}
      {...props}
    />
  );
});
ActivityInput.displayName = 'ActivityInput';
