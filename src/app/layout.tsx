import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { getUserSession } from '@/utils/supabase/api/user';
import { AppContainer } from '@/components/Container';
import { RootLayout, defaultMetadata } from '@/components/RootLayout';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getUserSession();

  return (
    <RootLayout>
      <AppContainer user={user}>{children}</AppContainer>
    </RootLayout>
  );
}
