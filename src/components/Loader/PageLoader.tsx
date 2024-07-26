import Image from 'next/image';
import { Paper, Stack, Text } from '@mantine/core';

import cesoLogo from '@/components/_assets/img/ceso-manila.webp';

export const PageLoader = () => (
  <Paper className="flex h-screen w-screen items-center self-center align-middle">
    <Stack className="mx-auto text-center">
      <Image
        alt="Loading"
        className="rounded-md"
        draggable={false}
        height={130}
        placeholder="blur"
        priority
        src={cesoLogo}
        width={300}
      />

      <Text>We&apos;re preparing the system, please wait...</Text>
    </Stack>
  </Paper>
);
