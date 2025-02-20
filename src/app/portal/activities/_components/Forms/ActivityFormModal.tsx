'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  Indicator,
  Input,
  Modal,
  NumberInput,
  SegmentedControl,
  Text,
  TextInput,
} from '@mantine/core';
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from '@mantine/dropzone';
import {
  DateTimePicker,
  type DatePickerProps,
  type DateValue,
} from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import dynamic from 'next/dynamic';
import {
  IconCheck,
  IconUpload,
  IconArrowRight,
  IconX,
  IconLaurelWreath1,
  IconLaurelWreath2,
  IconLaurelWreath3,
  IconAlertTriangle,
} from '@tabler/icons-react';
import type { Tables, Enums } from '@/libs/supabase/_database';
import { getActivitiesInRange } from '@/libs/supabase/api/activity';
import { submitActivity } from '@portal/activities/actions';
import { PageLoader } from '@/components/Loader/PageLoader';
import { SeriesInput } from './SeriesInput';
import { listDepts } from '@/utils/user-types';
import { getDeptColor } from '@/utils/colors';
import classes from '@/styles/forms/ContainedInput.module.css';
import dayjs from '@/libs/dayjs';

const MapboxGeocoder = dynamic(
  () => import('./MapboxGeocoder').then((mod) => mod.MapboxGeocoder),
  {
    loading: () => <PageLoader />,
    ssr: false,
  },
);

export interface ActivityFormProps {
  id?: string;
  title: string;
  visibility: Enums<'activity_visibility'>;
  venue?: [number, number] | null;
  venue_additional?: string | null;
  image_url?: FileWithPath | string;
  series?: string | null;
  date_starting: DateValue;
  date_ending: DateValue;
  created_by?: string;
  objectives?: string[];
  objective_1?: string;
  objective_2?: string;
  objective_3?: string;
  handled_by?: string[];
  target: number | null;
  notify?: Enums<'roles_dept'>[];
}

/**
 * Modal form for creating or updating an activity.
 *
 * @param activity - The activity data to edit/update (optional).
 * @param opened - The state of the modal.
 * @param close - The function to close the modal.
 */
export const ActivityFormModal = memo(
  ({
    activity,
    opened,
    close,
  }: {
    activity?: ActivityFormProps;
    opened: boolean;
    close: () => void;
  }) => {
    const [pending, setPending] = useState(false);
    const [conflicts, setConflicts] = useState<
      Tables<'activities_details_view'>[]
    >([]);
    // image file preview state
    const [coverFile, setCoverFile] = useState<FileWithPath[]>([]);
    const imagePreview: string | null = coverFile.length
      ? URL.createObjectURL(coverFile[0])
      : null;

    const [venue, setVenue] = useState<[number, number] | null>(
      activity?.venue ?? null,
    );

    // form submission
    const form = useForm<ActivityFormProps>({
      mode: 'uncontrolled',
      validateInputOnBlur: true,

      initialValues: {
        title: '',
        visibility: 'Everyone',
        date_starting: null,
        date_ending: null,
        objective_1: '',
        objective_2: '',
        objective_3: '',
        handled_by: [],
        target: null,
      },

      validate: {
        title: isNotEmpty('Title is required.'),

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
            start: values.date_starting.toUTCString(),
            end: values.date_ending.toUTCString(),
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
      const result = await submitActivity(activityForm, activity?.id);
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

    // update additional venue info if the venue is changed
    useEffect(() => {
      if (opened && venue?.length === 2) {
        const getVenueInfo = async () => {
          const [lng, lat] = venue;

          const response = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_PUBLIC}&country=ph&limit=1&types=street`,
          ).then((res) => res.json());

          form.setFieldValue(
            'venue_additional',
            response?.features[0]?.properties?.full_address ?? '',
          );
        };

        void getVenueInfo();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [venue]);

    useEffect(() => {
      if (activity) {
        const { series, date_starting, date_ending } = activity;

        const data = {
          ...activity,
          date_starting: new Date(date_starting!),
          date_ending: new Date(date_ending!),
          series: series ?? '',
          objective_1: activity.objectives?.[0] ?? '',
          objective_2: activity.objectives?.[1] ?? '',
          objective_3: activity.objectives?.[2] ?? '',
        };

        // We're setting this separately to avoid unnecessary
        // remounting of the modal when changing existing
        // values used with `initialValues`.
        // https://github.com/orgs/mantinedev/discussions/4868
        // https://mantine.dev/form/values/#setinitialvalues-handler
        form.setInitialValues(data);
        form.setValues(data);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity]);

    // set venue
    useEffect(() => {
      if (opened) form.setFieldValue('venue', venue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [venue]);

    return (
      <Modal
        key={activity?.id ?? 'new'}
        onClose={resetState}
        opened={opened}
        size="62rem"
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
                className="my-1"
                classNames={classes}
                key={form.key('series')}
                {...form.getInputProps('series')}
              />

              <NumberInput
                allowDecimal={false}
                allowNegative={false}
                className="my-2"
                classNames={classes}
                key={form.key('target')}
                label="Target Participants"
                placeholder="Ex. 50"
                {...form.getInputProps('target')}
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
                  renderDay={dayRenderer}
                  valueFormat="MMM DD YYYY hh:mm A"
                  {...form.getInputProps('date_starting')}
                />

                <DateTimePicker
                  classNames={classes}
                  clearable
                  disabled={!form.getValues().date_starting}
                  key={form.key('date_ending')}
                  label="Ending Date & Time"
                  placeholder="Last day and time of activity."
                  renderDay={dayRenderer}
                  valueFormat="MMM DD YYYY hh:mm A"
                  {...form.getInputProps('date_ending')}
                />
              </Group>

              {/* activities conflict notice */}
              {conflicts.length > 0 && (
                <Alert
                  color="brand"
                  icon={<IconAlertTriangle />}
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
                            {dayjs(activity.date_starting).format(
                              'MMMM D, YYYY h:mm A',
                            )}
                            {' - '}
                            {dayjs(activity.date_ending).format(
                              'MMMM D, YYYY h:mm A',
                            )}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </Alert>
              )}

              <Divider my="xs" />

              <Input.Wrapper
                description="Where will the activity take place?"
                label="Activity Venue"
              >
                <MapboxGeocoder coordinates={venue} setCoordinates={setVenue} />

                <TextInput
                  description="Additional information or address about the venue."
                  key={form.key('venue_additional')}
                  label="Additional Address"
                  my="xs"
                  placeholder="Ex. Anniversary Hall, 6th Floor. TIP Manila, Arlegui Campus."
                  {...form.getInputProps('venue_additional')}
                />
              </Input.Wrapper>

              <Divider my="xs" />

              {/* Objectives and Outcomes */}
              <Input.Wrapper
                description="The activity's goals and objectives for its participants and partners."
                label="Goals and Objectives"
              >
                <TextInput
                  key={form.key('objective_1')}
                  leftSection={<IconLaurelWreath1 />}
                  my="sm"
                  placeholder="To promote community service and volunteerism."
                  {...form.getInputProps('objective_1')}
                />
                <TextInput
                  key={form.key('objective_2')}
                  leftSection={<IconLaurelWreath2 />}
                  mb="sm"
                  placeholder="To foster a sense of community and camaraderie."
                  {...form.getInputProps('objective_2')}
                />
                <TextInput
                  key={form.key('objective_3')}
                  leftSection={<IconLaurelWreath3 />}
                  mb="sm"
                  placeholder="To provide a safe and fun learning environment."
                  {...form.getInputProps('objective_3')}
                />
              </Input.Wrapper>

              <Divider my="xs" />

              {/* Departments to notify */}
              <Checkbox.Group
                description="Send notice to the selected college dept. chairs, dean, and committee heads."
                key={form.key('notify')}
                label="Departments to Notify"
                {...form.getInputProps('notify', { type: 'checkbox' })}
              >
                {form.getValues().visibility !== 'Internal' ? (
                  <Group mt="xs">
                    {listDepts.map((dept) => (
                      <Checkbox
                        key={dept.value}
                        label={
                          <Group gap="xs" wrap="nowrap">
                            <Text size="sm" tt="capitalize">
                              {dept.label}
                            </Text>
                            <Badge
                              color={getDeptColor(dept.value)}
                              size="xs"
                              variant="light"
                            >
                              {dept.value}
                            </Badge>
                          </Group>
                        }
                        value={dept.value}
                      />
                    ))}
                  </Group>
                ) : (
                  <Text c="dimmed" fs="italic" mt="xl" size="xs" ta="center">
                    Activity must not be &quot;Internal&quot; to notify
                    departments.
                  </Text>
                )}
              </Checkbox.Group>
            </Grid.Col>
          </Grid>

          {/* Save Buttons */}
          <Group justify="flex-end" mt="xl">
            <Button onClick={resetState} variant="subtle">
              Cancel
            </Button>

            <Button
              loaderProps={{ type: 'dots' }}
              loading={pending || !form.isValid}
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
  },
);
ActivityFormModal.displayName = 'ActivityFormModal';

const dayRenderer: DatePickerProps['renderDay'] = (date: Date) => {
  const day = date.getDate();
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <Indicator disabled={!isToday} offset={-5} size={6}>
      <div>{day}</div>
    </Indicator>
  );
};
