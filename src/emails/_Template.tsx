import { ReactNode } from 'react';
import {
  Container,
  Img,
  Font,
  Tailwind,
  Hr,
  Section,
  Text,
  Html,
} from '@react-email/components';
import '@mantine/core/styles.css';
import config from '../../tailwind.config';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <Html lang="en">
      <Tailwind config={config}>
        <Font
          fallbackFontFamily="Arial"
          fontFamily="Inter"
          fontStyle="normal"
          webFont={{
            url: ' https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2',
            format: 'woff2',
          }}
        />
        <Container className="mx-auto block w-full p-5">
          <Img
            alt="Community Extension Services Office of T.I.P Manila"
            className="mx-auto block rounded-md object-contain"
            height={91.8}
            src="https://kcgvoeyhpkxzvanujxlt.supabase.co/storage/v1/object/public/public_assets/ceso-manila.jpg"
            width={230.4}
          />

          <Hr className="my-6 border-t-2 border-gray-300" />

          <Section className="mt-6">{children}</Section>

          <Hr className="my-8 border-t-2 border-gray-300" />

          <Text className="mt-20">
            Regards, <br />
            CESO Admin
          </Text>
        </Container>
      </Tailwind>
    </Html>
  );
}
