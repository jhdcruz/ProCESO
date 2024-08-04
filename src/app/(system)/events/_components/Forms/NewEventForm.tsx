'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { Button, Grid, Group, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from '@mantine/dropzone';
import {
  IconArrowRight,
  IconCalendarPlus,
  IconClock,
} from '@tabler/icons-react';

/**
 * Image thumnail preview of the uploaded image.
 *
 * @param {FileWithPath} cover - The uploaded image file.
 */
const CoverPreview = memo(({ cover }: { cover: FileWithPath }) => {
  const imageUrl = URL.createObjectURL(cover);

  return (
    <Image
      src={imageUrl}
      onLoad={() => URL.revokeObjectURL(imageUrl)}
      alt="Image preview of the uploaded image."
    />
  );
});
CoverPreview.displayName = 'CoverPreview';

export const NewEventForm = () => {
  const [cover, setCover] = useState<FileWithPath[]>([]);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <Button
      className="drop-shadow-sm"
      leftSection={<IconCalendarPlus size={14} />}
      onClick={() =>
        modals.open({
          title: 'Create new event',
          children: (
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
              <Grid>
                <Grid.Col>
                  {cover.length ? (
                    <CoverPreview cover={cover[0]} />
                  ) : (
                    <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setCover}>
                      <Text ta="center">Drop images here</Text>
                    </Dropzone>
                  )}
                </Grid.Col>

                <Grid.Col></Grid.Col>
              </Grid>

              {/* Save Buttons */}
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  mt="md"
                  onClick={() => modals.closeAll()}
                >
                  Add later
                </Button>

                <Button
                  mt="md"
                  onClick={() => modals.closeAll()}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Add description
                </Button>
              </Group>
            </form>
          ),
        })
      }
    >
      Schedule new event
    </Button>
  );
};
