'use client';

import { Checkbox, Text, CheckboxCardProps, Group } from '@mantine/core';
import classes from '@/styles/forms/CheckboxCard.module.css';

interface FeatureCardProps extends CheckboxCardProps {
  feature: Feature;
}

export interface Feature {
  name: string;
  description: string;
  enabled?: boolean;
}

export const features: Feature[] = [
  {
    name: 'Analytics',
    description: 'Track user interactions and generate reports.',
    enabled: true,
  },
  {
    name: 'Feedback',
    description: 'Collect user feedback with sentimental analysis.',
    enabled: true,
  },
  {
    name: 'Storage',
    description: 'Store files such as PDFs, images, and videos.',
  },
  {
    name: 'Certificates',
    description: "Track internal users' attendance and participation.",
  },
];

export const FeatureCard = ({ feature, ...props }: FeatureCardProps) => {
  return (
    <Checkbox.Card
      className={classes.root}
      radius="md"
      value={feature.name}
      {...props}
    >
      <Group wrap="nowrap" align="flex-start">
        <Checkbox.Indicator />
        <div>
          <Text className={classes.label}>{feature.name}</Text>
          <Text className={classes.description}>{feature.description}</Text>
        </div>
      </Group>
    </Checkbox.Card>
  );
};
