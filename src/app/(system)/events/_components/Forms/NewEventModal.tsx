'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { DateTimePicker, DateValue } from '@mantine/dates';
import { IconArrowRight, IconCalendarPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';
import classes from '@/styles/forms/ContainedInput.module.css';

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

export const NewEventModal = memo(() => {
  const [opened, { open, close }] = useDisclosure(false);

  // event starting/end dates state
  const [startDate, setStartDate] = useState<DateValue | null>(null);
  const [endDate, setEndDate] = useState<DateValue | null>(null);
  const [endDateError, setEndDateError] = useState<string | boolean>(false);

  // image file preview state
  const [coverFile, setCoverFile] = useState<FileWithPath[]>([]);
  const imagePreview = coverFile.length
    ? URL.createObjectURL(coverFile[0])
    : null;

  // form submission
  const form = useForm({
    mode: 'uncontrolled',

    initialValues: {
      visibility: 'Everyone',
      features: ['Analytics', 'Feedback'],
    },
  });

  // reset all state on cancel
  const resetState = () => {
    if (coverFile) {
      setCoverFile([]);
    }

    setEndDateError(false);
    setStartDate(null);
    setEndDate(null);

    form.reset();

    close();
  };

  // make sure end date is not before start date
  // we're doing validation here for immediate feedback
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDateError('Cannot set end date before start date.');
    }
  }, [startDate, endDate]);

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
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
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
                required
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
                  onChange={(e) => {
                    setStartDate(e);
                    form.setFieldValue('date_starting', e);
                  }}
                  value={startDate}
                  classNames={classes}
                  label="Starting Date & Time"
                  placeholder="Starting date and time of event"
                  clearable
                />

                <DateTimePicker
                  key={form.key('date_ending')}
                  onChange={(e) => {
                    setEndDate(e);
                    form.setFieldValue('date_ending', e);
                  }}
                  value={endDate}
                  classNames={classes}
                  error={endDateError}
                  label="Ending Date & Time"
                  placeholder="Last day and time of event."
                  clearable
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
              onClick={close}
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
