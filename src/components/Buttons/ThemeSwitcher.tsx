'use client';

import {
  ActionIcon,
  Group,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function ThemeSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <Group justify="center">
      <ActionIcon
        aria-label="Toggle color scheme"
        onClick={() =>
          setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
        }
        size="lg"
        variant="default"
      >
        <IconSun className="hidden dark:block" size={20} />
        <IconMoon className="block dark:hidden" size={20} />
      </ActionIcon>
    </Group>
  );
}
