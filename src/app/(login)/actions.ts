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

  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

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
