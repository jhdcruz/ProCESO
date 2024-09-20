'use client';

import { memo, lazy, Suspense, useState } from 'react';
import { Container, Space } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { EventDetailsProps } from '@/libs/supabase/api/_response';
import { updateEventDescription } from '@/libs/supabase/api/event';
import { PageLoader } from '@/components/Loader/PageLoader';

const EventInfoHeader = lazy(() =>
  import('./EventInfoHeader').then((mod) => ({
    default: mod.EventInfoHeader,
  })),
);

const EventInfoBody = lazy(() =>
  import('./EventInfoBody').then((mod) => ({
    default: mod.EventInfoBody,
  })),
);

export const EventInfo = memo((event: EventDetailsProps) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(event?.description ?? null);
  const [loading, setLoading] = useState(false);

  const saveDescription = async (content: string) => {
    if (!event?.id || !editable) return;
    setLoading(true);

    const result = await updateEventDescription({
      eventId: event.id,
      description: content,
    });

    if (result.status !== 0) {
      notifications.show({
        title: 'Cannot update event description',
        message: result.message,
        icon: <IconAlertTriangle />,
        color: result.status === 1 ? 'yellow' : 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
    } else {
      // reflect changes locally
      setContent(content);
      setEditable(false);
    }

    setLoading(false);
  };

  return (
    <Container fluid key={event?.id}>
      <Suspense fallback={<PageLoader />}>
        <EventInfoHeader
          editable={editable}
          event={event}
          toggleEdit={() => setEditable(!editable)}
        />

        <Space h={12} />
        <EventInfoBody
          content={content}
          editable={editable}
          event={event}
          loading={loading}
          onSave={saveDescription}
        />
      </Suspense>
    </Container>
  );
});
EventInfo.displayName = 'EventInfo';
