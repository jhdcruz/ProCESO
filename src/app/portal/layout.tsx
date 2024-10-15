import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { metadata as defaultMetadata } from '@/app/layout';
import { AppContainer } from '@/components/Container/AppContainer';
import { UserProvider } from '@/components/Providers/UserProvider';
import { getCurrentUser } from '../actions';
import '@mantine/dropzone/styles.layer.css';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <UserProvider user={user.data!}>
      <AppContainer>{children}</AppContainer>
    </UserProvider>
  );
}
