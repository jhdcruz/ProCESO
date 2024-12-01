'use server';

import { tasks, runs } from '@trigger.dev/sdk/v3';
import type { generateCerts } from '@/trigger/generate-certificate';
import ApiResponse from '@/utils/response';

export async function triggerGenerateCerts(
  activity: string,
  exclude: string[],
  templateDataUrl: string,
  coordinator: string,
  vpsas: string,
  type: string[],
  qrPos: 'left' | 'right',
  send: boolean = true,
) {
  // queue the generate-certs trigger
  return await tasks.trigger<typeof generateCerts>(
    'generate-certs',
    {
      activity,
      exclude,
      template: templateDataUrl,
      coordinator,
      vpsas,
      type,
      qrPos,
      send,
    },
    {
      tags: [`title.${activity}`, ...type],
    },
  );
}

/**
 * List certificate generation and delivery runs
 */
export async function getCertRuns(): Promise<ApiResponse> {
  const response = await runs.list({
    limit: 10,
    taskIdentifier: ['generate-certs', 'email-certs'],
    isTest: false,
  });

  if (!response.data) {
    return {
      status: 2,
      title: 'Unable to fetch certificate runs',
      data: response,
    };
  }

  return {
    status: 0,
    title: 'Fetched certificate runs',
    data: response.data,
  };
}
