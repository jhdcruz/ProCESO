import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { metadata as defaultMetadata } from '@/app/layout';
import { JitbitScript } from '@/components/Integrations/JitbitScript';
import { PageLoader } from '@/components/Loader/PageLoader';
import '@/styles/jitbit.css';

const DisabledNote = dynamic(
  () =>
    import('@/components/Fallbacks/DisabledNote').then(
      (mod) => mod.DisabledNote,
    ),
  { loading: () => <PageLoader /> },
);

export const metadata: Metadata = {
  title: 'Access Disabled | ' + defaultMetadata.title,
};

export default function Page() {
  return (
    <>
      <DisabledNote />
      <JitbitScript />
    </>
  );
}
