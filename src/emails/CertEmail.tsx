import { Text } from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import dayjs from '../libs/dayjs';
import Template from './_Template';
import '@mantine/core/styles.css';

export default function CertEmail({
  activity,
}: {
  activity: Tables<'activities'>;
}) {
  return (
    <Template>
      <Text className="mt-8">
        Thank you for your active participation in our recent activity,{' '}
        <span className="font-bold text-yellow-500">
          {activity?.title ?? 'Untitled Activity'}
        </span>
        {', '}
        which was conducted in{' '}
        <span className="font-bold">
          {dayjs(activity?.date_starting).format('MMMM DD, YYYY')}
        </span>
        .
      </Text>

      <Text className="my-2">
        Your involvement and enthusiasm greatly contributed to the success of
        the activity.
      </Text>

      <Text>
        We hope you found the experience valuable and engaging. Your presence
        and input were greatly appreciated, and we hope to see you again in our
        future activities.{' '}
      </Text>

      <Text className="mt-2 font-bold">
        Attached below is the respective certificate that signifies your
        involvement in the said activity.
      </Text>
    </Template>
  );
}
