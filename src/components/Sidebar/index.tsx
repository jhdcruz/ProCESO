import { Code, Group, Image, ScrollArea } from '@mantine/core';
import NextImage from 'next/image';
import classes from './Sidebar.module.css';

import type { Routes } from '@/app/routes';
import LinksGroup from '@/components/LinksGroup';
import UserButton, { type UserAvatarProps } from '@/components/UserButton';

/**
 * Main sidebar component
 * Reference: https://ui.mantine.dev/component/navbar-nested/
 */
export default function Sidebar({
  user,
  routes,
}: { user: UserAvatarProps; routes: Routes }) {
  const links = routes.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Image
            component={NextImage}
            width={500}
            height={400}
            src="/ceso-manila.webp"
            alt=""
          />

          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton {...user} />
      </div>
    </nav>
  );
}
