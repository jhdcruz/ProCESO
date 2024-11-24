import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';
import { ZipWriter, BlobWriter, BlobReader } from '@zip.js/zip.js';
import { generateCert } from './certificate';
import { createBrowserClient } from '../supabase/client';
import { blobToDataURL } from 'blob-util';

export interface CertReturnProps {
  blob: Blob;
  records: {
    hash: string;
    recipient_name: string;
    recipient_email: string;
  }[];
}

export async function generateCertificate({
  respondents,
  activityId,
  activityTitle,
  activityEnd,
  template,
  coordinator,
  vpsas,
  qrPos = 'right',
}: {
  respondents: Readonly<{ name: string | null; email: string | null }[]>;
  activityId: string;
  activityTitle: string;
  activityEnd: string;
  template: string;
  coordinator: File;
  vpsas: File;
  qrPos?: 'left' | 'right';
}): Promise<CertReturnProps> {
  const supabase = createBrowserClient();

  const records: CertReturnProps['records'] = [];
  const zipWriter = new ZipWriter(new BlobWriter());

  // Object URLs for coordinator and VPSAs signatures
  const coordinatorUrl = await blobToDataURL(new Blob([coordinator]));
  const vpsasUrl = await blobToDataURL(new Blob([vpsas]));

  for (const respondent of respondents) {
    // Generate hash using activityId, respondent name and email
    const hash = bytesToHex(
      blake3(
        new TextEncoder().encode(
          activityId + respondent.name!.trim() + respondent.email!.trim(),
        ),
      ),
    );

    const certBlob = (await generateCert(
      respondent.name!.trim(),
      template,
      hash,
      activityTitle,
      activityEnd,
      coordinatorUrl,
      vpsasUrl,
      qrPos,
    )) as Blob;

    // save records for logging
    records.push({
      hash,
      recipient_name: respondent.name!,
      recipient_email: respondent.email!,
    });

    // Add to zip file
    await zipWriter?.add(
      `${respondent.name!.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      new BlobReader(certBlob),
    );
  }

  // Save records to database
  await supabase.from('certs').insert(
    records.map((record) => ({
      activity_id: activityId,
      ...record,
    })),
  );

  // Return zip blob if not storing in Supabase
  const blob = await zipWriter?.close();
  return { blob, records };
}
