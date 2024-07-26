'use server';

import { cookies } from 'next/headers';

import type { UserAvatarProps } from '@/components/UserButton';
import { createServerClient } from '../server';

/**
 * Get currently logged-in user from session.
 */
export const getUserSession = async (): Promise<UserAvatarProps> => {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // auth checks are done in the middleware, so this shouldn't be null
  return {
    email: session?.user.email ?? '',
    name: session?.user.user_metadata.name ?? '',
    avatarUrl: session?.user.user_metadata.avatar_url ?? '',
  };
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
