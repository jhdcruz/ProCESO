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
export const rootUrl = '/system';

export const sidebarRoutes: Routes = [
  { label: 'Dashboard', icon: IconGauge, link: `${rootUrl}` },
  {
    label: 'Events',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'All Events', link: `${rootUrl}/events` },
      { label: 'Upcoming events', link: `${rootUrl}/events/upcoming` },
      { label: 'Previous releases', link: `${rootUrl}/events/past` },
    ],
  },
  {
    label: 'Calendar',
    icon: IconCalendarStats,
    initiallyOpened: true,
    links: [
      { label: 'Monthly Calendar', link: `${rootUrl}/cal` },
      { label: 'Calendar Feed', link: `${rootUrl}/cal/feed` },
    ],
  },
  {
    label: 'Analytics',
    icon: IconPresentationAnalytics,
    link: `${rootUrl}/analytics`,
  },
  {
    label: 'Certificates',
    icon: IconFileAnalytics,
    link: `${rootUrl}/certs`,
  },
];
