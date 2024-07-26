'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@mantine/core';

export default function DashboardShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AppShell.Main>
      Content
      {children}
    </AppShell.Main>
  );
}
