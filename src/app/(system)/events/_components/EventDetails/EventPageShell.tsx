'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Group, rem, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

export default function EventPageShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();

  return (
    <>
      <AppShell.Header>
        <Group className="content-center" h="100%" px="md">
          <Button
            leftSection={
              <IconArrowLeft
                stroke={1.5}
                style={{ width: rem(16), height: rem(16) }}
              />
            }
            onClick={() => router.back()}
            variant="subtle"
          >
            Go back
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </>
  );
}
