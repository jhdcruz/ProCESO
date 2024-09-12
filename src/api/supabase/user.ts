import { redirect } from 'next/navigation';
import { type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@/utils/supabase/client';
import { createServerClient } from '@/utils/supabase/server';
import type { UserResponse, UsersResponse } from '../types';

/**
 * Get currently logged-in user from session.
 */
export async function getCurrentUser(
  supabase?: SupabaseClient,
): Promise<UserResponse> {
  if (!supabase) {
    const cookieStore = await import('next/headers').then((mod) => mod.cookies);
    supabase = createServerClient(cookieStore());
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current, error } = await supabase
    .from('users')
    .select()
    .eq('id', user?.id)
    .limit(1)
    .single();

  if (error) {
    return {
      status: 2,
      title: 'Unable to get current user',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Current user fetched',
    message: 'Current user',
    data: current,
  };
}

/**
 * Get users with the role of 'Faculty'
 */
export async function getFacultyUsers(
  filter?: string,
  dept?: string[],
  pos?: string[],
): Promise<UsersResponse> {
  const supabase = createBrowserClient();

  let query = supabase.from('users').select();

  if (filter) {
    query = query.or(`name.ilike.%${filter}%,email.ilike.%${filter}%`);
  }
  if (dept && dept.length) query = query.in('department', dept);
  if (pos && pos.length) query = query.contains('other_roles', pos);

  const { data: users, error } = await query.eq('role', 'faculty');

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
