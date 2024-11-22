import { Box } from '@mantine/core';
import { PageLoader } from '@/components/Loader/PageLoader';

export default function Loading() {
  return (
    <Box h="90dvh" w="100%">
      <PageLoader />
    </Box>
  );
}
