import { memo } from 'react';
import {
  Group,
  Input,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

/**
 * Generic rating fields (1-6 scaling).
 *
 * @param form - Form hook form useForm.
 * @param field - Field name to be used as property key (must be lowercase).
 * @param fieldData - Field to map over.
 * @param label - Input label
 */
export const RatingField = memo(
  ({
    form,
    field,
    fieldData,
    label,
    description,
    readOnly,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturnType<any>;
    field: string;
    fieldData: string[];
    label: string;
    description?: string;
    readOnly?: boolean;
  }) => (
    <Input.Wrapper
      description={
        description ??
        '1 - Disagree Strongly, 2 - Disagree, 3 - Slightly Disagree, 4 - Slightly Agree, 5 - Agree, 6 - Agree Strongly'
      }
      label={label}
      withAsterisk
    >
      {fieldData.map((obj: string, index: number) => (
        <Stack key={index} my="md">
          <Text component="p" fw={500} my={0}>
            {obj}.
          </Text>

          <Group grow preventGrowOverflow={false}>
            <SegmentedControl
              data={['1', '2', '3', '4', '5', '6']}
              readOnly={readOnly}
              key={form.key(`${field}.${index}.rating`)}
              {...form.getInputProps(`${field}.${index}.rating`)}
            />
            <Textarea
              key={form.key(`${field}.${index}.remarks`)}
              label="Remarks"
              maxRows={5}
              readOnly={readOnly}
              placeholder={`Anything that would help us achieve this ${field} more?`}
              resize="vertical"
              {...form.getInputProps(`${field}.${index}.remarks`)}
            />
          </Group>
        </Stack>
      ))}
    </Input.Wrapper>
  ),
);
RatingField.displayName = 'RatingField';
