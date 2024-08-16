'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { DateTimePicker, type DateValue } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconUpload, IconX } from '@tabler/icons-react';
import classes from '@/styles/forms/ContainedInput.module.css';
import { Enums } from '@/utils/supabase/types';

import { IconArrowRight, IconCalendarPlus } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  Input,
  Loader,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core';
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from '@mantine/dropzone';

import { SeriesInput } from './SeriesInput';
import { features, FeatureCard } from './FeatureCard';
import { submitEvent } from '../../actions';

export interface NewEvent {
  title: string;
  visibility: Enums<'event_visibility'>;
  features: Enums<'event_features'>[] | [];
  image_url?: FileWithPath;
  series?: string | null;
  date_starting?: DateValue;
  date_ending?: DateValue;
  created_by?: string;
}

export const NewEventModal = memo(() => {
  const [opened, { open, close }] = useDisclosure(false);
  const [pending, setPending] = useState(false);

  // image file preview state
  const [coverFile, setCoverFile] = useState<FileWithPath[]>([]);
  const imagePreview = coverFile.length
    ? URL.createObjectURL(coverFile[0])
    : null;

  // form submission
  const form = useForm<NewEvent>({
    mode: 'uncontrolled',
    validateInputOnBlur: true,

    initialValues: {
      title: '',
      visibility: 'Everyone',
      features: ['Analytics', 'Feedback', 'Storage', 'Certificates'], // requires manual `defaultValue` on checkbox
      date_starting: null,
      date_ending: null,
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
  });

  // form handler & submission
  const handleSubmit = async (event: NewEvent) => {
    setPending(true);
    const result = await submitEvent(event);
    setPending(false);

    notifications.show({
      title: result.title,
      message: result.message,
      color:
        result.status === 0 ? 'green' : result.status === 1 ? 'yellow' : 'red',
      withBorder: true,
      withCloseButton: true,
      autoClose: 8000,
    });

    resetState();
    close();
  };

  // reset all state on cancel
  const resetState = () => {
    if (coverFile) {
      setCoverFile([]);
    }

    form.reset();
    close();
  };

  return (
    <>
      <Button
        className="drop-shadow-sm"
        leftSection={<IconCalendarPlus size={16} />}
        onClick={open}
      >
        Schedule new event
      </Button>

      <Modal onClose={close} opened={opened} size="70%" title="New Event">
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
                  {coverFile.length ? (
                    <Image
                      alt="Image preview of the uploaded image."
                      className="mx-auto block"
                      height={240}
                      key={imagePreview as string}
                      src={imagePreview as string}
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
                description="Who can view and participate in this event?"
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

              {/* Features List */}
              <Checkbox.Group
                defaultValue={[
                  'Analytics',
                  'Feedback',
                  'Storage',
                  'Certificates',
                ]}
                description="Select which features should be enabled."
                key={form.key('features')}
                label="Features"
                {...form.getInputProps('features', { type: 'checkbox' })}
              >
                <SimpleGrid cols={{ base: 1, sm: 2 }} mt={8}>
                  {features.map((feature) => (
                    <FeatureCard feature={feature} key={feature.name} />
                  ))}
                </SimpleGrid>
              </Checkbox.Group>
            </Grid.Col>
          </Grid>

          {/* Save Buttons */}
          <Group justify="flex-end">
            <Button mt="md" onClick={resetState} variant="subtle">
              Cancel
            </Button>

            <Button
              disabled={pending || !form.isValid}
              mt="md"
              rightSection={!pending && <IconArrowRight size={16} />}
              type="submit"
              w={148}
            >
              {pending ? <Loader size="1rem" type="dots" /> : 'Create Event'}
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
});

NewEventModal.displayName = 'NewEventModal';
