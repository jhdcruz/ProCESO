'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { DateTimePicker, type DateValue } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';
import { z } from 'zod';
import classes from '@/styles/forms/ContainedInput.module.css';

import { IconArrowRight, IconCalendarPlus } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  Input,
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

export interface NewEvent {
  image_url?: FileWithPath;
  series?: string;
  title: string;
  visibility: 'Everyone' | 'Faculty' | 'Internal';
  features: string[];
  date_starting: DateValue;
  date_ending: DateValue;
}

export const NewEventModal = memo(() => {
  const [opened, { open, close }] = useDisclosure(false);

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
      features: ['Analytics', 'Feedback'],
      date_starting: null,
      date_ending: null,
    },

    validate: {
      title: (value) => (!value.trim() ? 'Title cannot be empty.' : null),

      visibility: (value) =>
        !['Everyone', 'Faculty', 'Internal'].includes(value)
          ? 'Invalid visibility option.'
          : null,

      date_starting: (value) =>
        z.string().datetime().safeParse(value).error
          ? 'Invalid date, use the date picker.'
          : null,

      date_ending: (value, values) =>
        z.string().datetime().safeParse(value).error
          ? 'Invalid date, use the date picker.'
          : value && value < values.date_starting! // end date is disabled if start date is empty anyways
            ? 'Must be after the set start date.'
            : null,
    },
  });

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
        onClick={open}
        className="drop-shadow-sm"
        leftSection={<IconCalendarPlus size={16} />}
      >
        Schedule new event
      </Button>

      <Modal opened={opened} onClose={close} size="70%" title="New Event">
        <form onSubmit={form.onSubmit(console.log)}>
          <Grid grow>
            {/* Left Column Grid */}
            <Grid.Col span={4}>
              <Dropzone
                multiple={false}
                accept={IMAGE_MIME_TYPE}
                onDrop={(files) => {
                  setCoverFile(files);
                  form.setFieldValue('image_url', files[0]);
                }}
                maxSize={15 * 1024 ** 2} // 15MB
              >
                <Group
                  justify="center"
                  mih={280}
                  style={{ pointerEvents: 'none' }}
                >
                  {/* Selected image preview */}
                  {coverFile.length ? (
                    <Image
                      className="mx-auto block"
                      key={imagePreview as string}
                      src={imagePreview as string}
                      width={240}
                      height={240}
                      alt="Image preview of the uploaded image."
                    />
                  ) : (
                    <Dropzone.Idle>
                      <IconUpload
                        className="mx-auto mb-4 block h-[4rem] w-[4rem]"
                        stroke={1.5}
                      />
                      <Text ta="center" c="dimmed">
                        Select/drop a cover thumbnail image here.
                      </Text>
                    </Dropzone.Idle>
                  )}

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
                label="Event Title"
                placeholder="Ex. Brigada Eskwela (2024)"
                classNames={classes}
                data-autofocus
                withAsterisk
                {...form.getInputProps('title')}
              />

              <SeriesInput
                key={form.key('series')}
                {...form.getInputProps('series')}
                classNames={classes}
              />

              <Input.Wrapper
                label="Visibility"
                description="Who can view and participate in this event?"
                withAsterisk
              >
                <SegmentedControl
                  key={form.key('visibility')}
                  className="mt-2"
                  data={['Everyone', 'Faculty', 'Internal']}
                  {...form.getInputProps('visibility')}
                />
              </Input.Wrapper>
            </Grid.Col>

            {/* Right Column Grid */}
            <Grid.Col span={8}>
              <Group grow>
                <DateTimePicker
                  key={form.key('date_starting')}
                  classNames={classes}
                  label="Starting Date & Time"
                  placeholder="Starting date and time of event"
                  clearable
                  {...form.getInputProps('date_starting')}
                />

                <DateTimePicker
                  key={form.key('date_ending')}
                  classNames={classes}
                  disabled={!form.getValues().date_starting}
                  label="Ending Date & Time"
                  placeholder="Last day and time of event."
                  clearable
                  {...form.getInputProps('date_ending')}
                />
              </Group>

              {/* Features List */}
              <Checkbox.Group
                key={form.key('features')}
                label="Features"
                description="Select which features should be enabled."
                defaultValue={['Analytics', 'Feedback']}
                {...form.getInputProps('features', { type: 'checkbox' })}
              >
                <SimpleGrid cols={{ base: 1, sm: 2 }} mt={8}>
                  {features.map((feature) => (
                    <FeatureCard key={feature.name} feature={feature} />
                  ))}
                </SimpleGrid>
              </Checkbox.Group>
            </Grid.Col>
          </Grid>

          {/* Save Buttons */}
          <Group justify="flex-end">
            <Button variant="subtle" mt="md" onClick={resetState}>
              Cancel
            </Button>

            <Button
              type="submit"
              mt="md"
              rightSection={<IconArrowRight size={16} />}
            >
              Add description
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
});

NewEventModal.displayName = 'NewEventModal';
