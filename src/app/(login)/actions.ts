'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/libs/supabase/server';
import { systemUrl } from '../routes';

/**
 * Login to supabase auth using email login.
 */
export async function onEmailLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createServerClient(cookies());
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data) {
    return redirect(systemUrl);
  }

  if (error) {
    const message = error.message;
    return redirect(`/?error=${message}`);
  }
}

/**
 * Check the health of the system.
 *
 * Query all the services and check if they are up.
 */
export async function checkHealth() {
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
