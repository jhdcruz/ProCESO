import { Link, Text } from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import Template from './_Template';
import '@mantine/core/styles.css';

export default function Unassigned({
  activity,
}: {
  activity: Tables<'activities'>;
}) {
  return (
    <Template>
      <Text className="mt-8">
        You have been relieved and{' '}
        <span className="font-bold">are no longer assigned</span> for the
        activity: <br />
        <Link
          className="font-bold text-yellow-500 underline"
          href={`https://deuz.tech/activities/${activity?.id as string}`}
        >
          {activity?.title ?? 'Untitled Activity'}
        </Link>
        .
      </Text>
    </Template>
  );
}
