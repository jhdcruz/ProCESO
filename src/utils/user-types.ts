import { Enums } from '@/libs/supabase/_database';

interface RolesUsers {
  value: Enums<'roles_user'>;
  label: string;
}
interface RolesDept {
  value: Enums<'roles_dept'>;
  label: string;
}
interface RolesPos {
  value: Enums<'roles_pos'>;
  label: string;
}

/** List of user roles for the system. */
export const listUserRoles: RolesUsers[] = [
  {
    value: 'admin',
    label: 'Admin',
  },
  {
    value: 'staff',
    label: 'Staff',
  },
  {
    value: 'faculty',
    label: 'Faculty',
  },
  {
    value: 'student',
    label: 'Student',
  },
];

/** List of college departments. */
export const listDepts: RolesDept[] = [
  { value: 'ccs', label: 'College of Computer Studies' },
  {
    value: 'cea',
    label: 'College of Engineering & Architecture',
  },
  { value: 'cbe', label: 'College of Business Education' },
  { value: 'coa', label: 'College of Arts' },
];

/** List of college offices. */
export const listOffices: RolesDept[] = [
  { value: 'ceso', label: 'Community Extensions Services' },
];

/** List of other offices or departments. */
export const listOthers: RolesDept[] = [
  { value: 'none', label: 'Not Assigned' },
];

/** List of user positions.  */
export const listPos: RolesPos[] = [
  { value: 'head', label: 'Committee Head' },
  { value: 'dean', label: 'Dept. Dean' },
];
