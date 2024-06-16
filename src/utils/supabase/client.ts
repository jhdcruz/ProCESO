import { createBrowserClient as supaBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in the browser (client).
 */
export const createBrowserClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return supaBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};
