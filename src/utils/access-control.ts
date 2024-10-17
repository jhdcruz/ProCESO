import type { Enums } from '@/libs/supabase/_database';

/**
 * Check if the user is an admin or staff.
 *
 * @param role - The user's role.
 */
export const isInternal = (role: Enums<'roles_user'> | null): boolean => {
  if (!role) {
    return false;
  }

  return role === 'admin' || role === 'staff';
};

/**
 * Check if the user is internal or faculty.
 *
 * @param role - The user's role.
 */
export const isElevated = (role: Enums<'roles_user'> | null): boolean => {
  if (!role) {
    return false;
  }

  return isInternal(role) || role === 'faculty';
};

/**
 * Check if the user is an admin.
 *
 * @param role - The user's role.
 */
export const isAdmin = (role: Enums<'roles_user'> | null): boolean => {
  if (!role) {
    return false;
  }

  return role === 'admin';
};

/**
 * Check if the user is allowed to access or view the event,
 * based on the event's visibility and the user's role.
 *
 * @param role - The user's role.
 * @param visibility - The event's visibility.
 */
export const canAccessEvent = (
  visibility: Enums<'event_visibility'>,
  role: Enums<'roles_user'> | null,
): boolean => {
  switch (visibility) {
    case 'Internal':
      return isInternal(role);
    case 'Faculty':
      return isElevated(role);
    default:
      return true;
  }
};
