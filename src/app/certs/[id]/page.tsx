import type { Metadata } from 'next';
import { metadata as defaultMetadata } from '@/app/layout';
import { Box, Text, Title } from '@mantine/core';
import { cookies } from 'next/headers';
import { createServerClient } from '@/libs/supabase/server';

export const metadata: Metadata = {
  title: 'Certifications - ' + defaultMetadata.title,
};

export default async function PublicCertsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { id } = await params;

  // get certs details
  const certsQuery = await supabase
    .from('certs')
    .select()
    .eq('hash', id)
    .limit(1)
    .single();

  return (
    <Box>
      <Title order={3}>Valid Certificate</Title>
      <br />
      <Text fw="bold">{certsQuery.data?.recipient_name}</Text>
      <Text size="sm">{certsQuery.data?.recipient_email}</Text>
    </Box>
  );
}
