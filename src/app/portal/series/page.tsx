import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { metadata as defaultMetadata } from '@/app/layout';
import { Divider, Group, Text } from '@mantine/core';
import { PageLoader } from '@/components/Loader/PageLoader';
import { SeriesShell } from './_components/SeriesShell';
import { getSeries } from './actions';
import { Link } from 'react-transition-progress/next';
import { systemUrl } from '@/app/routes';
import { IconPlus } from '@tabler/icons-react';

const SeriesAccordion = dynamic(
  () =>
    import('./_components/SeriesAccordion').then((mod) => mod.SeriesAccordion),
  {
    loading: () => <PageLoader />,
  },
);

export const metadata: Metadata = {
  title: 'Event Series - ' + defaultMetadata.title,
};

export default async function Page() {
  const series = await getSeries();

  return (
    <SeriesShell>
      <Group content="center" mb="md" mt="sm">
        <IconPlus size={16} />
        <Text c="dimmed">
          To create a new series,{' '}
          <Link
            className="text-[var(--mantine-color-brand-7)]"
            href={`${systemUrl}/events`}
          >
            create a new event
          </Link>
          .
        </Text>
      </Group>

      <Divider my={20} />

      <SeriesAccordion data={series?.data ?? []} />
    </SeriesShell>
  );
}
