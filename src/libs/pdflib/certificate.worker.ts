import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';
import { ZipWriter, BlobWriter, BlobReader } from '@zip.js/zip.js';
import { generateCert } from './certificate';
import { createBrowserClient } from '../supabase/client';

export interface CertReturnProps {
  blob: Blob;
  records: {
    hash: string;
    recipient_name: string;
    recipient_email: string;
  }[];
}

export async function generateCertificate({
  data,
  activityId,
  template,
  qrPos = 'right',
}: {
  data: Readonly<{ name: string | null; email: string | null }[]>;
  activityId: string;
  template: string;
  qrPos?: 'left' | 'right';
}): Promise<CertReturnProps> {
  const supabase = createBrowserClient();

  const records: CertReturnProps['records'] = [];
  const zipWriter = new ZipWriter(new BlobWriter());

  for (const entry of data) {
    const hash = bytesToHex(
      blake3(
        new TextEncoder().encode(
          activityId + entry.name!.trim() + entry.email!.trim(),
        ),
      ),
    );

    const certBlob = (await generateCert(
      entry.name!.trim(),
      template,
      hash,
      qrPos,
    )) as Blob;

    records.push({
      hash,
      recipient_name: entry.name!,
      recipient_email: entry.email!,
    });

    // Add to zip file
    await zipWriter?.add(
      `${entry.name!.replace(/[^a-z0-9]/gi, '_')}.pdf`,
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
