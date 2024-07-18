import type { ReactNode } from 'react';
import { RedirectType, redirect } from 'next/navigation';

import { AppContainer } from '@/components/Container/AppContainer';
import { getUserSession } from '@/utils/supabase/api/user';

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export default async function App({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getUserSession();

  // Redirect to log in on invalid session,
  // presumably expired/timeout.
  if (!user) {
    return redirect('/login', RedirectType.replace);
  }

  return <AppContainer user={user}>{children}</AppContainer>;
}
