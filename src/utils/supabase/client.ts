import { createBrowserClient as supaBrowserClient } from '@supabase/ssr';
import { Database } from './types';

/**
 * Create a Supabase client for use in the browser (client).
 */
export const createBrowserClient = (url?: string, anonKey?: string) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (url && anonKey) {
    return supaBrowserClient<Database>(url, anonKey);
  }

  return supaBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};
