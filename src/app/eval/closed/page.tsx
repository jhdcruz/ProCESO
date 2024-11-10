import { Title, Text, Stack, Box, Divider } from '@mantine/core';
import { IconArticleOff } from '@tabler/icons-react';

export default async function ClosedPage() {
  return (
    <Box>
      <Divider my="lg" />

      <Stack justify="center" my="xl">
        <IconArticleOff className="mx-auto" color="#848484" size={48} />

        <Title order={2} ta="center">
          Evaluation form is now closed.
        </Title>

        <Text c="dimmed" ta="center">
          This activity is no longer accepting feedback responses.
        </Text>
      </Stack>
    </Box>
  );
}
