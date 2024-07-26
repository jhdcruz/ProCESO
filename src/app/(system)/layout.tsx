import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect, RedirectType } from 'next/navigation';

import { getUser } from '@/utils/supabase/api/user';
import { AppContainer } from '@/components/Container';
import { metadata as defaultMetadata } from '@/app/layout';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getUser();

  if (!user) {
    redirect('/login', RedirectType.replace);
  }

  return <AppContainer user={user}>{children}</AppContainer>;
}
