// Contains global action functions that can be used across routes

'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { UserResponse } from '@/libs/supabase/api/_response';
import { createServerClient } from '@/libs/supabase/server';

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
  const supabase = await createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: 2,
      title: 'No user found',
      message: 'No user found in session',
    };
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

/**
 * Check the health of the system.
 *
 * Query all the services and check if they are up.
 */
export async function checkSystemHealth() {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error('SUPABASE_URL is not set');

  const db = await fetch(url, {
    method: 'HEAD',
    headers: {
      apikey: `${process.env.SUPABASE_ANON_KEY}`,
    },
  });

  const status = await Promise.all([db]);

  // check if all promises resolves
  // we'll include 404, since technically it is accessible
  if (status.every((res) => res.status === 404 || res.ok)) {
    return 0; // healthy
  }

  // check if some promise returns an error
  if (status.some((res) => res.status !== 404 || !res.ok)) {
    return 1; // warning
  }

  return 2; // critical, all down
}
