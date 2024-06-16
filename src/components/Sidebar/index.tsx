import { Group, ScrollArea } from '@mantine/core';
import Image from 'next/image';
import classes from './Sidebar.module.css';

import type { Routes } from '@/app/routes';
import LinksGroup from '@/components/LinksGroup';
import UserButton, { type UserAvatarProps } from '@/components/UserButton';
import ThemeSwitcher from '../Buttons/ThemeSwitcher';

/**
 * Main sidebar component
 * Reference: https://ui.mantine.dev/component/navbar-nested/
 */
export default function Sidebar({
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
            className="rounded-md bg-contain"
            width={140}
            height={60}
            src="/assets/ceso-manila.webp"
            alt=""
          />

          <Group gap={2}>{/* TODO */}</Group>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className="py-1">{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton {...user} />
      </div>
    </nav>
  );
}
