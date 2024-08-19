import { redirect } from 'next/navigation';
import type { UserAvatarProps } from '@/components/UserButton';
import { Enums, Tables } from '@/utils/supabase/types';
import { createServerClient } from '@/utils/supabase/server';
import { ApiResponse, UsersResponse } from '../types';
import { createBrowserClient } from '@/utils/supabase/client';

export interface CurrentUser extends UserAvatarProps {
  role?: Enums<'user_roles'>;
}

/**
 * Get currently logged-in user from session.
 */
export async function getCurrentUser(): Promise<null | CurrentUser> {
  const cookieStore = await import('next/headers').then((mod) => mod.cookies);
  const supabase = createServerClient(cookieStore());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // treat no email as not logged in
  if (!user?.email) {
    redirect('/login');
  }

  // get user role
  const { data: role } = await supabase
    .from('users')
    .select('role')
    .eq('email', user?.email)
    .limit(1)
    .single();

  if (user) {
    return {
      email: user?.email,
      name: user?.user_metadata.name ?? '',
      avatarUrl: user?.user_metadata.avatar_url ?? '',
      role: role?.role ?? 'student',
    };
  }

  return null;
}

/**
 * Get users with the role of 'Faculty'
 */
export async function getFacultyUsers(filter?: string): Promise<UsersResponse> {
  const supabase = createBrowserClient();

  const { data: users, error } = await supabase
    .from('users')
    .select()
    .eq('role', 'faculty')
    .or(`name.ilike.%${filter}%, email.ilike.%${filter}%`);

  if (error) {
    return {
      status: 2,
      title: 'Unable to get faculty users',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Faculty users fetched',
    message: 'List of faculty users have been successfully fetched.',
    data: users,
  };
}
