import { Link, Text } from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import { sidebarRoutes } from '@/app/routes';
import dayjs from '@/libs/dayjs';
import Template from './_Template';
import '@mantine/core/styles.css';

export default function Assigned({
  activity,
}: {
  activity: Tables<'activities'>;
}) {
  const link = `https://deuz.tech${sidebarRoutes[1]?.links?.[0]?.link}/${activity?.id as string}/info`;

  return (
    <Template>
      <Text className="mt-8">
        You have been assigned for an activity: <br />
        <Link
          className="font-semibold text-yellow-500 underline underline-offset-1"
          href={link}
        >
          {activity?.title ?? 'Untitled Activity'}
        </Link>
        .
      </Text>

      {activity?.date_starting && activity?.date_ending ? (
        <Text>
          The activity is to be conducted at{' '}
          <span className="font-bold">
            {dayjs(activity.date_starting).format('MMM D, YYYY h:mm A')}
            {' - '}
            {dayjs(activity.date_ending).format('MMM D, YYYY h:mm A')}
          </span>
          .
        </Text>
      ) : (
        <Text>The date of the activity is yet to be decided.</Text>
      )}
    </Template>
  );
}
