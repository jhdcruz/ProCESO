'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import {
  Affix,
  TextInput,
  Textarea,
  Button,
  Fieldset,
  Transition,
  Input,
  rem,
  Select,
  NumberInput,
  Group,
  SegmentedControl,
} from '@mantine/core';
import { useId, useWindowScroll } from '@mantine/hooks';
import { isInRange, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowUp, IconSend2 } from '@tabler/icons-react';
import { submitFeedback } from '@/app/eval/actions';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { Enums, Tables } from '@/libs/supabase/_database';
import { ThemeSwitcher } from '@/components/Buttons/ThemeSwitcher';
import { RatingField } from './RatingFields';

export interface BeneficiariesFeedbackProps {
  id?: string;
  type?: Enums<'feedback_type'>;
  respondent: {
    name: string;
    email: string;
    age: number;
    background: string;
    occupation?: string;
  };
  objectives?: {
    statement: string;
    rating: string;
    remarks: string;
  }[];
  importance: string;
  feedback?: {
    statement: string;
    rating: string;
    remarks: string;
  }[];
  sentiments?: {
    value: string;
    learning: string;
  };
  reflections?: {
    social: string;
    productivity: string;
    interpersonal: string;
  };
}

const BeneficiariesForm = ({
  activity,
  feedback,
}: {
  activity: Readonly<ActivityDetailsProps>;
  feedback?: Readonly<Tables<'activity_feedback'>>;
}) => {
  const uuid = useId();
  const [loading, setLoading] = useState(false);
  const [scroll, scrollTo] = useWindowScroll();

  const form = useForm<BeneficiariesFeedbackProps>({
    mode: 'uncontrolled',
    validateInputOnChange: true,

    initialValues: {
      id: activity.id!,
      type: 'beneficiaries',
      respondent: {
        name: '',
        email: '',
        age: 0,
        background: '',
        occupation: '',
      },
      objectives: activity.objectives?.map((obj) => ({
        statement: obj,
        rating: '3',
        remarks: '',
      })),
      importance: '3',
      feedback: [
        { statement: 'Time Allotment', rating: '3', remarks: '' },
        { statement: 'Coordination', rating: '3', remarks: '' },
        { statement: 'Conduct', rating: '3', remarks: '' },
        {
          statement: 'Overall',
          rating: '3',
          remarks: '',
        },
      ],
      sentiments: {
        value: '',
        learning: '',
      },
      reflections: {
        social: '',
        productivity: '',
        interpersonal: '',
      },
    },

    validate: {
      respondent: {
        age: isInRange({ min: 0, max: 100 }, 'Age must be within 0 - 100.'),
      },
    },
  });

  const handleSubmit = async () => {
    setLoading(true);
    const result = await submitFeedback(form);
    setLoading(false);

    if (result?.status === 0) {
      notifications.show({
        title: 'Feedback submitted successfully',
        message: 'Redirecting...',
        withBorder: true,
        loading: true,
      });

      redirect('/eval/done');
    } else {
      notifications.show({
        title: 'Unable to submit feedback',
        message: result?.message,
        color: 'red',
        withBorder: true,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  };

  useEffect(() => {
    if (feedback) {
      const response =
        feedback.response as unknown as BeneficiariesFeedbackProps;

      form.setValues({
        id: feedback.activity_id,
        type: feedback.type,
        ...response,
      });
      form.resetDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  return (
    <>
      <Affix position={{ bottom: 20, right: 60 }}>
        <Transition mounted={scroll.y > 0} transition="slide-up">
          {(transitionStyles) => (
            <Button
              leftSection={<IconArrowUp size={18} />}
              onClick={() => scrollTo({ y: 0 })}
              style={transitionStyles}
              variant="default"
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>

      <Affix position={{ bottom: 21, right: 20 }}>
        <ThemeSwitcher />
      </Affix>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          key={form.key('idempotencyKey')}
          type="hidden"
          value={uuid}
          {...form.getInputProps('idempotencyKey')}
        />

        <TextInput
          key={form.key('id')}
          type="hidden"
          {...form.getInputProps('id')}
        />
        <TextInput
          key={form.key('type')}
          type="hidden"
          {...form.getInputProps('type')}
        />

        <Fieldset legend="Beneficiary Information (Optional)" my="md">
          <TextInput
            description="First Name, Middle Initial, Last Name, Suffix (if any)"
            key={form.key('respondent.name')}
            label="Name"
            placeholder="Enter your name"
            {...form.getInputProps('respondent.name')}
          />

          <TextInput
            key={form.key('respondent.email')}
            label="Email Address"
            my="sm"
            placeholder="Enter your email address"
            type="email"
            {...form.getInputProps('respondent.email')}
          />

          <Group grow preventGrowOverflow={false}>
            <NumberInput
              allowDecimal={false}
              allowNegative={false}
              clampBehavior="strict"
              key={form.key('respondent.age')}
              label="Age"
              max={100}
              min={0}
              my="sm"
              {...form.getInputProps('respondent.age')}
            />
            <Select
              data={['Elementary', 'High School', 'College', 'Post Graduate']}
              key={form.key('respondent.background')}
              label="Education Background"
              my="sm"
              placeholder="Select your educational background"
              {...form.getInputProps('respondent.background')}
            />
          </Group>

          <TextInput
            key={form.key('respondent.occupation')}
            label="Occupation"
            my="sm"
            placeholder="Enter your occupation"
            {...form.getInputProps('respondent.occupation')}
          />
        </Fieldset>

        <Fieldset legend="Feedback" my="md">
          <RatingField
            field="feedback"
            fieldData={form.values.feedback!.map((fb) => fb.statement)}
            form={form}
            label="Rate the extent to which you agree with the following statements on a scale of 1 to 6"
          />
        </Fieldset>

        <Fieldset legend="Significance" my="md">
          <Input.Wrapper
            description={
              '1 - Extremely Insignificant, 2 - Insignificant, 3 - Moderately Insignificant, 4 - Moderately Significant, 5 - Significant, 6 - Extremely Significant'
            }
            label="On a personal level, how important was the topic to you?"
            withAsterisk
          >
            <SegmentedControl
              data={['1', '2', '3', '4', '5', '6']}
              fullWidth
              key={form.key('importance')}
              mt="md"
              {...form.getInputProps('importance')}
            />
          </Input.Wrapper>
        </Fieldset>

        <Fieldset legend="Objectives and Goals" my="md">
          <RatingField
            field="objectives"
            fieldData={activity.objectives!}
            form={form}
            label="Rate the extent to which each objective was achieved on a scale of 1 to 6"
          />
        </Fieldset>

        <Fieldset legend="Sentiments" my="md">
          <Textarea
            autosize
            key={form.key('sentiments.value')}
            label="What value did you get from this activity?"
            maxRows={6}
            minRows={3}
            my="sm"
            placeholder="..."
            required
            {...form.getInputProps('sentiments.value')}
          />

          <Textarea
            autosize
            key={form.key('sentiments.improve')}
            label="What is the best idea you learned in this activity that you plan to apply?"
            maxRows={6}
            minRows={3}
            my="sm"
            placeholder="..."
            required
            {...form.getInputProps('sentiments.improve')}
          />
        </Fieldset>
        <Fieldset legend="Reflection" my="md">
          <Input.Wrapper
            description="Discuss briefly how the project/activity contributed in your transformation in the following specific attributes:"
            label="How did the activity resonates with you?"
          >
            <Textarea
              autosize
              description="How did the activity influenced your social and ethical responsibility?"
              key={form.key('reflections.social')}
              label="Social and Ethical Responsibility"
              maxRows={6}
              minRows={3}
              my="sm"
              placeholder="..."
              required
              {...form.getInputProps('reflections.social')}
            />
            <Textarea
              autosize
              description="How did the activity influenced your productivity?"
              key={form.key('reflections.productivity')}
              label="Productivity"
              maxRows={6}
              minRows={3}
              my="sm"
              placeholder="..."
              required
              {...form.getInputProps('reflections.productivity')}
            />

            <Textarea
              autosize
              description="How did the activity affects your interpersonal and communication skills?"
              key={form.key('reflections.interpersonal')}
              label="Interpersonal and Communication Skills"
              maxRows={6}
              minRows={3}
              my="sm"
              placeholder="..."
              required
              {...form.getInputProps('reflections.interpersonal')}
            />
          </Input.Wrapper>
        </Fieldset>

        <Button
          display="block"
          loaderProps={{ type: 'dots' }}
          loading={loading}
          ml={{ base: 0, sm: 'auto' }}
          rightSection={<IconSend2 size={20} />}
          type="submit"
          w={{ base: '100%', sm: rem(140) }}
        >
          Submit
        </Button>
      </form>
    </>
  );
};

export default BeneficiariesForm;
