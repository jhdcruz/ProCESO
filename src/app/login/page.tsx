import { checkHealth, generateQuotes, onEmailLogin } from '@/app/login/actions';
import { GoogleButton } from '@/components/Authentication/GoogleButton';
import {
  Badge,
  Button,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import Image from 'next/image';

import JitbitScript from '@/components/Legacy/JitbitScript';
import cesoLogo from './ceso-manila.webp';

export default async function Login() {
  const quoteRequest = generateQuotes();
  const healthRequest = checkHealth();

  const [quote, health] = await Promise.all([quoteRequest, healthRequest]);

  return (
    <form
      className="min-h-screen bg-contain bg-right-bottom bg-[url('/assets/bg-2425.webp')]"
      action={onEmailLogin}
    >
      <Paper
        className="flex flex-col shadow-2xl justify-between items-center border-e-2 border-e-[--mantine-color-gray-3] dark:border-e-[--mantine-color-dark-7] min-h-screen sm:max-w-md pt-10 max-w-full"
        radius={0}
        p={30}
      >
        <main className="w-[90%] h-max">
          <Stack mt="md" my={10} align="stretch" justify="center" gap="sm">
            <Image
              className="rounded-[--mantine-radius-md] mx-auto mb-4 bg-contain"
              src={cesoLogo}
              height={104}
              width={260}
              placeholder="blur"
              alt=""
            />

            <Title
              className="text-[--mantine-color-black] dark:text-[--mantine-color-white]"
              order={2}
              ta="center"
            >
              ProCESO Web Portal
            </Title>

            <Text size="sm" ta="center" fs="italic">
              {quote}
            </Text>
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

        {/* System status badge notifier */}
        {health === 2 ? (
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
        )}
      </Paper>

      <JitbitScript />
    </form>
  );
}
