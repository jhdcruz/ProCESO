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
 * Check if the user is internal or faculty chair.
 *
 * @param role - The user's role.
 */
export const isElevated = (
  role: Enums<'roles_user'> | null,
  pos?: Enums<'roles_pos'>[] | null,
): boolean => {
  if (!role) {
    return false;
  }

  return pos?.includes('chair') || isInternal(role);
};

/**
 * Check if the user is internal or faculty.
 *
 * @param role - The user's role.
 */
export const isPrivate = (role: Enums<'roles_user'> | null): boolean => {
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
 * Check if the user is a student or faculty.
 * Does not include admin or staff.
 *
 * @param role - The user's role.
 */
export const isPublic = (role: Enums<'roles_user'> | null): boolean => {
  if (!role) {
    return false;
  }

  return role === 'student' || role === 'faculty';
};

/**
 * Check if the user is a student.
 *
 * @param role - The user's role.
 */
export const isStudent = (role: Enums<'roles_user'> | null): boolean => {
  if (!role) {
    return false;
  }

  return role === 'student';
};

/**
 * Check if the user is allowed to access or view the activity,
 * based on the activity's visibility and the user's role.
 *
 * @param role - The user's role.
 * @param visibility - The activity's visibility.
 */
export const canAccessActivity = (
  visibility: Enums<'activity_visibility'> | null,
  role: Enums<'roles_user'> | null,
): boolean => {
  switch (visibility) {
    case 'Internal':
      return isInternal(role);
    case 'Faculty':
      return isPrivate(role);
    default:
      return true;
  }
};
