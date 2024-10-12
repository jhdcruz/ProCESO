import { createBrowserClient } from '@/libs/supabase/client';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Sign out the current user.
 *
 * @param router - Next.js useRouter() object for redirect.
 */
export const signOut = async (router: AppRouterInstance) => {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signOut();

  if (!error) {
    router.replace('/');
  }
};
