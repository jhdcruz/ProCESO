'use client';

import { memo, type ReactNode } from 'react';
import { AppShell } from '@mantine/core';

function SeriesShellComponent({ children }: { children: ReactNode }) {
  return <AppShell.Main>{children}</AppShell.Main>;
}

export const SeriesShell = memo(SeriesShellComponent);
