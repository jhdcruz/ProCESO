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
          <h3>Test</h3>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar routes={sidebarRoutes} user={user} />
      </AppShell.Navbar>

      <AppShell.Main>
        Alt layout – Navbar and Aside are rendered on top on Header and Footer
      </AppShell.Main>

      <AppShell.Aside p="md">Aside</AppShell.Aside>
      <AppShell.Footer p="md">Footer</AppShell.Footer>
    </AppShell>
  );
}
