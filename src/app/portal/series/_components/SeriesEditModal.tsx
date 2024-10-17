import { memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { Modal, Stack, TextInput, ColorPicker, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight } from '@tabler/icons-react';
import { Tables } from '@/libs/supabase/_database';
import { revalidate } from '@/app/actions';
import { updateSeries } from '../actions';

function SeriesEdit({
  series,
  opened,
  close,
}: {
  series: Tables<'series'> | null;
  opened: boolean;
  close: () => void;
}) {
  const pathname = usePathname();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      color: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!series) return;
    const response = await updateSeries({
      seriesId: series.id,
      series: values,
    });

    notifications.show({
      title: response.title,
      message: response.message,
      color: response.status === 2 ? 'red' : 'green',
      withBorder: true,
      withCloseButton: true,
      autoClose: 2000,
    });

    await revalidate(pathname);
    response.status === 0 && close();
  };

  useEffect(() => {
    if (opened && series) {
      form.setValues({
        title: series.title,
        color: series.color ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, series]);

  return (
    <Modal onClose={close} opened={opened} size={300} title="Edit Series">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            key={form.key('title')}
            label="Title"
            placeholder="Brigada Eskwela"
            withAsterisk
            {...form.getInputProps('title')}
          />

          <ColorPicker
            format="hex"
            key={form.key('color')}
            mx="auto"
            my="md"
            swatches={[
              '#2e2e2e',
              '#868e96',
              '#fa5252',
              '#e64980',
              '#be4bdb',
              '#7950f2',
              '#4c6ef5',
              '#228be6',
              '#15aabf',
              '#12b886',
              '#40c057',
              '#82c91e',
              '#fab005',
              '#fd7e14',
            ]}
            title="Color"
            {...form.getInputProps('color')}
          />
        </Stack>

        {/* Save Buttons */}
        <Stack mt="lg">
          <Button
            fullWidth
            rightSection={<IconArrowRight size={16} />}
            type="submit"
            variant="filled"
          >
            Save Edits
          </Button>
          <Button onClick={close} variant="subtle">
            Cancel
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

export const SeriesEditModal = memo(SeriesEdit);
