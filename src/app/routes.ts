import type { FC } from 'react';
import {
  IconCalendarStats,
  IconFileAnalytics,
  IconNotes,
  IconPresentationAnalytics,
  type IconProps,
} from '@tabler/icons-react';

export type Routes = {
  label: string;
  icon: FC<IconProps>;
  link?: string;
  initiallyOpened?: boolean;
  links?: NestedRoutes[];
}[];

export type NestedRoutes = {
  label: string;
  link: string;
};

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
    link: '/analytics',
  },
  {
    label: 'Certificates',
    icon: IconFileAnalytics,
    link: '/certs',
  },
];
