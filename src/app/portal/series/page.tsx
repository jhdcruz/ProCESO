import { Metadata } from 'next';
import { Divider, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link } from 'react-transition-progress/next';
import { metadata as defaultMetadata } from '@/app/layout';
import { systemUrl } from '@/app/routes';
import { SeriesAccordion } from './_components/SeriesAccordion';
import { getSeries } from './actions';

export const metadata: Metadata = {
  title: 'Activity Series - ' + defaultMetadata.title,
};

export default async function SeriesPage() {
  const series = await getSeries();

  return (
    <>
      <Group content="center" mb="md" mt="sm">
        <IconPlus size={16} />
        <Text c="dimmed">
          To create a new series,{' '}
          <Link
            className="text-[var(--mantine-color-brand-7)]"
            href={`${systemUrl}/activities`}
          >
            create a new activity
          </Link>
          .
        </Text>
      </Group>

      <Divider my={20} />

      <SeriesAccordion data={series?.data ?? []} />
    </>
  );
}
