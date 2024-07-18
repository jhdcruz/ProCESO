import { cookies } from 'next/headers';

import type { UserAvatarProps } from '@/components/UserButton';
import { createServerClient } from '../server';

/**
 * Get currently logged-in user from session.
 */
export const getUserSession = async (): Promise<null | UserAvatarProps> => {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return {
      email: session.user.email ?? '',
      name: session.user.user_metadata.name ?? '',
      avatarUrl: session.user.user_metadata.avatar_url ?? '',
    };
  }

  return null;
};

/**
 * Get currently logged-in user's role from db.
 */
export const getUserRole = async () => {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // fetch role from db instead of session token
  // for security purposes
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('email', session?.user.email)
    .limit(1)
    .single();

  return data?.role ?? 'student';
};
