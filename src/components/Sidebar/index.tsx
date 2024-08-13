import { memo, Suspense } from 'react';
import Image from 'next/image';
import { Group, ScrollArea } from '@mantine/core';

import type { Routes } from '@/app/routes';
import { type UserAvatarProps, UserButton } from '@/components/UserButton';
import { LinksGroup } from '@/components/LinksGroup';
import classes from './Sidebar.module.css';

/**
 * Main sidebar component
 * Reference: https://ui.mantine.dev/component/navbar-nested/
 */
export function Sidebar({
  user,
  routes,
}: {
  user: UserAvatarProps;
  routes: Routes;
}) {
  const links = routes.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Image
            alt=""
            className="rounded-md bg-contain"
            height={60}
            src="/assets/ceso-manila.webp"
            width={160}
          />

          <Group gap={2}>{/* TODO */}</Group>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className="py-1">{links}</div>
      </ScrollArea>

      <Suspense>
        <div className={classes.footer}>
          <UserButton {...user} />
        </div>
      </Suspense>
    </nav>
  );
}

export default memo(Sidebar);
