import {
  IconCalendarStats,
  IconFileAnalytics,
  IconGauge,
  IconNotes,
  IconPresentationAnalytics,
} from '@tabler/icons-react';
import type { FC } from 'react';

export type Routes = {
  label: string;
  icon: FC;
  link?: string;
  initiallyOpened?: boolean;
  links?: NestedRoutes[];
}[];

export type NestedRoutes = {
  label: string;
  link: string;
};

/**
 * This is the main app url route.
 * All routes after authentication are prefixed with this.
 */
export const sidebarRoutes: Routes = [
  { label: 'Dashboard', icon: IconGauge, link: '/' },
  {
    label: 'Events',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'All Events', link: '/events' },
      { label: 'Event Series', link: '/events/series' },
    ],
  },
  {
    label: 'Calendar',
    icon: IconCalendarStats,
    link: '/calendar',
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
