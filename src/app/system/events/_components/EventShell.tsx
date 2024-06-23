'use client';
import type { ReactNode } from 'react';
import { AppShell } from '@mantine/core';

export default function EventShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AppShell.Main>{children}</AppShell.Main>
    </>
  );
}
