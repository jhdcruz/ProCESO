import { Anchor, Container, Image, Text, Divider } from '@mantine/core';

export const EmailTemplate = ({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) => (
  <Container>
    <Image
      alt="Community Extension Services Office of T.I.P Manila"
      fit="contain"
      h={160}
      radius="md"
      src="https://kcgvoeyhpkxzvanujxlt.supabase.co/storage/v1/object/public/public_assets/ceso-manila.jpg"
      w="auto"
    />

    <Divider my={8} />

    <Text>
      You have been delegated for an event:{' '}
      <Anchor fw="bold" href={`https://deuz.tech/events/${eventId}`}>
        {eventName}
      </Anchor>
      .
    </Text>

    <Text>
      View assignment from <a href="https://deuz.tech/">ProCESO Portal</a>.
    </Text>

    <Text my={18}>
      Regards, <br />
      CESO Admin
    </Text>
  </Container>
);
