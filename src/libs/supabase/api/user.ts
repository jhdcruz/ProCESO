import { type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@/libs/supabase/client';
import { createServerClient } from '@/libs/supabase/server';
import type { UserResponse, UsersResponse } from './_response';
import type { Enums } from '../_database';

/**
 * Get all users
 */
export async function getUsers({
  filter,
  depts,
  pos,
  roles,
  range,
}: {
  filter?: string;
  depts?: Enums<'roles_dept'>[];
  pos?: Enums<'roles_pos'>[];
  roles?: Enums<'roles_user'>[];
  range?: [number, number];
}): Promise<UsersResponse> {
  const supabase = createBrowserClient();

  let query = supabase.from('users').select('*', { count: 'exact' });

  if (filter) {
    query = query.or(`name.ilike.%${filter}%,email.ilike.%${filter}%`);
  }
  if (depts?.length) query = query.in('department', depts);
  if (pos?.length) query = query.contains('other_roles', pos);
  if (roles?.length) query = query.in('role', roles);

  const {
    data: users,
    count,
    error,
  } = await query.range(range?.[0] ?? 0, range?.[1] ?? 24);

  if (error) {
    return {
      status: 2,
      title: 'Unable to get users',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Users fetched',
    message: 'List of users have been successfully fetched.',
    data: users,
    count: count ?? 0,
  };
}

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
  if (dept?.length) query = query.in('department', dept);
  if (pos?.length) query = query.contains('other_roles', pos);

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
