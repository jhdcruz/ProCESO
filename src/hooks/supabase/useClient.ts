import type { cookies } from 'next/headers';
import { createServerClient } from '@/utils/supabase/server';
import { createBrowserClient } from '@/utils/supabase/client';

/**
 * Get Supabase client.
 *
 * Provide cookie header to use server-side Supabase client.
 *
 * @param cookie - Cookie header for server-side supabase client.
 * @returns Supabase client (client/server-side).
 */
export const useClient = (cookie?: typeof cookies) => {
  if (cookie) {
    const cookieStore = cookie();
    return createServerClient(cookieStore);
  }

  return createBrowserClient();
};
