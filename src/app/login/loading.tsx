import { Paper, Stack, Text } from '@mantine/core';
import Image from 'next/image';
import cesoLogo from './ceso-manila.webp';

export default function Loading() {
  return (
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
}
