import { checkHealth, onEmailLogin } from '@/app/login/actions';
import { GoogleButton } from '@/components/Authentication/GoogleButton';
import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Space,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import Image from 'next/image';

import { ThemeSwitcher } from '@/components/Buttons/ThemeSwitcher';
import JitbitScript from '@/components/Legacy/JitbitScript';
import cesoLogo from './ceso-manila.webp';

export default async function Login() {
  return (
    <form
      className="min-h-screen bg-cover bg-no-repeat bg-right bg-[url('/assets/bg-2425.webp')]"
      action={onEmailLogin}
    >
      <Paper
        className="flex flex-col shadow-2xl justify-between items-center min-h-screen sm:max-w-md pt-10 max-w-full"
        radius={0}
        p={30}
      >
        <main className="w-[90%] h-max">
          <Stack mt={30} mb={20} align="stretch" justify="center" gap="sm">
            <Image
              className="rounded-[--mantine-radius-md] mx-auto mb-4 bg-contain shadow-lg"
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

/**
 * Check the system status and display health badge.
 */
async function SystemHealth() {
  const health = await checkHealth();

  return health === 2 ? (
    <Tooltip label="All systems are not working!">
      <Badge
        className="cursor-pointer normal-case"
        component="a"
        variant="dot"
        color="red"
        size="md"
        px={15}
        py={12}
        radius="md"
        target="__blank"
        href={process.env.NEXT_PUBLIC_STATUS_PAGE}
      >
        All systems down!
      </Badge>
    </Tooltip>
  ) : health === 1 ? (
    <Tooltip label="Some functionality might not work.">
      <Badge
        className="cursor-pointer normal-case"
        component="a"
        variant="dot"
        color="yellow"
        size="md"
        px={15}
        py={12}
        radius="md"
        target="__blank"
        href={process.env.NEXT_PUBLIC_STATUS_PAGE}
      >
        Some systems are down.
      </Badge>
    </Tooltip>
  ) : (
    <Tooltip label="All systems are working as expected.">
      <Badge
        className="cursor-pointer normal-case"
        component="a"
        variant="dot"
        color="green"
        size="md"
        px={15}
        py={12}
        radius="md"
        target="__blank"
        href={process.env.NEXT_PUBLIC_STATUS_PAGE}
      >
        All systems working.
      </Badge>
    </Tooltip>
  );
}
