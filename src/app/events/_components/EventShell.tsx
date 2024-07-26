'use client';

import type { ReactNode } from 'react';
import { AppShell, Button, Group, TextInput, rem } from '@mantine/core';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';

export default function EventShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AppShell.Header>
        <Group className="content-center" h="100%" px="md">
          {/*  Search input */}
          <form>
            <TextInput
              leftSection={
                <IconSearch
                  stroke={1.5}
                  style={{ width: rem(16), height: rem(16) }}
                />
              }
              placeholder="Search for events"
            />
          </form>

          {/* Event Buttons */}
          <Button leftSection={<IconCalendarPlus size={14} />}>
            Schedule new activity
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </>
  );
}
