import { type CookieOptions, createServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';

/**
 *
 * This function creates a Supabase client for server-side use
 * using the `SERVICE KEY`, **which bypassess all RLS security**.
 *
 * **Use with extreme caution, and prevent exposure of the service key.**
 */
export const createAdminClient = (cookieStore: ReturnType<typeof cookies>) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
