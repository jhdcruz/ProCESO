import { Tables } from '@/libs/supabase/_database';
import { Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export function SeriesEdit({
  series,
  opened,
  open,
  close,
}: {
  series: Tables<'series'>;
  opened: boolean;
  open: () => void;
  close: () => void;
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      color: '',
    },
  });

  return (
    <Modal onClose={close} opened={opened} title="Edit Series">
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Stack>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="your@email.com"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <ColorInput
            format="hex"
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
          />
        </Stack>
      </form>
    </Modal>
  );
}
