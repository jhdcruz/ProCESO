import {
  Container,
  Img,
  Font,
  Tailwind,
  Hr,
  Link,
  Section,
  Text,
  Html,
} from '@react-email/components';
import type { Tables } from '@/libs/supabase/_database';
import { formatDateRange } from 'little-date';
import dayjs from '../libs/dayjs';
import '@mantine/core/styles.css';
import config from '../../tailwind.config';

export default function EventReminder({ event }: { event: Tables<'events'> }) {
  return (
    <Html lang="en">
      <Tailwind config={config}>
        <Font
          fallbackFontFamily="Arial"
          fontFamily="Inter"
          fontStyle="normal"
          fontWeight="400"
          webFont={{
            url: ' https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2',
            format: 'woff2',
          }}
        />
        <Container className="mx-auto block w-full p-5">
          <Img
            alt="Community Extension Services Office of T.I.P Manila"
            className="bock mx-auto rounded-md object-contain"
            height={100}
            src="https://kcgvoeyhpkxzvanujxlt.supabase.co/storage/v1/object/public/public_assets/ceso-manila.jpg"
            width="auto"
          />

          <Hr className="my-6 border-t-2 border-gray-300" />

          <Section className="mt-6">
            <Text className="mt-8">
              This email is to remind you that the:
              <br />
              <Link
                className="font-bold text-yellow-500 underline"
                href={`https://deuz.tech/events/${event?.id!}`}
              >
                {event?.title ?? 'Untitled Event'}
              </Link>
              .
              <br />
              is coming up in {dayjs(event?.date_starting).toNow()}.
            </Text>

            {event?.date_ending ? (
              <Text>
                The event is to be conducted at{' '}
                <span className="font-bold">
                  {formatDateRange(
                    new Date(event?.date_starting!),
                    new Date(event.date_ending),
                    {
                      includeTime: true,
                    },
                  )}
                </span>
                .
              </Text>
            ) : (
              <Text>
                The event is to be conducted at{' '}
                <span className="font-bold">
                  {dayjs(event?.date_starting).format('MMMM DD, YYYY')}
                </span>
                .
              </Text>
            )}
          </Section>

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
