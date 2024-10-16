import { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { JitbitScript } from '@/components/Integrations/JitbitScript';
import { DisabledNote } from '@/components/Fallbacks/DisabledNote';
import '@/styles/jitbit.css';

export const metadata: Metadata = {
  title: 'Access disabled - ' + defaultMetadata.title,
};

export default function Page() {
  return (
    <>
      <DisabledNote />
      <JitbitScript />
    </>
  );
}
