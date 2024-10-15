'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  rem,
  Container,
  Title,
  Text,
  Button,
  Group,
  AspectRatio,
} from '@mantine/core';
import { IconShieldLock, IconLogout, IconTicket } from '@tabler/icons-react';
import { signOut } from '@/utils/sign-out';
import classes from './NotFound.module.css';
import Image from 'next/image';

function Disabled() {
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
              Your account were disabled.
            </Title>
            <IconShieldLock color="#828282" size={48} />
          </Group>
          <Text
            c="dimmed"
            className={classes.description}
            size="lg"
            ta="center"
          >
            Your account is currently disabled by a system administrator.
            <br />
            Consult a CESO Admin or the ITSO for more information.
          </Text>
          <Group justify="center">
            <Button
              leftSection={<IconLogout size={18} />}
              onClick={() => signOut(router)}
              size="md"
              variant="default"
            >
              Sign out
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

export const DisabledNote = memo(Disabled);
