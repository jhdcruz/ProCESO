'use client';

import { Suspense, type ReactNode } from 'react';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { sidebarRoutes } from '@/app/routes';
import { PageLoader } from '@/components/Loader/PageLoader';
import type { UserAvatarProps } from '@/components/UserButton';
import Sidebar from '@/components/Sidebar';

/**
 * The main layout for the application.
 */
export function AppContainer({
  user,
  children,
}: Readonly<{
  user: UserAvatarProps;
  children: ReactNode;
}>) {
  const [opened] = useDisclosure();

  return (
    <AppShell
      header={{ height: 64 }}
      layout="alt"
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      transitionDuration={350}
      transitionTimingFunction="ease"
    >
      <AppShell.Navbar className="z-10">
        <Sidebar routes={sidebarRoutes} user={user} />
      </AppShell.Navbar>

      <Suspense fallback={<PageLoader />}>
        <>{children}</>
      </Suspense>
    </AppShell>
  );
}
