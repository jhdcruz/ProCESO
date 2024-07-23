'use client';

import { Suspense, type ReactNode } from 'react';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RedirectType, redirect } from 'next/navigation';

import { sidebarRoutes } from '@/app/routes';
import { PageLoader } from '@/components/Loader/PageLoader';
import type { UserAvatarProps } from '@/components/UserButton';
import Sidebar from '@/components/Sidebar';

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
  const [opened] = useDisclosure();

  // Redirect to log in on invalid session,
  // presumably expired/timeout.
  if (!user) {
    return redirect('/login', RedirectType.replace);
  }

  return (
    <AppShell
      header={{ height: 64 }}
      layout="alt"
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      transitionDuration={350}
      transitionTimingFunction="ease"
    >
      <AppShell.Navbar>
        <Sidebar routes={sidebarRoutes} user={user} />
      </AppShell.Navbar>

      <Suspense fallback={<PageLoader />}>
        <>{children}</>
      </Suspense>
    </AppShell>
  );
}
