import type { MantineColor } from '@mantine/core';
import type { Enums } from '@/libs/supabase/_database';

/**
 * Return role-specific colors
 * for use with Badges, and such.
 *
 * @param role - User's role in the system.
 */
export function getRoleColor(role?: Enums<'roles_user'> | null): MantineColor {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'red';
    case 'staff':
      return 'brand';
    case 'faculty':
      return 'green';
    default:
      return 'blue';
  }
}

/**
 * Return department-specific colors
 * for use with Badges, and such.
 *
 * @param dept - Faculty's dept in the system.
 */
export function getDeptColor(dept?: Enums<'roles_dept'> | null): MantineColor {
  switch (dept?.toLowerCase()) {
    case 'ccs':
      return 'blue';
    case 'cea':
      return 'red';
    case 'coa':
      return 'green';
    case 'cbe':
      return 'violet';
    case 'ceso':
      return 'brand';
    default:
      return 'gray';
  }
}

/**
 * Return position-specific colors
 * for use with Badges, and such.
 *
 * @param pos - Faculty's dept in the system.
 */
export function getPosColor(pos?: Enums<'roles_pos'> | null): MantineColor {
  switch (pos?.toLowerCase()) {
    case 'head':
      return 'blue';
    case 'dean':
      return 'red';
    default:
      return 'brand';
  }
}
