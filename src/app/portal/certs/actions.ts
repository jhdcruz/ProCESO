'use server';

import { tasks } from '@trigger.dev/sdk/v3';
import type { generateCerts } from '@/trigger/generate-certificate';

export async function triggerGenerateCerts(
  activity: string,
  templateDataUrl: string,
  type: string[],
  qrPos: 'left' | 'right',
  send: boolean = true,
) {
  // queue the generate-certs trigger
  return await tasks.trigger<typeof generateCerts>(
    'generate-certs',
    {
      activity,
      template: templateDataUrl,
      type,
      qrPos,
      send,
    },
    {
      tags: type,
    },
  );
}
