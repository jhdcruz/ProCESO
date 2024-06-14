import { createBrowserClient as supaBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in the browser (client).
 */
export const createBrowserClient = () =>
  supaBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
