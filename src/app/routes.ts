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

export const sidebarRoutes = [
  { label: 'Dashboard', icon: IconGauge, link: '/dashboard' },
  {
    label: 'Events',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'All Events', link: '/dashboard/events' },
      { label: 'Upcoming events', link: '/dashboard/events/up' },
      { label: 'Previous releases', link: '/dashboard/events/prev' },
    ],
  },
  {
    label: 'Calendar',
    icon: IconCalendarStats,
    links: [
      { label: 'Monthly Calendar', link: '/dashboard/cal' },
      { label: 'Calendar Feed', link: '/dashboard/cal/feed' },
    ],
  },
  { label: 'Analytics', icon: IconPresentationAnalytics },
  { label: 'Certificates', icon: IconFileAnalytics },
];
