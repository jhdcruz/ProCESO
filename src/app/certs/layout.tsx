import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { metadata as defaultMetadata } from '@/app/layout';
import { Container, Box, Group } from '@mantine/core';
import cesoLogo from '@/components/_assets/img/ceso-manila.webp';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
};

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <Container pb="lg" size="md">
      <Group justify="center" my="xl">
        <Image
          alt="Community Extensions Services Office of Technological Institute of the Philippines - Manila"
          className="rounded-md shadow-md"
          height={102}
          placeholder="blur"
          priority={false}
          src={cesoLogo}
          width={256}
        />
      </Group>

      <Box
        bg="light-dark(
            var(--mantine-color-white),
            var(--mantine-color-dark-6)
          )"
        className="rounded-xl shadow-lg"
        my="lg"
        p="xl"
      >
        {children}
      </Box>
    </Container>
  );
}
