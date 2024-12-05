import { createServerClient } from '@/libs/supabase/server';
import { redirect, RedirectType } from 'next/navigation';
import { cookies } from 'next/headers';
import { sidebarRoutes, systemUrl } from '../routes';
import { PageLoader } from '@/components/Loader/PageLoader';

/**
 * Update user details based on changes from OAuth providers,
 * such as Google Workspace.
 */
export default async function RootPage() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    redirect('/', RedirectType.replace);
  } else {
    // Extract OAuth user details
    const { id, email, user_metadata } = user;
    const {
      name,
      dept: department,
      avatar_url,
      pos: other_roles,
      role,
      active,
    } = user_metadata;

    // Create updated user object from OAuth data
    const oAuthUser = {
      email,
      name,
      department,
      avatar_url,
      other_roles,
      role,
      active,
    };

    const { error: dbError } = await supabase
      .from('users')
      .update(oAuthUser) // OAuth data takes precedence
      .eq('id', id);

    if (dbError) {
      console.warn('Error updating user from session:', dbError?.message);
    }
  }

  redirect(
    sidebarRoutes[0].link ?? systemUrl + '/dashboard',
    RedirectType.replace,
  );

  return <PageLoader />;
}
