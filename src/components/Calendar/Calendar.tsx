'use client';

import { memo } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import FullCalendar from '@fullcalendar/react';
import styles from './Calendar.module.css';

// styles that requires specificity for override
import '@/styles/full-calendar.css';

/**
 * Calendar component for displaying activities.
 *
 * For more information about FullCalendar:
 * @see https://fullcalendar.io/docs
 *
 * For more information about FullCalendar `activities` JSON feed:
 * @see https://fullcalendar.io/docs/activities-json-feed
 */
function CalendarComponent() {
  return (
    <section className={styles.root}>
      <FullCalendar
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'List',
          multiMonthYear: 'Year',
        }}
        dayMaxEvents={true}
        events="/api/activities/feed" // App API endpoint for fetching activities
        headerToolbar={{
          left: 'timeGridWeek,dayGridMonth,multiMonthYear list',
          center: 'title',
          right: 'timeGridDay,today prev,next',
        }}
        height="92vh"
        initialView="dayGridMonth"
        lazyFetching={true}
        nowIndicator={true}
        plugins={[dayGridPlugin, multiMonthPlugin, listPlugin, timeGridPlugin]}
        timeZone="Asia/Manila"
      />
    </section>
  );
}

export const Calendar = memo(CalendarComponent);
