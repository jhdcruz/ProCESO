import { lazy, memo, Suspense } from 'react';
import { Loader, ScrollArea, Stack, Text } from '@mantine/core';
import type { Tables } from '@/libs/supabase/_database';

import type { Routes } from '@/app/routes';
import { LinksGroup } from '@/components/Sidebar/LinksGroup';
import classes from './Sidebar.module.css';
import { useUser } from '@/components/Providers/UserProvider';

const SidebarUser = lazy(() =>
  import('@/components/Sidebar/SidebarUser').then((mod) => ({
    default: mod.SidebarUser,
  })),
);

const SystemHealth = lazy(() =>
  import('@/components/Buttons/SystemHealth').then((mod) => ({
    default: mod.SystemHealth,
  })),
);

/**
 * Main sidebar component
 * Reference: https://ui.mantine.dev/component/navbar-nested/
 */
export function Sidebar({
  user,
  routes,
}: {
  user: Tables<'users'>;
  routes: Routes;
}) {
  const { role } = useUser();

  // filter displayed links based on user role
  const links = routes.map((item) =>
    !item.access.includes(role!) ? null : (
      <LinksGroup {...item} key={item.label} />
    ),
  );

  return (
    <div className={classes.navbar}>
      <div className={classes.header}>
        <Suspense fallback={<Loader size="lg" type="dots" />}>
          <SidebarUser {...user} />
        </Suspense>
      </div>

      <ScrollArea className={classes.links}>
        <div className="py-1">{links}</div>
      </ScrollArea>

      <Stack align="center" gap="xs" justify="flex-end">
        <Suspense fallback={<Loader size="sm" />}>
          <SystemHealth />
        </Suspense>

        <Text c="dimmed" mx="auto" py="xs" size="xs">
          Build ver.{' '}
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'DEV'}
        </Text>
      </Stack>
    </div>
  );
}

export default memo(Sidebar);
