import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { CertsShell } from './_components/CertsShell';

export const metadata: Metadata = {
  title: 'Certifications - ' + defaultMetadata.title,
};

export default async function ActivitiesPage() {
  return <CertsShell />;
}
