import { memo, Suspense } from 'react';
import Image from 'next/image';
import { Group, ScrollArea } from '@mantine/core';
import type { Tables } from '@/utils/supabase/types';

import type { Routes } from '@/app/routes';
import { SidebarUser } from '@/components/Sidebar/SidebarUser';
import { LinksGroup } from '@/components/Sidebar/LinksGroup';
import classes from './Sidebar.module.css';

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
  const links = routes.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <div className={classes.navbar}>
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
          <SidebarUser {...user} />
        </div>
      </Suspense>
    </div>
  );
}

export default memo(Sidebar);
