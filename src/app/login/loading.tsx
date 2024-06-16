import { Paper, Stack, Text } from '@mantine/core';
import Image from 'next/image';
import cesoLogo from './ceso-manila.webp';

export default function Loading() {
  return (
    <Paper className="flex h-screen w-screen items-center self-center align-middle">
      <Stack className="mx-auto text-center">
        <Image
          className="rounded-md"
          src={cesoLogo}
          alt="Loading"
          draggable={false}
          placeholder="blur"
          width={300}
          height={130}
          priority
        />

        <Text>We&apos;re preparing the system, please wait...</Text>
      </Stack>
    </Paper>
  );
}
