'use client';

import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Checkbox, Group, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowRight } from '@tabler/icons-react';
import { PageLoader } from '@/components/Loader/PageLoader';
import { ActivityFormProps } from './ActivityFormModal';
import { assignFaculty } from '../../actions';

interface Props {
  handled_by: string[];
}

const FacultyList = dynamic(
  () =>
    import('./FacultyList').then((mod) => ({
      default: mod.FacultyList,
    })),
  {
    loading: () => <PageLoader />,
    ssr: false,
  },
);

/**
 * Modal form for creating or updating an activity.
 *
 * @param activity - The activity data to edit/update (optional).
 * @param opened - The state of the modal.
 * @param close - The function to close the modal.
 */
export function FacultyAssignment({
  activity,
  opened,
  close,
}: {
  activity: ActivityFormProps;
  opened: boolean;
  close: () => void;
}) {
  const [original, setOriginal] = useState<Props['handled_by']>();
  const [pending, setPending] = useState(false);

  // form submission
  const form = useForm<Props>({
    mode: 'uncontrolled',
    validateInputOnChange: true,

    initialValues: {
      handled_by: [],
    },
  });

  // form handler & submission
  const handleSubmit = async (values: Props) => {
    setPending(true);

    // only allow changes before the activity starts
    const now = new Date();
    if (now > activity.date_starting!) {
      notifications.show({
        title: 'Cannot assign faculty',
        message: 'The activity has already started or completed.',
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 6000,
      });

      setPending(false);

      return;
    }

    const result = await assignFaculty(
      activity.id!,
      values.handled_by,
      original,
    );
    setPending(false);

    // only show error notification, if any
    if (result?.status !== 0) {
      notifications.show({
        title: result?.title,
        message: result?.message,
        color: result?.status === 1 ? 'yellow' : 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
    } else {
      notifications.show({
        title: result?.title,
        message: result?.message,
        color: 'green',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    }

    form.resetDirty();
    close();
  };

  useEffect(() => {
    // keep record of the original activity data
    const data = { handled_by: activity.handled_by ?? [] };
    setOriginal(data.handled_by);

    form.setInitialValues(data);
    form.setValues(data);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  return (
    <Modal
      key={activity.id}
      onClose={close}
      opened={opened}
      size="xl"
      withCloseButton={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* Faculty Assignment */}
        <Checkbox.Group
          defaultValue={activity.handled_by}
          description="Faculty members assigned to this activity. (can be set later)"
          key={form.key('faculty')}
          label="Assign Faculty"
          {...form.getInputProps('handled_by', { type: 'checkbox' })}
        >
          {/*  Faculty Table Checkbox */}
          <FacultyList
            defaultSelection={activity.handled_by}
            endDate={activity.date_ending}
            startDate={activity.date_starting}
          />
        </Checkbox.Group>

        {/* Save Buttons */}
        <Group justify="flex-end">
          <Button mt="md" onClick={close} variant="subtle">
            Cancel
          </Button>

          <Button
            loaderProps={{ type: 'dots' }}
            loading={pending || !form.isValid}
            mt="md"
            rightSection={!pending && <IconArrowRight size={16} />}
            type="submit"
            variant={pending ? 'default' : 'filled'}
          >
            Assign
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export const FacultyAssignmentModal = memo(FacultyAssignment);
