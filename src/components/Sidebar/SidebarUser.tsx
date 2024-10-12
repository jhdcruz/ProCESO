'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Group,
  Indicator,
  Menu,
  Text,
  UnstyledButton,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconChevronRight, IconLogout, IconSunMoon } from '@tabler/icons-react';
import { getRoleColor } from '@/utils/colors';
import { signOut } from '@/utils/sign-out';
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
  ({ avatar_url, email, name, role }: Partial<Tables<'users'>>) => (
    <Menu position="right" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group wrap="nowrap">
            <Indicator
              color={getRoleColor(role)}
              inline={true}
              label={role}
              offset={-1}
              position="bottom-center"
              size={14}
              tt="capitalize"
            >
              <Avatar color="initials" radius="xl" src={avatar_url} />
            </Indicator>

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
SidebarUser.displayName = 'SidebarUser';
