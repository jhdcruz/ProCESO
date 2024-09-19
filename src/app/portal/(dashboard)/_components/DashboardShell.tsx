'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@mantine/core';
import { PageLoader } from '@/components/Loader/PageLoader';

const Calendar = dynamic(
  () => import('@/components/Calendar/Calendar').then((mod) => mod.Calendar),
  {
    loading: () => <PageLoader />,
    ssr: false,
  },
);

export default function DashboardShell() {
  return (
    <AppShell.Main>
      <Calendar />
    </AppShell.Main>
  );
}
