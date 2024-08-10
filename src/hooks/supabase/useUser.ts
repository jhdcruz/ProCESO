import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { useClient } from './useClient';
import type { UserAvatarProps } from '@/components/UserButton';
import { Enums } from '@/utils/supabase/types';

export interface CurrentUser extends UserAvatarProps {
  role?: Enums<'user_roles'>;
}

/**
 * Get currently logged-in user from session.
 */
export const useCurrentUser = async (): Promise<null | CurrentUser> => {
  const supabase = useClient(cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // treat no email as not logged in
  if (!user?.email) {
    redirect('/login');
  }

  // get user role
  const { data: role } = await supabase
    .from('users')
    .select('role')
    .eq('email', user?.email)
    .limit(1)
    .single();

  if (user) {
    return {
      email: user?.email,
      name: user?.user_metadata.name ?? '',
      avatarUrl: user?.user_metadata.avatar_url ?? '',
      role: role?.role ?? 'student',
    };
  }

  return null;
};
