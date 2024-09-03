import { Paper, Stack, Text } from '@mantine/core';
import { IconFidgetSpinner } from '@tabler/icons-react';

export const PageLoader = () => (
  <Paper className="flex size-full items-center self-center py-10 align-middle">
    <Stack className="mx-auto size-full text-center">
      <IconFidgetSpinner
        className="var(--mantine-color-dimmed) mx-auto block h-10 w-10 animate-spin"
        stroke={1.5}
      />

      <Text>Processing request, please wait...</Text>
    </Stack>
  </Paper>
);
