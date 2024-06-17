import { onEmailLogin } from '@/app/login/actions';
import { GoogleButton } from '@/components/Authentication/GoogleButton';
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

import ThemeSwitcher from '@/components/Buttons/ThemeSwitcher';
import SystemHealth from '@/components/Badges/SystemHealth';

import JitbitScript from '@/components/Legacy/JitbitScript';
import cesoLogo from './ceso-manila.webp';
import '@/app/jitbit.css';

export const dynamic = 'force-dynamic';

export default async function Login() {
  return (
    <form
      action={onEmailLogin}
      className="min-h-screen bg-[url('/assets/bg-2425.webp')] bg-cover bg-right bg-no-repeat"
    >
      <Paper
        className="flex min-h-screen max-w-full flex-col items-center justify-between pt-10 sm:max-w-md"
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

      <JitbitScript />
    </form>
  );
}
