'use client';

import { memo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Space } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { updateActivityDescription } from '@/libs/supabase/api/activity';
import { PageLoader } from '@/components/Loader/PageLoader';
import { Enums } from '@/libs/supabase/_database';
import { ActivityInfoHeader } from './ActivityInfoHeader';

const ActivityInfoBody = dynamic(
  () =>
    import('./ActivityInfoBody').then((mod) => ({
      default: mod.ActivityInfoBody,
    })),
  {
    loading: () => <PageLoader />,
  },
);

export const ActivityInfo = memo(
  ({
    activity,
    role,
  }: {
    activity: ActivityDetailsProps;
    role: Enums<'roles_user'>;
  }) => {
    const [editable, setEditable] = useState(false);
    const [content, setContent] = useState(activity?.description ?? null);
    const [loading, setLoading] = useState(false);

    const saveDescription = async (content: string) => {
      if (!activity?.id || !editable) return;
      setLoading(true);

      const result = await updateActivityDescription({
        activityId: activity.id,
        description: content,
      });

      if (result.status !== 0) {
        notifications.show({
          title: 'Cannot update activity description',
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
      <Container fluid key={activity?.id}>
        <ActivityInfoHeader
          activity={activity}
          editable={editable}
          role={role}
          toggleEdit={() => setEditable(!editable)}
        />

        <Space h={12} />
        <ActivityInfoBody
          activity={activity}
          content={content}
          editable={editable}
          loading={loading}
          onSave={saveDescription}
          role={role}
        />
      </Container>
    );
  },
);
ActivityInfo.displayName = 'ActivityInfo';
