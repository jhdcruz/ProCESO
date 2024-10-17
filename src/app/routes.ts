import type { FC } from 'react';
import {
  IconCalendarStats,
  IconFileAnalytics,
  IconNotes,
  IconPresentationAnalytics,
  IconUsersGroup,
  type IconProps,
} from '@tabler/icons-react';

export type Routes = {
  label: string;
  icon: FC<IconProps>;
  link?: string;
  initiallyOpened?: boolean;
  links?: NestedRoutes[];
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
  { label: 'Dashboard', icon: IconCalendarStats, link: systemUrl },
  {
    label: 'Events',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'All Events', link: `${systemUrl}/events` },
      { label: 'Event Series', link: `${systemUrl}/series` },
    ],
  },
  {
    label: 'Analytics',
    icon: IconPresentationAnalytics,
    link: `${systemUrl}/analytics`,
  },
  {
    label: 'Certificates',
    icon: IconFileAnalytics,
    link: `${systemUrl}/certs`,
  },
  {
    label: 'Users',
    icon: IconUsersGroup,
    link: `${systemUrl}/users`,
  },
];
