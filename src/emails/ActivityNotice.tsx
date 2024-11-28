import { Link, Text } from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import dayjs from '../libs/dayjs';
import Template from './_Template';
import '@mantine/core/styles.css';
import { sidebarRoutes } from '@/app/routes';

export default function ActivityNotice({
  activity,
}: {
  activity: Tables<'activities'>;
}) {
  const link = `https://deuz.tech${sidebarRoutes[1]?.links?.[0]?.link}/${activity?.id as string}/info`;

  return (
    <Template>
      <Text className="mt-8">
        This is to inform you that the Community Extensions Services Office -
        Manila has scheduled to conduct an activity with your department,
        entitled: <br />
        <Link
          className="font-bold text-yellow-500 underline underline-offset-1"
          href={link}
        >
          {activity?.title ?? 'Untitled Activity'}
        </Link>
        .
        <br />
        which is in {dayjs(activity?.date_starting).toNow(true)}.
      </Text>

      {activity?.date_starting && activity?.date_ending ? (
        <Text>
          The activity is to be conducted at{' '}
          <span className="font-bold">
            {dayjs(activity.date_starting).format('MMMM D, YYYY h:mm A')}
            {' - '}
            {dayjs(activity.date_ending).format('MMMM D, YYYY h:mm A')}
          </span>
          .
        </Text>
      ) : (
        <Text>
          The activity is to be conducted at{' '}
          <span className="font-bold">
            {dayjs(activity?.date_starting).format('MMMM DD, YYYY')}
          </span>
          .
        </Text>
      )}
    </Template>
  );
}
