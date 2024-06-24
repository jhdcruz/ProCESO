import { createServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Get user role
 */
async function getUserRole() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // fetch role from db instead of session token
  // for security purposes
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('email', session?.user.email)
    .limit(1)
    .single();

  return data?.role ?? 'student';
}

export default async function DashboardPage() {
  const role = await getUserRole();

  switch (role) {
    case 'admin':
      return <>Admin</>;
    case 'staff':
      return <>Staff</>;
    case 'faculty':
      return <>Faculty</>;
    default:
      return <>Student-level</>;
  }
}
