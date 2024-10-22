'use client';

import { type ReactNode } from 'react';
import { AppShell } from '@mantine/core';
import { sidebarRoutes } from '@/app/routes';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useUser } from '@/components/Providers/UserProvider';
import styles from './AppContainer.module.css';

/**
 * The main layout for the application.
 */
export function AppContainer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = useUser();

  return (
    <AppShell
      layout="alt"
      navbar={{
        width: 240,
        breakpoint: 'sm',
      }}
      padding="md"
      transitionDuration={350}
      transitionTimingFunction="ease-out"
      withBorder={false}
    >
      <AppShell.Navbar className={styles.bg} pl="xs" zIndex={100}>
        <Sidebar routes={sidebarRoutes} user={user} />
      </AppShell.Navbar>

      <AppShell.Main className={styles.main}>{children}</AppShell.Main>
    </AppShell>
  );
}
