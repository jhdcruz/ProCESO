'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { IconLogout, IconTicket } from '@tabler/icons-react';
import { systemUrl } from '@/app/routes';
import classes from './Fallbacks.module.css';

function NotFoundComponent() {
  const router = useRouter();

  return (
    <Container className={classes.fullscreen}>
      <div className={classes.inner}>
        <div className={classes.content}>
          <Image
            alt=""
            className="mx-auto mb-6 block rounded-md shadow-sm"
            height={102}
            priority={false}
            src="/assets/ceso-manila.webp"
            width={256}
          />

          <Group
            content="center"
            gap="xs"
            preventGrowOverflow={false}
            wrap="nowrap"
          >
            <Title className={`${classes.title} drop-shadow-md`} ta="center">
              Page not found
            </Title>
          </Group>
          <Text
            c="dimmed"
            className={classes.description}
            size="lg"
            ta="center"
          >
            This page does not exist or you do not have permission to access it.
            <br />
            Consult a CESO Admin or the ITSO for more information.
          </Text>
          <Group justify="center">
            <Button
              leftSection={<IconLogout size={18} />}
              onClick={() => router.push(systemUrl)}
              variant="default"
            >
              Back to home
            </Button>

            <Button
              component="a"
              href="https://tip.jitbit.com/Tickets/New?ref=ProCESO"
              leftSection={<IconTicket size={18} />}
              target="_blank"
            >
              Submit a ticket
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  );
}

export const NotFound = memo(NotFoundComponent);
