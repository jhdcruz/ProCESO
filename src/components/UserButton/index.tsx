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

import classes from './UserButton.module.css';
import { createBrowserClient } from '@/utils/supabase/client';

export type UserAvatarProps = {
  avatarUrl: string;
  name: string;
  email: string;
};

export default function UserButton({
  avatarUrl,
  email,
  name,
}: UserAvatarProps) {
  return (
    <Menu shadow="md" width={200} position="right">
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar src={avatarUrl} radius="xl" />

            <div className="flex-1">
              <Text size="sm" fw={500} lineClamp={1}>
                {name}
              </Text>

              <Text c="dimmed" size="xs" lineClamp={1}>
                {email}
              </Text>
            </div>

            <IconChevronRight
              style={{ width: rem(14), height: rem(14) }}
              stroke={1.5}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <MenuItems />
    </Menu>
  );
}

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
