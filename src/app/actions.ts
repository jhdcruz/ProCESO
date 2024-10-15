// Contains global action functions that can be used across routes

'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { UserResponse } from '@/libs/supabase/api/_response';
import { createServerClient } from '@/libs/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Render a pathname stale, and in need of fresh data.
 *
 * Use for every updating and inserting of data.
 *
 * @params pathname - The path to revalidate
 */
export async function revalidate(pathname: string) {
  revalidatePath(pathname);
}

/**
 * Get currently logged-in user from session.
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: current, error } = await supabase
    .from('users')
    .select()
    .eq('id', user.id)
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
