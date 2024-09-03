'use client';

import { type ReactNode } from 'react';
import { AppShell, Button, Group, TextInput, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import { EventFormModal } from './Forms/EventFormModal';

export default function EventsShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <AppShell.Header>
        <Group className="content-center" h="100%" px="md">
          {/* New Event */}
          <Button
            className="drop-shadow-sm"
            leftSection={<IconCalendarPlus size={16} />}
            onClick={open}
          >
            Schedule new event
          </Button>
          <EventFormModal close={close} opened={opened} />

          {/*  Event search */}
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
