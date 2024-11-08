import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { metadata as defaultMetadata } from '@/app/layout';
import { Alert, Container, Group, Text, Title, Box } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
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

        <Title order={3}>Activity Evaluation Form</Title>
      </Group>

      <Alert
        icon={<IconInfoCircle size={20} />}
        my="lg"
        p="lg"
        title="Privacy Consent"
      >
        <Text mb={6} size="sm">
          I understand and agree that by filing out this form I am allowing the
          Technological Institute of the Philippines to collect, use, share, and
          disclose my personal information and to store it as long as necessary
          for the fulfillment of the stated purpose and in accordance with
          applicable laws, including the Data Privacy Act of 2012 and its
          implementing Rules and Regulations, and the T.I.P. Privacy Policy.
        </Text>
        <Text mt="md" size="sm">
          The purpose and extent of collection, use, sharing, disclosure, and
          storage of my personal information was explained to me.
        </Text>
      </Alert>

      {/* Evaluation Form Container */}
      <Box
        bg="light-dark(
            var(--mantine-color-white),
            var(--mantine-color-dark-6)
          )"
        className="rounded-xl"
        my="lg"
        p="xl"
      >
        <Text size="sm">
          Thank you for participating in our Community Engagement Service
          Programs. Your feedback is crucial in helping us understand the impact
          of the program and identify areas for improvement.
        </Text>

        <Text my="md" size="sm">
          Please read the instructions carefully and provide your honest and
          thoughtful responses.
        </Text>

        {children}
      </Box>
    </Container>
  );
}
