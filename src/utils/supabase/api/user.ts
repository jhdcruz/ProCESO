'use server';

import { cookies } from 'next/headers';

import type { UserAvatarProps } from '@/components/UserButton';
import { createServerClient } from '../server';

/**
 * Get currently logged-in user from session.
 */
export const getUser = async (): Promise<null | UserAvatarProps> => {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      email: user?.email ?? '',
      name: user?.user_metadata.name ?? '',
      avatarUrl: user?.user_metadata.avatar_url ?? '',
    };
  }

  return null;
};

/**
 * Get currently logged-in user's role from db.
 */
export const getUserRole = async (): Promise<string> => {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // get user role
  const { data: role } = await supabase
    .from('users')
    .select('role')
    .eq('email', user?.email)
    .limit(1)
    .single();

  return role?.role ?? 'student';
};
