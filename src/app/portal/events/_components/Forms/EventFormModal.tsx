import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DateTimePicker, type DateValue } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconUpload, IconX } from '@tabler/icons-react';

import { IconArrowRight } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
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

import { submitEvent } from '../../actions';
import { SeriesInput } from './SeriesInput';
import type { EventResponse } from '@/libs/supabase/api/_response';
import { PageLoader } from '@/components/Loader/PageLoader';
import { Enums } from '@/libs/supabase/_database';
import classes from '@/styles/forms/ContainedInput.module.css';

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

export interface EventFormProps {
  id?: string;
  title: string;
  visibility: Enums<'event_visibility'>;
  image_url?: FileWithPath | string;
  series?: string | null;
  date_starting?: DateValue;
  date_ending?: DateValue;
  created_by?: string;
  handled_by?: string[];
}

/**
 * Modal form for creating or updating an event.
 *
 * @param event - The event data to edit/update (optional).
 * @param opened - The state of the modal.
 * @param close - The function to close the modal.
 */
export function EventFormModalComponent({
  event,
  opened,
  close,
}: {
  event?: EventFormProps;
  opened: boolean;
  close: () => void;
}) {
  const [pending, setPending] = useState(false);

  // get current url path for revalidation
  const pathname = usePathname();

  // image file preview state
  const [coverFile, setCoverFile] = useState<FileWithPath[]>([]);
  const imagePreview = coverFile.length
    ? URL.createObjectURL(coverFile[0])
    : null;

  // form submission
  const form = useForm<EventFormProps>({
    mode: 'uncontrolled',

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
        value && value < values.date_starting! // end date is disabled if start date is empty anyway
          ? 'Must be after the set start date.'
          : null,
    },

    onValuesChange: (values) => {
      // clear end date if start date is empty
      if (!values.date_starting) {
        form.setFieldValue('date_ending', null);
      }
    },
  });

  // form handler & submission
  const handleSubmit = async (eventForm: EventFormProps) => {
    setPending(true);
    let result: EventResponse;

    if (!event) {
      result = await submitEvent(eventForm);
    } else {
      result = await submitEvent(eventForm, event.id);
    }

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
    if (coverFile) {
      setCoverFile([]);
    }

    form.reset();
    close();
  };

  useEffect(() => {
    // We're setting this separately to avoid unnecessary
    // remounting of the modal when changing existing
    // values used with `initialValues`.
    // https://github.com/orgs/mantinedev/discussions/4868
    if (event) {
      form.setValues({
        title: event.title,
        visibility: event.visibility,
        date_starting: event.date_starting,
        date_ending: event.date_ending,
        handled_by: event.handled_by,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return (
    <Modal onClose={resetState} opened={opened} size="68%" title="New Event">
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
                style={{ pointerEvents: 'none' }}
              >
                {/* Selected image preview */}
                {coverFile.length || event?.image_url ? (
                  <Image
                    alt="Image preview of the uploaded image."
                    className="mx-auto block"
                    height={240}
                    key={imagePreview! ?? event?.title}
                    src={imagePreview! ?? event?.image_url}
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

            <Divider className="my-5" />

            <TextInput
              classNames={classes}
              data-autofocus
              label="Event Title"
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
              description="Who can see and participate in this event?"
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
            <Group grow>
              <DateTimePicker
                classNames={classes}
                clearable
                key={form.key('date_starting')}
                label="Starting Date & Time"
                placeholder="Starting date and time of event"
                {...form.getInputProps('date_starting')}
              />

              <DateTimePicker
                classNames={classes}
                clearable
                disabled={!form.getValues().date_starting}
                key={form.key('date_ending')}
                label="Ending Date & Time"
                placeholder="Last day and time of event."
                {...form.getInputProps('date_ending')}
              />
            </Group>

            <Divider className="my-1" />

            {/* Faculty Assignment */}
            <Checkbox.Group
              defaultValue={event?.handled_by}
              description="Faculty members assigned to this event. (can be set later)"
              key={form.key('faculty')}
              label="Assign Faculty"
              mt="sm"
              {...form.getInputProps('handled_by', { type: 'checkbox' })}
            >
              {/*  Faculty Table Checkbox */}
              <FacultyList
                defaultSelection={event?.handled_by}
                endDate={form.getValues().date_ending}
                startDate={form.getValues().date_starting}
              />
            </Checkbox.Group>
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
            w={148}
          >
            {event ? 'Save Edits' : 'Create Event'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export const EventFormModal = memo(EventFormModalComponent);
