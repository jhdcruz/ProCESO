import type { FC } from 'react';
import {
  IconCalendarStats,
  IconFileAnalytics,
  IconNotes,
  IconPresentationAnalytics,
  IconUsersGroup,
  type IconProps,
} from '@tabler/icons-react';
import { Enums } from '@/libs/supabase/_database';

export type Routes = {
  label: string;
  icon: FC<IconProps>;
  link?: string;
  initiallyOpened?: boolean;
  links?: NestedRoutes[];
  // minimum access level required to view the route
  access: Enums<'roles_user'>[];
}[];

export interface NestedRoutes {
  label: string;
  link: string;
}

/**
 * All routes after authentication are prefixed with this.
 */
export const systemUrl = '/portal';

/**
 * This is the main app url route.
 * All routes after authentication are prefixed with this.
 */
export const sidebarRoutes: Routes = [
  {
    label: 'Dashboard',
    icon: IconCalendarStats,
    link: systemUrl,
    access: ['student', 'faculty', 'staff', 'admin'],
  },
  {
    label: 'Events',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'All Events', link: `${systemUrl}/events` },
      { label: 'Event Series', link: `${systemUrl}/series` },
    ],
    access: ['student', 'faculty', 'staff', 'admin'],
  },
  {
    label: 'Analytics',
    icon: IconPresentationAnalytics,
    link: `${systemUrl}/analytics`,
    access: ['staff', 'admin'],
  },
  {
    label: 'Certificates',
    icon: IconFileAnalytics,
    link: `${systemUrl}/certs`,
    access: ['staff', 'admin'],
  },
  {
    label: 'Users',
    icon: IconUsersGroup,
    link: `${systemUrl}/users`,
    access: ['admin'],
  },
];
