import { Box, Stack, Text } from '@mantine/core';
import { IconFidgetSpinner } from '@tabler/icons-react';

export const PageLoader = ({ label = true }: { label?: boolean }) => (
  <Box className="flex size-full place-content-center content-center items-center self-center py-10 align-middle">
    <Stack className="mx-auto size-full text-center">
      <IconFidgetSpinner
        className="var(--mantine-color-dimmed) mx-auto block h-10 w-10 animate-spin"
        stroke={1.5}
      />

      {label && <Text>Processing request, please wait...</Text>}
    </Stack>
  </Box>
);
