import { Link, Text } from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import { formatDateRange } from 'little-date';
import '@mantine/core/styles.css';
import Template from './_Template';

export default function FacultyRequest({
  activity,
}: {
  activity: Tables<'activities'>;
}) {
  return (
    <Template>
      <Text className="mt-8">
        Your department has been selected for an outreach activity: <br />
        <Link
          className="font-bold text-yellow-500 underline"
          href={`https://deuz.tech/activities/${activity?.id as string}`}
        >
          {activity?.title ?? 'Untitled Activity'}
        </Link>
        .
      </Text>

      {activity?.date_starting && activity?.date_ending ? (
        <Text>
          The activity is to be conducted at{' '}
          <span className="font-bold">
            {formatDateRange(
              new Date(activity.date_starting),
              new Date(activity.date_ending),
              {
                includeTime: true,
              },
            )}
          </span>
          .
        </Text>
      ) : (
        <Text>The date of the activity is yet to be decided.</Text>
      )}

      <Link
        className="mt-5 font-bold"
        href={`https://deuz.tech/activities/${activity?.id as string}`}
      >
        Visit the activity page to delegate faculty members for the activity.
      </Link>
    </Template>
  );
}
