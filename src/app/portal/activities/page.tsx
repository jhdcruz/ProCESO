import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { ActivitiesShell } from './_components/ActivitiesShell';

export const metadata: Metadata = {
  title: 'Activities - ' + defaultMetadata.title,
};

export default function ActivitiesPage() {
  return <ActivitiesShell />;
}
