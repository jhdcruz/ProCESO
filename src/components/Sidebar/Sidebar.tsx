import { memo, Suspense } from 'react';
import Image from 'next/image';
import { Group, ScrollArea, Text } from '@mantine/core';
import type { Tables } from '@/libs/supabase/_database';

import type { Routes } from '@/app/routes';
import { SidebarUser } from '@/components/Sidebar/SidebarUser';
import { LinksGroup } from '@/components/Sidebar/LinksGroup';
import classes from './Sidebar.module.css';
import { useUser } from '@/components/Providers/UserProvider';

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
        <Group justify="center">
          <Image
            alt=""
            className="rounded-md bg-contain"
            height={60}
            src="/assets/ceso-manila.webp"
            width={160}
          />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className="py-1">{links}</div>
      </ScrollArea>

      <Text c="dimmed" mx="auto" py="xs" size="xs">
        Build ver.{' '}
        {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'DEV'}
      </Text>

      <Suspense>
        <div className={classes.footer}>
          <SidebarUser {...user} />
        </div>
      </Suspense>
    </div>
  );
}

export default memo(Sidebar);
