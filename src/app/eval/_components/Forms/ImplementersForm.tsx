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
  Group,
  Checkbox,
} from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowUp, IconSend2 } from '@tabler/icons-react';
import { submitFeedback } from '@/app/eval/actions';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { Enums, Tables } from '@/libs/supabase/_database';
import { ThemeSwitcher } from '@/components/Buttons/ThemeSwitcher';
import { RatingField } from './RatingFields';

export interface ImplementerFeedbackProps {
  id?: string;
  type?: Enums<'feedback_type'>;
  respondent: {
    name: string;
    email: string;
    designation?:
      | {
          position: 'student';
          program: string;
          year?: '1' | '2' | '3' | '4' | '5';
        }
      | {
          position: 'teaching' | 'non-teaching';
          officer: boolean;
          unit: string;
        };
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
  implementations?: {
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
    beneficial: string;
    improve: string;
    comments: string;
  };
  reflections?: {
    social: string;
    productivity: string;
    interpersonal: string;
  };
}

const ImplementersForm = ({
  activity,
  feedback,
}: {
  activity: Readonly<ActivityDetailsProps>;
  feedback?: Readonly<Tables<'activity_feedback'>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [scroll, scrollTo] = useWindowScroll();

  const [isStudent, setIsStudent] = useState(true);

  const form = useForm<ImplementerFeedbackProps>({
    mode: 'uncontrolled',
    validateInputOnChange: true,

    initialValues: {
      id: activity.id!,
      type: 'implementers',
      respondent: {
        name: '',
        email: '',
        designation: {
          position: 'student',
          program: '',
        },
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
      implementations: [
        { statement: 'Adequacy of Resources', rating: '1', remarks: '' },
        { statement: 'Logistical Efficiency', rating: '1', remarks: '' },
        {
          statement: 'Quality of Coordination',
          rating: '1',
          remarks: '',
        },
        {
          statement: 'Institutional Support',
          rating: '1',
          remarks: '',
        },
      ],
      feedback: [
        { statement: 'My overall satisfaction', rating: '1', remarks: '' },
        { statement: 'The relevance to my needs', rating: '1', remarks: '' },
        {
          statement: 'Effectiveness of my services',
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
        {
          statement: 'Likelihood of joining future CES programs',
          rating: '1',
          remarks: '',
        },
      ],
      sentiments: {
        beneficial: '',
        improve: '',
        comments: '',
      },
      reflections: {
        social: '',
        productivity: '',
        interpersonal: '',
      },
    },

    validate: {
      respondent: {
        name: isNotEmpty('Name is required'),
        email: isNotEmpty('Email is required'),
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

  // check for student designation to show/hide year and program
  form.watch('respondent.designation.position', ({ value }) => {
    setIsStudent(value === 'student');
  });

  useEffect(() => {
    if (feedback) {
      const response = feedback.response as unknown as ImplementerFeedbackProps;

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

        <Fieldset legend="Implementer's Information" my="md">
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

          <Group gap="sm" grow preventGrowOverflow={false}>
            <Select
              allowDeselect={false}
              data={[
                { label: 'Student', value: 'student' },
                { label: 'Teaching Staff', value: 'teaching' },
                { label: 'Non-Teaching Staff', value: 'non-teaching' },
              ]}
              key={form.key('respondent.designation.position')}
              label="Position"
              placeholder="Select your position"
              required
              {...form.getInputProps('respondent.designation.position')}
            />

            {isStudent ? (
              <>
                <Select
                  data={[
                    { label: '1st Year', value: '1' },
                    { label: '2nd Year', value: '2' },
                    { label: '3rd Year', value: '3' },
                    { label: '4th Year', value: '4' },
                    { label: '5th Year', value: '5' },
                  ]}
                  key={form.key('respondent.designation.year')}
                  label="Year Level"
                  placeholder="Select your year level"
                  required
                  {...form.getInputProps('respondent.designation.year')}
                />

                <Select
                  data={[
                    {
                      group: 'College of Computer Studies',
                      items: [
                        'Computer Science',
                        'Information Technology',
                        'Data Science and Analytics',
                        'EMC - Game Development',
                        'EMC - Digital Animation Tech.',
                      ],
                    },
                    {
                      group: 'College of Engineering & Architecture',
                      items: [
                        'Architecture',
                        'Civil Engineering',
                        'Computer Engineering',
                        'Chemical Engineering',
                        'Electrical Engineering',
                        'Electronics Engineering',
                        'Industrial Engineering',
                        'Mechanical Engineering',
                      ],
                    },
                    {
                      group: 'College of Business Education',
                      items: [
                        'Accountancy',
                        'Accountancy Information System',
                        'BA - Financial Management',
                        'BA - Human Resource Management',
                        'BA - Marketing Management',
                        'BA - Logistics and Supply Chain Management',
                      ],
                    },
                  ]}
                  key={form.key('respondent.designation.program')}
                  label="Program"
                  placeholder="Select your program"
                  required
                  searchable
                  {...form.getInputProps('respondent.designation.program')}
                />
              </>
            ) : (
              <>
                <TextInput
                  key={form.key('respondent.designation.unit')}
                  label="Unit"
                  placeholder="Enter your unit"
                  required
                  {...form.getInputProps('respondent.designation.unit')}
                />

                <Checkbox
                  key={form.key('respondent.designation.officer')}
                  label="Officer"
                  mt="md"
                  {...form.getInputProps('respondent.designation.officer', {
                    type: 'checkbox',
                  })}
                />
              </>
            )}
          </Group>
        </Fieldset>

        <Fieldset legend="Objectives and Goals" my="md">
          <RatingField
            field="objectives"
            fieldData={activity.objectives!}
            form={form}
            label="Rate the extent to which each objective was achieved on a scale of 1 to 6"
          />
        </Fieldset>

        <Fieldset legend="Program Implementation" my="md">
          <RatingField
            description="1 - Disagree Strongly, 2 - Disagree, 3 - Slightly Disagree, 4 - Slightly Agree, 5 - Agree, 6 - Agree Strongly"
            field="implementations"
            fieldData={form.values.implementations!.map((imp) => imp.statement)}
            form={form}
            label="Rate the extent to which aspect was achieved on a scale of 1 to 6"
          />
        </Fieldset>

        <Fieldset legend="Intended Outcomes" my="md">
          <RatingField
            field="outcomes"
            fieldData={activity.outcomes!}
            form={form}
            label="Rate the extent to which aspect was achieved on a scale of 1 to 6"
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

        <Fieldset legend="Sentiments" my="md">
          <Textarea
            autosize
            description="What did you find most beneficial about the program?"
            key={form.key('sentiments.beneficial')}
            label="Benefits"
            maxRows={6}
            minRows={3}
            my="sm"
            placeholder="..."
            required
            {...form.getInputProps('sentiments.beneficial')}
          />

          <Textarea
            autosize
            description="What aspects of the program could be improved?"
            key={form.key('sentiments.improve')}
            label="Improvements"
            maxRows={6}
            minRows={3}
            my="sm"
            placeholder="..."
            required
            {...form.getInputProps('sentiments.improve')}
          />

          <Textarea
            autosize
            description="Comments and Suggestions"
            key={form.key('sentiments.comments')}
            label="Any additional comments or suggestions"
            maxRows={6}
            minRows={3}
            my="sm"
            placeholder="..."
            {...form.getInputProps('sentiments.comments')}
          />
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

export default ImplementersForm;
