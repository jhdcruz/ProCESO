'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowRight, IconCalendarPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';
import { SeriesInput } from './SeriesInput';
import classes from '@/styles/forms/ContainedInput.module.css';

import {
  Button,
  Divider,
  Grid,
  Group,
  Input,
  Modal,
  SegmentedControl,
  Text,
  TextInput,
  Autocomplete,
  Loader,
} from '@mantine/core';
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from '@mantine/dropzone';

export const NewEventModal = memo(() => {
  const [opened, { open, close }] = useDisclosure(false);
  const [visibility, setVisibility] = useState('Everyone');

  // image file preview state
  const [coverFile, setCoverFile] = useState<FileWithPath[]>([]);
  const imagePreview = coverFile.length
    ? URL.createObjectURL(coverFile[0])
    : null;

  // form submission
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // reset state on modal close
  const resetState = () => {
    if (coverFile) {
      setCoverFile([]);
    }

    setVisibility('Everyone');

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

      <Modal opened={opened} onClose={resetState} size="70%" title="New Event">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Grid grow>
            <Grid.Col span={4}>
              <Dropzone
                multiple={false}
                accept={IMAGE_MIME_TYPE}
                onDrop={setCoverFile}
                maxSize={15 * 1024 ** 2} // 15MB
              >
                <Group
                  justify="center"
                  mih={280}
                  style={{ pointerEvents: 'none' }}
                >
                  {/* Selected image preview */}
                  {coverFile.length && (
                    <Image
                      className="mx-auto block"
                      key={imagePreview as string}
                      src={imagePreview as string}
                      width={240}
                      height={240}
                      alt="Image preview of the uploaded image."
                    />
                  )}

                  <Dropzone.Reject>
                    <IconX
                      className="mx-auto mb-4 block h-[4rem] w-[4rem] text-[var(--mantine-color-red-6)]"
                      stroke={1.5}
                    />
                    <Text ta="center">Selected image file is invalid.</Text>
                  </Dropzone.Reject>

                  <Dropzone.Idle>
                    <IconUpload
                      className="mx-auto mb-4 block h-[4rem] w-[4rem]"
                      stroke={1.5}
                    />
                    <Text ta="center" c="dimmed">
                      Select/drop a cover thumbnail image here.
                    </Text>
                  </Dropzone.Idle>
                </Group>
              </Dropzone>

              <Divider className="my-5" />

              <TextInput
                label="Event Title"
                placeholder="Ex. Brigada Eskwela (2024)"
                classNames={classes}
                data-autofocus
                required
              />

              <SeriesInput classNames={classes} />

              <Input.Wrapper
                label="Visibility"
                description={
                  visibility === 'Everyone'
                    ? 'Visible to everyone in the system.'
                    : visibility === 'Faculty'
                      ? 'Visible to faculty members only.'
                      : 'Visible to admin/staffs only.'
                }
              >
                <SegmentedControl
                  className="mt-2"
                  value={visibility}
                  onChange={setVisibility}
                  data={['Everyone', 'Faculty', 'Internal']}
                />
              </Input.Wrapper>
            </Grid.Col>

            <Grid.Col span={8}>
              <Group grow>
                <DateTimePicker
                  classNames={classes}
                  label="Starting Date & Time"
                  placeholder="Starting date and time of event"
                />

                <DateTimePicker
                  classNames={classes}
                  label="Ending Date & Time"
                  placeholder="Last day and time of event."
                />
              </Group>
            </Grid.Col>
          </Grid>

          {/* Save Buttons */}
          <Group justify="flex-end">
            <Button variant="subtle" mt="md" onClick={close}>
              Save
            </Button>

            <Button
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
