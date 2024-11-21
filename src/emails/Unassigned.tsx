import { Link, Text } from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import { sidebarRoutes } from '@/app/routes';
import Template from './_Template';
import '@mantine/core/styles.css';

export default function Unassigned({
  activity,
}: {
  activity: Tables<'activities'>;
}) {
  const link = `https://deuz.tech${sidebarRoutes[1]?.links?.[0]?.link}/${activity?.id as string}/info`;

  return (
    <Template>
      <Text className="mt-8">
        You are <span className="font-bold">no longer assigned</span> for the
        activity: <br />
        <Link className="font-semibold text-yellow-500" href={link}>
          {activity?.title ?? 'Untitled Activity'}
        </Link>
        .
      </Text>
    </Template>
  );
}
