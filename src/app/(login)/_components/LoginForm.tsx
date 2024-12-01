'use client';

import { memo } from 'react';
import { Divider, Group, Paper, Space, Stack } from '@mantine/core';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/Buttons/ThemeSwitcher';
import cesoLogo from '@/components/_assets/img/ceso-manila.webp';

import { onEmailLogin } from '../actions';
import { GoogleButton } from './GoogleButton';
import { SystemHealth } from '@/components/Buttons/SystemHealth';

export function LoginFormComponent() {
  return (
    <form action={onEmailLogin} className="min-h-screen max-w-full md:flex">
      <Paper
        className="z-10 flex min-h-screen max-w-full flex-col items-center justify-between pt-10 md:w-[28rem] md:max-w-md"
        p={30}
        radius={0}
        shadow="xl"
      >
        <main className="h-max w-[90%]">
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

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            label="Email address"
            name="email"
            placeholder="admin@tip.edu.ph"
          />
          <PasswordInput
            autoCapitalize="none"
            autoCorrect="off"
            label="Password"
            mt="md"
            name="password"
            placeholder="Your password"
          />
          <Button fullWidth mt="xl" type="submit">
            Login
          </Button>

          <Divider label="Or continue using" labelPosition="center" my="lg" />

          <GoogleButton />
        </main>

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
