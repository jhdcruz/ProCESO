'use client';

import { type ReactNode } from 'react';
import { AppShell, Button, Group, TextInput, rem } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { NewEventForm } from './Forms/NewEventForm';

export default function EventShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AppShell.Header>
        <Group className="content-center" h="100%" px="md">
          {/* Event Buttons */}
          <NewEventForm />

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
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </>
  );
}
