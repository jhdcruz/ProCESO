import { lazy, memo, Suspense } from 'react';
import { Burger, Group, Loader, ScrollArea, Stack, Text } from '@mantine/core';
import type { Tables } from '@/libs/supabase/_database';

import type { Routes } from '@/app/routes';
import { LinksGroup } from '@/components/Sidebar/LinksGroup';
import { useUser } from '@/components/Providers/UserProvider';
import classes from './Sidebar.module.css';
import { SidebarUser } from './SidebarUser';

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
  opened,
  toggle,
}: {
  user: Tables<'users'>;
  routes: Routes;
  opened: boolean;
  toggle: () => void;
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
        <Group wrap="nowrap">
          <SidebarUser {...user} />
          <Burger
            aria-label="Toggle sidebar menu"
            hiddenFrom="sm"
            onClick={toggle}
            opened={opened}
          />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div>{links}</div>
      </ScrollArea>

      <Stack align="center" gap="xs" justify="flex-end">
        <Suspense fallback={<Loader mx="auto" size="sm" type="dots" />}>
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
