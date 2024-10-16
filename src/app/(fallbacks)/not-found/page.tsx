import { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { JitbitScript } from '@/components/Integrations/JitbitScript';
import { NotFound } from '@/components/Fallbacks/NotFound';
import '@/styles/jitbit.css';

export const metadata: Metadata = {
  title: 'Page not found - ' + defaultMetadata.title,
};

export default function Page() {
  return (
    <>
      <NotFound />
      <JitbitScript />
    </>
  );
}
