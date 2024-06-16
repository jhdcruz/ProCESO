'use client';

import {
  ActionIcon,
  Group,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export default function ThemeSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <Group justify="center">
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
        }
        variant="default"
        size="lg"
        aria-label="Toggle color scheme"
      >
        <IconSun className="hidden w-5 dark:block" stroke={1.2} />
        <IconMoon className="block w-5 dark:hidden" stroke={1.2} />
      </ActionIcon>
    </Group>
  );
}
