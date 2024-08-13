'use client';

import {
  Avatar,
  Group,
  Menu,
  Text,
  UnstyledButton,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconChevronRight, IconLogout, IconSunMoon } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/utils/supabase/client';

import classes from './UserButton.module.css';
import { memo } from 'react';

// Item contents of the user button dropdown in sidebar menu
const MenuItems = () => {
  const router = useRouter();

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  const onSignOut = async () => {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.replace('/login');
    }
  };

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
        leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
        onClick={onSignOut}
      >
        Log out
      </Menu.Item>
    </Menu.Dropdown>
  );
};

export interface UserAvatarProps {
  avatarUrl: string;
  name: string;
  email: string;
}

export const UserButton = memo(
  ({ avatarUrl, email, name }: UserAvatarProps) => (
    <Menu position="right" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar radius="xl" src={avatarUrl} />

            <div className="flex-1">
              <Text fw={500} lineClamp={1} size="sm">
                {name}
              </Text>

              <Text c="dimmed" lineClamp={1} size="xs">
                {email}
              </Text>
            </div>

            <IconChevronRight
              stroke={1.5}
              style={{ width: rem(14), height: rem(14) }}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <MenuItems />
    </Menu>
  ),
);
UserButton.displayName = 'UserButton';
