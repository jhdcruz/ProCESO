'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { IconLogout, IconTicket, IconError404 } from '@tabler/icons-react';
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
            height={120}
            priority={false}
            src="/assets/ceso-manila.webp"
            width={290}
          />

          <Group
            content="center"
            gap="xs"
            preventGrowOverflow={false}
            wrap="nowrap"
          >
            <Title className={`${classes.title} drop-shadow-md`}>
              Page not found.
            </Title>
            <IconError404 className="ml-2" color="#828282" size={48} />
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
              size="md"
              variant="default"
            >
              Back to home
            </Button>

            <Button
              component="a"
              href="https://tip.jitbit.com/Tickets/New?ref=ProCESO"
              leftSection={<IconTicket size={18} />}
              size="md"
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
