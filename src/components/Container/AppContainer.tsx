'use client';

import { type ReactNode } from 'react';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { sidebarRoutes } from '@/app/routes';
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

      <>{children}</>
    </AppShell>
  );
}
