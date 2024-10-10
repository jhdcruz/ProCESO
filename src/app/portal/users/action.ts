'use server';

import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';
import { systemUrl } from '@/app/routes';
import type { Enums } from '@/libs/supabase/_database';
import { createServerClient as createAdminClient } from '@/libs/supabase/admin';
import { siteUrl } from '@/utils/url';

/**
 * Invite user to the system.
 *
 * @param email Email address of the user to invite
 * @param metadata Metadata to be attached to the user
 */
export async function inviteUserAction(
  email: string,
  metadata: {
    dept?: Enums<'roles_dept'>;
    pos?: Enums<'roles_pos'>[];
    role?: Enums<'roles_user'>;
  },
) {
  const cookieStore = cookies();
  const supabase: SupabaseClient = createAdminClient(cookieStore);

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: metadata,
    redirectTo: siteUrl() + 'auth/callback' + systemUrl,
  });

  if (error) {
    return {
      status: 2,
      title: 'Unable to send invitation',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'User invitation sent',
    message: `'${email}' has been successfully invited.`,
  };
}
