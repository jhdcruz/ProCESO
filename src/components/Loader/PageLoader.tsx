import { rem, Paper, Stack, Text } from '@mantine/core';
import { IconFidgetSpinner } from '@tabler/icons-react';

export const PageLoader = () => (
  <Paper className="h-100 w-100 flex items-center self-center align-middle">
    <Stack className="mx-auto text-center">
      <IconFidgetSpinner
        className="var(--mantine-color-dimmed) mx-auto block h-10 w-10 animate-spin"
        stroke={1.5}
      />

      <Text>Processing request, please wait...</Text>
    </Stack>
  </Paper>
);
