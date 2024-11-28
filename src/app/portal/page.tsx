import { createServerClient } from '@/libs/supabase/server';
import { redirect, RedirectType } from 'next/navigation';
import { cookies } from 'next/headers';
import { sidebarRoutes, systemUrl } from '../routes';
import type { Tables } from '@/libs/supabase/_database';

// Helper function to check if objects have different values
const hasChanges = (
  dbUser: Partial<Tables<'users'>>,
  oAuthUser: Partial<Tables<'users'>>,
) => {
  // Only check fields that we care about updating
  const fieldsToCheck: (keyof Tables<'users'>)[] = [
    'email',
    'name',
    'department',
    'avatar_url',
    'other_roles',
    'role',
    'active',
  ];
  return fieldsToCheck.some((key) => dbUser[key] !== oAuthUser[key]);
};

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
    // Get current user data from database
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select(`email, name, department, avatar_url, other_roles, role, active`)
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.warn('Error fetching user data:', fetchError?.message);
    }

    // Extract OAuth user details (these values take precedence over DB values)
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
      department: department ?? 'na',
      avatar_url,
      other_roles,
      role: role ?? 'student',
      active,
    };

    // Update DB if OAuth data differs from stored data
    if (dbUser && hasChanges(dbUser, oAuthUser)) {
      const { error: dbError } = await supabase
        .from('users')
        .update(oAuthUser) // OAuth data takes precedence
        .eq('id', id);

      if (dbError) {
        console.warn('Error updating user from session:', dbError?.message);
      }
    }
  }

  redirect(
    sidebarRoutes[0].link ?? systemUrl + '/dashboard',
    RedirectType.replace,
  );
}
