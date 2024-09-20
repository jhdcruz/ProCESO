# Directory Structure

- `app/` - Main routes and domain-specific components.
- `components/` - Shared and reusable components.
- `email/` - Email templates for use with `Resend` and `Trigger.dev`.
- `libs/` - Re-exported/processed third-party libraries (ex. `dayjs`, `supabase`)
- `styles/` - CSS Modules and global styles.
- `trigger/` - Trigger.dev scripts for background and sceduled jobs. (ex. emails)
- `utils/` - Utility function and scripts. (ex. url parsing, and fullcalendar parsing)
- `instrumentation.ts` - Next.js instrumentation for Baselime monitoring.
