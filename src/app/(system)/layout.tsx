import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect, RedirectType } from 'next/navigation';

import { metadata as defaultMetadata } from '@/app/layout';
import { AppContainer } from '@/components/Container';
import { useCurrentUser } from '@/hooks/supabase/useUser';
import '@mantine/dropzone/styles.css';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await useCurrentUser();

  if (!user) {
    redirect('/login', RedirectType.replace);
  }

  return <AppContainer user={user}>{children}</AppContainer>;
}
