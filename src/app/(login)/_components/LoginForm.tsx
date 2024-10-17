'use client';

import { memo } from 'react';
import {
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Space,
  Stack,
  TextInput,
} from '@mantine/core';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/Buttons/ThemeSwitcher';
import cesoLogo from '@/components/_assets/img/ceso-manila.webp';

import { onEmailLogin } from '../actions';
import { SystemHealth } from './SystemHealth';
import { GoogleButton } from './GoogleButton';

export function LoginFormComponent() {
  return (
    <form action={onEmailLogin} className="min-h-screen max-w-full md:flex">
      <Paper
        className="z-10 flex min-h-screen max-w-full flex-col items-center justify-between pt-10 md:w-[28rem] md:max-w-md"
        p={30}
        radius={0}
        shadow="xl"
      >
        <section className="h-max w-[90%]">
          <Stack align="stretch" gap="sm" justify="center" mb={20} mt={30}>
            <Image
              alt=""
              className="mx-auto mb-4 rounded-[--mantine-radius-md] bg-contain shadow-lg"
              draggable={false}
              height={104}
              placeholder="blur"
              src={cesoLogo}
              width={260}
            />
          </Stack>

          <Divider label="Login using" labelPosition="center" my="lg" />

          <GoogleButton />
        </section>

        <Group className="w-full" justify="space-around">
          <ThemeSwitcher />
          <SystemHealth />
          <Space w="xs" />
          <Space w="xm" />
        </Group>
      </Paper>
    </form>
  );
}

export const LoginForm = memo(LoginFormComponent);
