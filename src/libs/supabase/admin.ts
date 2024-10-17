import { createServerClient as supaServerClient } from '@supabase/ssr';
import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import type { cookies as asyncCookies } from 'next/headers';

export const createServerClient = async (
  cookies: ReturnType<typeof asyncCookies> | RequestCookies,
) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY');
  }

  const cookieStore = await cookies;

  return supaServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
