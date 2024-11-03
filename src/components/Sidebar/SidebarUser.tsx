'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  UnstyledButton,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconLogout, IconSunMoon } from '@tabler/icons-react';
import type { Tables } from '@/libs/supabase/_database';
import { signOut } from '@/utils/sign-out';
import { UserDisplay } from '@/components/Display/UserDisplay';
import classes from './SidebarUser.module.css';

// Item contents of the user button dropdown in sidebar menu
const MenuItems = () => {
  const router = useRouter();

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <Menu.Dropdown>
      <Menu.Label>Settings</Menu.Label>
      <Menu.Item
        leftSection={
          <IconSunMoon style={{ width: rem(14), height: rem(14) }} />
        }
        onClick={() =>
          setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
        }
      >
        Toggle Theme
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        color="red"
        fw="semibold"
        leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
        onClick={() => signOut(router)}
      >
        Sign out
      </Menu.Item>
    </Menu.Dropdown>
  );
};

export const SidebarUser = memo(
  ({
    avatar_url,
    email,
    name,
    department,
    role,
    other_roles,
  }: Partial<Tables<'users'>>) => (
    <Menu position="right" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <UserDisplay
            avatar_url={avatar_url}
            department={department}
            email={email}
            name={name}
            other_roles={other_roles}
            role={role}
          />
        </UnstyledButton>
      </Menu.Target>

      <MenuItems />
    </Menu>
  ),
);
SidebarUser.displayName = 'SidebarUser';
