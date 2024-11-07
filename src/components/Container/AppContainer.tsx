'use client';

import { type ReactNode } from 'react';
import { ActionIcon, AppShell, Group } from '@mantine/core';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { IconMenu2 } from '@tabler/icons-react';
import { sidebarRoutes } from '@/app/routes';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useUser } from '@/components/Providers/UserProvider';
import styles from './AppContainer.module.css';

/**
 * The main layout for the application.
 */
export function AppContainer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = useUser();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const { width } = useViewportSize();

  return (
    <AppShell
      header={{
        height: 64,
        collapsed: width <= 768 ? false : true,
        offset: false,
      }}
      layout="alt"
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: mobileOpened },
      }}
      padding="md"
      transitionTimingFunction="ease-out"
      withBorder={false}
    >
      <AppShell.Navbar className={styles.bg} px="sm" zIndex={100}>
        <Sidebar
          opened={!mobileOpened}
          routes={sidebarRoutes}
          toggle={toggleMobile}
          user={user}
        />
      </AppShell.Navbar>

      <AppShell.Header bg="transparent" className={styles.header}>
        <Group hiddenFrom="sm">
          <ActionIcon
            aria-label="Toggle Menu"
            className="shadow-md"
            color="gray"
            onClick={toggleMobile}
            radius="md"
            size="xl"
            variant="default"
          >
            <IconMenu2 stroke={1.5} />
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Main className={styles.main}>{children}</AppShell.Main>
    </AppShell>
  );
}
