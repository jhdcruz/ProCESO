import { Title, Text, Stack, Box, Divider } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

export default async function DonePage() {
  return (
    <Box>
      <Divider my="lg" />

      <Stack justify="center" my="xl">
        <IconSparkles className="mx-auto" color="#848484" size={48} />

        <Title order={2} ta="center">
          Evaluation successfully submitted.
        </Title>

        <Text c="dimmed" ta="center">
          We&apos;ll use your feedback to improve our services and future
          activities to better serve you.
        </Text>
      </Stack>
    </Box>
  );
}
