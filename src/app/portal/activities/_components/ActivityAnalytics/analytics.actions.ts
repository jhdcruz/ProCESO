'use server';

import { tasks } from '@trigger.dev/sdk/v3';
import type { generateSummary } from '@/trigger/generate-summary';
import type { RatingsProps } from './StatRatings';

export async function triggerSummary(
  id: string,
  ratings: RatingsProps,
  {
    partners,
    implementers,
    beneficiaries,
  }: {
    partners: number;
    implementers: number;
    beneficiaries: number;
    total: number;
  },
) {
  const total = partners + implementers + beneficiaries;

  const generated = await tasks.triggerAndPoll<typeof generateSummary>(
    'generate-summary',
    {
      activityId: id,
      ratings,
      count: {
        partners,
        implementers,
        beneficiaries,
        total,
      },
    },
    {
      pollIntervalMs: 60000, // 1 minute
      metadata: { activity: id },
    },
  );

  return generated;
}
