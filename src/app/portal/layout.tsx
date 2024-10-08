import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect, RedirectType } from 'next/navigation';

import { metadata as defaultMetadata } from '@/app/layout';
import { AppContainer } from '@/components/Container/AppContainer';
import { getCurrentUser } from '@/libs/supabase/api/user';
import '@mantine/dropzone/styles.layer.css';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser().then((res) => res.data);
  if (!user) redirect('/', RedirectType.replace);

  return <AppContainer user={user}>{children}</AppContainer>;
}
