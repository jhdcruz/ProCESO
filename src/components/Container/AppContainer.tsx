'use client';

import { type ReactNode } from 'react';
import { AppShell } from '@mantine/core';
import { sidebarRoutes } from '@/app/routes';
import Sidebar from '@/components/Sidebar/Sidebar';
import type { Tables } from '@/libs/supabase/_database';

/**
 * The main layout for the application.
 */
export function AppContainer({
  user,
  children,
}: Readonly<{
  user: Tables<'users'>;
  children: ReactNode;
}>) {
  return (
    <AppShell
      footer={{ height: 50 }}
      header={{ height: 54 }}
      layout="alt"
      navbar={{
        width: 260,
        breakpoint: 'sm',
      }}
      padding="md"
      transitionDuration={350}
      transitionTimingFunction="ease-out"
    >
      <AppShell.Navbar zIndex={100}>
        <Sidebar routes={sidebarRoutes} user={user} />
      </AppShell.Navbar>

      <>{children}</>
    </AppShell>
  );
}
