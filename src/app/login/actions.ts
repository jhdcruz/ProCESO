'use server';

import { createServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Login to supabase auth using email login.
 */
export async function onEmailLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data) {
    return redirect('/');
  }

  if (error) {
    const message = error.message;
    return redirect(`/login?error=${message}`);
  }
}
