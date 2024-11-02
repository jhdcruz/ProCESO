'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Input,
  Modal,
  SegmentedControl,
  Text,
  TextInput,
} from '@mantine/core';
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from '@mantine/dropzone';
import { DateTimePicker, type DateValue } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconInfoCircle,
  IconUpload,
  IconArrowRight,
  IconX,
} from '@tabler/icons-react';
import { formatDateRange } from 'little-date';
import type { Tables, Enums } from '@/libs/supabase/_database';
import { getActivitiesInRange } from '@/libs/supabase/api/activity';
import { submitActivity } from '@portal/activities/actions';
import { SeriesInput } from './SeriesInput';
import classes from '@/styles/forms/ContainedInput.module.css';

export interface ActivityFormProps {
  id?: string;
  title: string;
  visibility: Enums<'activity_visibility'>;
  image_url?: FileWithPath | string;
  series?: string | null;
  date_starting: DateValue;
  date_ending: DateValue;
  created_by?: string;
  handled_by?: string[];
}

/**
 * Modal form for creating or updating an activity.
 *
 * @param activity - The activity data to edit/update (optional).
 * @param opened - The state of the modal.
 * @param close - The function to close the modal.
 */
export function ActivityFormModalComponent({
  activity,
  opened,
  close,
}: {
  activity?: ActivityFormProps;
  opened: boolean;
  close: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [conflicts, setConflicts] = useState<
    Tables<'activities_details_view'>[]
  >([]);
  const [original, setOriginal] = useState<ActivityFormProps>();

  // image file preview state
  const [coverFile, setCoverFile] = useState<FileWithPath[]>([]);
  const imagePreview: string | null = coverFile.length
    ? URL.createObjectURL(coverFile[0])
    : null;

  // form submission
  const form = useForm<ActivityFormProps>({
    mode: 'uncontrolled',
    validateInputOnChange: true,

    initialValues: {
      title: '',
      visibility: 'Everyone',
      date_starting: null,
      date_ending: null,
      handled_by: [],
    },

    validate: {
      title: (value) => (!value.trim() ? 'Title cannot be empty.' : null),

      visibility: (value) =>
        !['Everyone', 'Faculty', 'Internal'].includes(value)
          ? 'Invalid visibility option.'
          : null,

      date_ending: (value, values) =>
        value && value < (values.date_starting as Date) // end date is disabled if start date is empty anyway
          ? 'Must be after the set start date.'
          : null,
    },

    onValuesChange: async (values) => {
      // clear end date if start date is empty
      if (!values.date_starting) {
        form.setFieldValue('date_ending', null);
      }

      // query for conflicting activities on the set date range
      if (values.date_starting && values.date_ending) {
        const conflicts = await getActivitiesInRange({
          start: values.date_starting.toISOString(),
          end: values.date_ending.toISOString(),
          exclude: activity?.id,
        });

        // collect conflicting activities for display in the modal
        setConflicts(conflicts?.data ?? []);
      }
    },
  });

  // form handler & submission
  const handleSubmit = async (activityForm: ActivityFormProps) => {
    setPending(true);
    const result = await submitActivity(activityForm, original, activity?.id);
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

    resetState();
  };

  // reset all state on cancel
  const resetState = () => {
    if (!activity && coverFile.length) {
      setCoverFile([]);
    }

    form.reset();
    close();
  };

  useEffect(() => {
    if (activity) {
      // keep record of the original activity data
      setOriginal(activity);

      // We're setting this separately to avoid unnecessary
      // remounting of the modal when changing existing
      // values used with `initialValues`.
      // https://github.com/orgs/mantinedev/discussions/4868
      // https://mantine.dev/form/values/#setinitialvalues-handler
      form.setInitialValues(activity);
      form.setValues(activity);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  return (
    <Modal
      key={activity?.id}
      onClose={resetState}
      opened={opened}
      size="60rem"
      title="New Activity"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid grow>
          {/* Left Column Grid */}
          <Grid.Col span={4}>
            <Dropzone
              accept={IMAGE_MIME_TYPE}
              maxSize={15 * 1024 ** 2} // 15MB
              multiple={false}
              onDrop={(files) => {
                setCoverFile(files);
                form.setFieldValue('image_url', files[0]);
              }}
            >
              <Group
                justify="center"
                mih={280}
                style={{ pointerActivities: 'none' }}
              >
                {/* Selected image preview */}
                {coverFile.length || activity?.image_url ? (
                  <Image
                    alt="Image preview of the uploaded image."
                    className="mx-auto block object-contain"
                    height={240}
                    key={imagePreview ?? activity?.title}
                    src={imagePreview ?? (activity?.image_url as string)}
                    width={240}
                  />
                ) : (
                  <Dropzone.Idle>
                    <IconUpload
                      className="mx-auto mb-4 block h-[4rem] w-[4rem]"
                      stroke={1.5}
                    />
                    <Text c="dimmed" ta="center">
                      Select/drop a cover thumbnail image here.
                    </Text>
                  </Dropzone.Idle>
                )}

                <Dropzone.Accept>
                  <IconCheck
                    className="mx-auto mb-4 block h-[4rem] w-[4rem] text-[var(--mantine-color-green-6)]"
                    stroke={1.5}
                  />
                  <Text c="dimmed" ta="center">
                    Release to use the selected image.
                  </Text>
                </Dropzone.Accept>

                <Dropzone.Reject>
                  <IconX
                    className="mx-auto mb-4 block h-[4rem] w-[4rem] text-[var(--mantine-color-red-6)]"
                    stroke={1.5}
                  />
                  <Text ta="center">Selected image file is invalid.</Text>
                </Dropzone.Reject>
              </Group>
            </Dropzone>

            <Divider my="xs" />

            <TextInput
              classNames={classes}
              data-autofocus
              label="Activity Title"
              placeholder="Ex. Brigada Eskwela (2024)"
              withAsterisk
              {...form.getInputProps('title')}
            />

            <SeriesInput
              key={form.key('series')}
              {...form.getInputProps('series')}
              classNames={classes}
            />

            <Input.Wrapper
              description="Who can see and participate in this activity?"
              label="Visibility"
              withAsterisk
            >
              <SegmentedControl
                className="mt-2"
                data={['Everyone', 'Faculty', 'Internal']}
                key={form.key('visibility')}
                {...form.getInputProps('visibility')}
              />
            </Input.Wrapper>
          </Grid.Col>

          {/* Right Column Grid */}
          <Grid.Col span={8}>
            <Group align="flex-start" grow>
              <DateTimePicker
                classNames={classes}
                clearable
                key={form.key('date_starting')}
                label="Starting Date & Time"
                placeholder="Starting date and time of activity"
                {...form.getInputProps('date_starting')}
              />

              <DateTimePicker
                classNames={classes}
                clearable
                disabled={!form.getValues().date_starting}
                key={form.key('date_ending')}
                label="Ending Date & Time"
                placeholder="Last day and time of activity."
                {...form.getInputProps('date_ending')}
              />
            </Group>

            {/* activities conflict notice */}
            {conflicts.length > 0 && (
              <Alert
                color="brand"
                icon={<IconInfoCircle />}
                mt="xs"
                title="Overlapping activities schedules"
                variant="light"
              >
                {conflicts.length} activities are scheduled within the date
                range.
                {conflicts.length > 0 && (
                  <ul>
                    {conflicts.map((activity) => (
                      <li key={activity.id}>
                        {activity.title} -{' '}
                        <Badge variant="default">
                          {formatDateRange(
                            new Date(activity.date_starting as string),
                            new Date(activity.date_ending as string),
                          )}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}

            <Divider my="xs" />

            {/* TODO: Objectives and Outcomes */}
          </Grid.Col>
        </Grid>

        {/* Save Buttons */}
        <Group justify="flex-end">
          <Button mt="md" onClick={resetState} variant="subtle">
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
            {activity ? 'Save Edits' : 'Create Activity'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export const ActivityFormModal = memo(ActivityFormModalComponent);
