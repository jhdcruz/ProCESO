'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import {
  Affix,
  TextInput,
  Textarea,
  Button,
  Fieldset,
  Text,
  Transition,
  Group,
  Stack,
  SegmentedControl,
  Input,
  rem,
} from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconArrowUp, IconSend2 } from '@tabler/icons-react';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { ThemeSwitcher } from '@/components/Buttons/ThemeSwitcher';
import { notifications } from '@mantine/notifications';
import { submitFeedback } from '@/app/eval/actions';
import { Enums, Tables } from '@/libs/supabase/_database';

export interface PartnersFeedbackProps {
  id?: string;
  type?: Enums<'feedback_type'>;
  respondent: {
    name: string;
    email: string;
    affiliation: string;
  };
  objectives?: {
    statement: string;
    rating: string;
    remarks: string;
  }[];
  outcomes?: {
    statement: string;
    rating: string;
    remarks: string;
  }[];
  feedback?: {
    statement: string;
    rating: string;
    remarks: string;
  }[];
  sentiments?: {
    statement: string;
    rating: string;
    remarks: string;
  }[];
}

const PartnersForm = ({
  activity,
  feedback,
}: {
  activity: Readonly<ActivityDetailsProps>;
  feedback?: Readonly<Tables<'activity_feedback'>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [scroll, scrollTo] = useWindowScroll();

  const form = useForm<PartnersFeedbackProps>({
    mode: 'uncontrolled',
    validateInputOnChange: true,

    initialValues: {
      id: activity.id!,
      type: 'partners',
      respondent: {
        name: '',
        email: '',
        affiliation: '',
      },
      objectives: activity.objectives?.map((obj) => ({
        statement: obj,
        rating: '1',
        remarks: '',
      })),
      outcomes: activity.outcomes?.map((out) => ({
        statement: out,
        rating: '1',
        remarks: '',
      })),
      feedback: [
        { statement: 'The program has met my needs', rating: '1', remarks: '' },
        {
          statement: 'The program was well-organized',
          rating: '1',
          remarks: '',
        },
        {
          statement: 'The program was were helpful and supportive',
          rating: '1',
          remarks: '',
        },
        {
          statement: 'I gained valuable skills or knowledge',
          rating: '1',
          remarks: '',
        },
        {
          statement: 'The program had a positive impact on my life',
          rating: '1',
          remarks: '',
        },
      ],
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

      redirect('/feedback/done');
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
      const response = feedback.response as unknown as PartnersFeedbackProps;

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
          key={form.key('id')}
          type="hidden"
          {...form.getInputProps('id')}
        />
        <TextInput
          key={form.key('type')}
          type="hidden"
          {...form.getInputProps('type')}
        />

        <Fieldset legend="Partner's Information" my="md">
          <TextInput
            description="First Name, Middle Initial, Last Name, Suffix (if any)"
            key={form.key('respondent.name')}
            label="Name"
            placeholder="Enter your name"
            required
            {...form.getInputProps('respondent.name')}
          />

          <TextInput
            key={form.key('respondent.email')}
            label="Email Address"
            my="sm"
            placeholder="Enter your email address"
            required
            type="email"
            {...form.getInputProps('respondent.email')}
          />

          <TextInput
            key={form.key('respondent.affiliation')}
            label="Affiliation"
            placeholder="Organization, Company, etc."
            required
            {...form.getInputProps('respondent.affiliation')}
          />
        </Fieldset>

        <Fieldset legend="Objectives and Goals" my="md">
          <Input.Wrapper
            description="1 - Disagree Strongly, 2 - Disagree, 3 - Slightly Disagree, 4 - Slightly Agree, 5 - Agree, 6 - Agree Strongly"
            label="Rate the extent to which each objective was achieved on a scale of 1 to 6"
            withAsterisk
          >
            {activity.objectives?.map((obj, index) => (
              <Stack key={index} my="md">
                <Text component="p" fw={500} my={0}>
                  {obj}.
                </Text>

                <Group grow preventGrowOverflow={false}>
                  <SegmentedControl
                    data={['1', '2', '3', '4', '5', '6']}
                    key={form.key(`objectives.${index}.rating`)}
                    {...form.getInputProps(`objectives.${index}.rating`)}
                  />
                  <Textarea
                    key={form.key(`objectives.${index}.remarks`)}
                    label="Remarks"
                    maxRows={5}
                    placeholder="Anything that would help us achieve this objective more?"
                    resize="vertical"
                    {...form.getInputProps(`objectives.${index}.remarks`)}
                  />
                </Group>
              </Stack>
            ))}
          </Input.Wrapper>
        </Fieldset>

        <Fieldset legend="Outcomes" my="md">
          <Input.Wrapper
            description="1 - Disagree Strongly, 2 - Disagree, 3 - Slightly Disagree, 4 - Slightly Agree, 5 - Agree, 6 - Agree Strongly"
            label="Rate the extent to which each aspect was achieved on a scale of 1 to 6:"
            withAsterisk
          >
            {activity.outcomes?.map((outcome, index) => (
              <Stack key={index} my="md">
                <Text component="p" fw={500} my={0}>
                  {outcome}
                </Text>

                <Group grow preventGrowOverflow={false}>
                  <SegmentedControl
                    data={['1', '2', '3', '4', '5', '6']}
                    key={form.key(`outcomes.${index}.rating`)}
                    {...form.getInputProps(`outcomes.${index}.rating`)}
                  />
                  <Textarea
                    key={form.key(`outcomes.${index}.remarks`)}
                    label="Remarks"
                    maxRows={5}
                    placeholder="Anything that would help us achieve this outcome more?"
                    resize="vertical"
                    {...form.getInputProps(`outcomes.${index}.remarks`)}
                  />
                </Group>
              </Stack>
            ))}
          </Input.Wrapper>
        </Fieldset>

        <Fieldset legend="Feedback" my="md">
          <Input.Wrapper
            description="1 - Disagree Strongly, 2 - Disagree, 3 - Slightly Disagree, 4 - Slightly Agree, 5 - Agree, 6 - Agree Strongly"
            label="Rate the following statements on a scale of 1 to 6:"
            withAsterisk
          >
            {form.values.feedback?.map((fb, index) => (
              <Stack key={index} my="md">
                <Text component="p" fw={500} my={0}>
                  {fb.statement}.
                </Text>

                <Group grow preventGrowOverflow={false}>
                  <SegmentedControl
                    data={['1', '2', '3', '4', '5', '6']}
                    key={form.key(`feedback.${index}.rating`)}
                    {...form.getInputProps(`feedback.${index}.rating`)}
                  />
                  <Textarea
                    key={form.key(`feedback.${index}.remarks`)}
                    label="Remarks"
                    maxRows={5}
                    placeholder="Anything that would help us achieve this outcome more?"
                    resize="vertical"
                    {...form.getInputProps(`feedback.${index}.remarks`)}
                  />
                </Group>
              </Stack>
            ))}
          </Input.Wrapper>
        </Fieldset>

        <Fieldset legend="Sentiments" my="md">
          <Textarea
            autosize
            key={form.key('sentiments.beneficial')}
            label="What did you find most beneficial about the program?"
            maxRows={6}
            mb="md"
            minRows={3}
            placeholder="..."
            {...form.getInputProps('sentiments.beneficial')}
          />
          <Textarea
            autosize
            key={form.key('sentiments.improve')}
            label="What aspects of the program could be improved?"
            maxRows={6}
            minRows={3}
            placeholder="..."
            {...form.getInputProps('sentiments.improve')}
          />
          <Textarea
            autosize
            key={form.key('sentiments.comments')}
            label="Any additional comments or suggestions"
            maxRows={6}
            minRows={3}
            my="md"
            placeholder="..."
            {...form.getInputProps('sentiments.comments')}
          />
        </Fieldset>

        <Button
          loaderProps={{ type: 'dots' }}
          loading={loading}
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

export default PartnersForm;
