'use server';

import { cookies } from 'next/headers';
import { systemUrl } from '@/app/routes';
import { createServerClient as createAdminClient } from '@/libs/supabase/admin';
import type { Enums } from '@/libs/supabase/_database';
import { siteUrl } from '@/utils/url';
import type ApiResponse from '@/utils/response';

/**
 * Invite a user to the system.
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
  const supabase = await createAdminClient(cookieStore);

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

/**
 * Disable/ban user to the system.
 *
 * @param uid User ID to disable
 */
export async function changeUserAccess(uid: string, active: boolean) {
  const cookieStore = cookies();
  const supabase = await createAdminClient(cookieStore);

  const { error } = await supabase
    .from('users')
    .update({ active: active })
    .eq('id', uid);

  const action = active ? 'enable' : 'disable';

  if (error) {
    return {
      status: 2,
      title: `Unable to ${action} user`,
      message: error.message,
    };
  }

  return {
    status: 0,
    title: `User has been ${action}d`,
    message: active
      ? 'User can now log-in or use the system.'
      : "User won't be able to log-in anymore.",
  };
}

/**
 * Update user credentials.
 *
 * @param uid User ID to update
 * @param dept Department to update
 * @param role Role to update
 * @param pos Position to update
 */
export async function updateUser(
  id: string,
  body: {
    dept: Enums<'roles_dept'>;
    role: Enums<'roles_user'>;
    pos: Enums<'roles_pos'>[];
  },
): Promise<ApiResponse> {
  const cookieStore = cookies();
  const supabase = await createAdminClient(cookieStore);

  const { error } = await supabase
    .from('users')
    .update({ department: body.dept, role: body.role, other_roles: body.pos })
    .eq('id', id);

  if (error) {
    return {
      status: 2,
      title: 'Unable to update user',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'User updated',
    message: 'User credentials has been successfully updated.',
  };
}
