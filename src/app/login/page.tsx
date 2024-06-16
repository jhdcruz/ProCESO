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
      className="min-h-screen bg-[url('/assets/bg-2425.webp')] bg-cover bg-right bg-no-repeat"
      action={onEmailLogin}
    >
      <Paper
        className="flex min-h-screen max-w-full flex-col items-center justify-between pt-10 sm:max-w-md"
        shadow="xl"
        radius={0}
        p={30}
      >
        <main className="h-max w-[90%]">
          <Stack mt={30} mb={20} align="stretch" justify="center" gap="sm">
            <Image
              className="mx-auto mb-4 rounded-[--mantine-radius-md] bg-contain shadow-lg"
              draggable={false}
              src={cesoLogo}
              height={104}
              width={260}
              placeholder="blur"
              alt=""
            />
          </Stack>

          <TextInput
            name="email"
            label="Email address"
            placeholder="admin@tip.edu.ph"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
          />
          <PasswordInput
            name="password"
            label="Password"
            placeholder="Your password"
            mt="md"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <Button type="submit" mt="xl" fullWidth>
            Login
          </Button>

          <Divider label="Or continue using" labelPosition="center" my="lg" />

          <GoogleButton />
        </main>

        <Group justify="space-around" className="w-full">
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
