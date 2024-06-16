'use client';

import { sidebarRoutes } from '@/app/routes';
import Sidebar from '@/components/Sidebar';
import { AppShell, Burger, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RedirectType, redirect } from 'next/navigation';
import type { UserAvatarProps } from '../UserButton';

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export function AppContainer(user: UserAvatarProps) {
  const [opened, { toggle }] = useDisclosure();

  // Redirect to log in on invalid session,
  // presumably expired/timeout.
  if (!user) {
    return redirect('/login', RedirectType.replace);
  }

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      transitionDuration={500}
      transitionTimingFunction="ease"
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" className="content-center">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <h3>Test</h3>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar user={user} routes={sidebarRoutes} />
      </AppShell.Navbar>

      <AppShell.Main>
        Alt layout – Navbar and Aside are rendered on top on Header and Footer
      </AppShell.Main>

      <AppShell.Aside p="md">Aside</AppShell.Aside>
      <AppShell.Footer p="md">Footer</AppShell.Footer>
    </AppShell>
  );
}
