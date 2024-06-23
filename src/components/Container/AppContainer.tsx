'use client';

import type { ReactNode } from 'react';
import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RedirectType, redirect } from 'next/navigation';

import { sidebarRoutes } from '@/app/routes';
import Sidebar from '@/components/Sidebar';
import type { UserAvatarProps } from '@/components/UserButton';

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export function AppContainer({
  user,
  children,
}: Readonly<{
  user: UserAvatarProps;
  children: ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();

  // Redirect to log in on invalid session,
  // presumably expired/timeout.
  if (!user) {
    return redirect('/login', RedirectType.replace);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      layout="alt"
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group className="content-center" h="100%" px="md">
          <Burger hiddenFrom="sm" onClick={toggle} opened={opened} size="sm" />
          Test
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar routes={sidebarRoutes} user={user} />
      </AppShell.Navbar>

      <>{children}</>
    </AppShell>
  );
}
