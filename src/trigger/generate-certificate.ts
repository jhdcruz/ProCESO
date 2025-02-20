import { task, envvars, logger } from '@trigger.dev/sdk/v3';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';
import { createAdminClient } from '@/libs/supabase/admin-client';
import { generateCert } from '@/libs/pdflib/certificate';
import { emailCerts } from './email-certs';
import { type ManualRespondent } from '@/app/portal/certs/_components/ManualList';

/**
 * Send notification email to unassigned faculties that
 * they are no longer delegated for an activity.
 *
 * @param activity - activity name.
 * @param id - array of faculty IDs.
 * @param auth - auth cookies.
 */
export const generateCerts = task({
  id: 'generate-certs',
  machine: {
    preset: 'medium-1x',
  },
  run: async (payload: {
    activity: string;
    exclude: string[];
    template: string;
    coordinator: string;
    vpsas: string;
    type: string[];
    qrPos?: 'left' | 'right';
    send?: boolean;
    respondents?: ManualRespondent[];
  }) => {
    const { activity, exclude, type, template, qrPos, respondents } = payload;

    const supaUrl = envvars.retrieve('SUPABASE_URL');
    const supaKey = envvars.retrieve('SUPABASE_SERVICE_KEY');
    await Promise.allSettled([supaUrl, supaKey]);
    const supabase = createAdminClient();

    // get activity details
    const activityQuery = supabase
      .from('activities')
      .select()
      .eq('title', activity)
      .limit(1)
      .single();

    let evalRes;

    if (respondents && respondents.length > 0) {
      evalRes = {
        data: respondents,
        error: null,
      };
    } else {
      // get respondents
      let evalQuery = supabase
        .from('activity_eval_view')
        .select('name, email')
        .eq('title', activity)
        .in('type', type)
        .limit(9999)
        .not('email', 'is', null)
        .not('name', 'is', null);

      if (exclude.length > 0) {
        evalQuery = evalQuery.not('email', 'in', exclude);
      }

      evalRes = await evalQuery;
    }

    const [activityRes] = await Promise.all([activityQuery]);

    logger.info('activity result', { activityRes });
    logger.info('eval result', { evalRes });

    if (activityRes.error) {
      throw new Error(activityRes.error.message);
    } else if (activityRes.data.id.length === 0) {
      throw new Error('No activity found');
    }
    if (evalRes.error) {
      throw new Error(evalRes.error.message);
    } else if (evalRes.data.length === 0) {
      throw new Error('No participants found');
    }

    // generate certificate
    for (const entry of evalRes.data) {
      const hash = bytesToHex(
        blake3(
          new TextEncoder().encode(
            activityRes?.data.id + entry.name!.trim() + entry.email!.trim(),
          ),
        ),
      );

      const certBlob = (await generateCert(
        entry.name!.trim(),
        template,
        hash,
        activityRes?.data.title,
        activityRes?.data.date_ending as string,
        payload.coordinator,
        payload.vpsas,
        qrPos,
      )) as Blob;

      // save to supabase storage
      const { error } = await supabase.storage
        .from('certs')
        .upload(`${activityRes?.data.id}/${hash}.pdf`, certBlob, {
          upsert: true,
        });

      // get public url
      const {
        data: { publicUrl },
      } = supabase.storage
        .from('certs')
        .getPublicUrl(`${activityRes?.data.id}/${hash}.pdf`);

      if (error) {
        throw new Error(error.message);
      }

      // Save records to database
      await supabase.from('certs').insert({
        activity_id: activityRes?.data.id,
        hash,
        recipient_name: entry.name!,
        recipient_email: entry.email!,
        url: publicUrl,
      });
    }

    if (payload.send) {
      await emailCerts.trigger(
        {
          activityId: activityRes.data.id,
        },
        {
          tags: [`title.${activityRes.data.title}`, ...type],
        },
      );
    }
  },
});
