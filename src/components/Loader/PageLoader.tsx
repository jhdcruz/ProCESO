import { rem, Paper, Stack, Text } from '@mantine/core';
import { IconFidgetSpinner } from '@tabler/icons-react';

export const PageLoader = () => (
  <Paper className="flex h-screen w-screen items-center self-center align-middle">
    <Stack className="mx-auto text-center">
      <IconFidgetSpinner
        style={{
          width: rem(52),
          height: rem(52),
          color: 'var(--mantine-color-dimmed)'
        }}
        stroke={1.5}
      />

      <Text>Processing request, please wait...</Text>
    </Stack>
  </Paper>
);
