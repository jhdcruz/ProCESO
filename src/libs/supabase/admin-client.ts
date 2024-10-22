import { createBrowserClient as supaBrowserClient } from '@supabase/ssr';
import { Database } from './_database';

/**
 * Create a Supabase *ADMIN* client for use in the browser (client).
 *
 * DO NOT USE THIS CLIENT IN THE BROWSER.
 * only use for triggers
 */
export const createAdminClient = () => {
  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing env.SUPABASE_URL');
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing env.SUPABASE_SERVICE_KEY');
  }

  return supaBrowserClient<Database>(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  );
};
