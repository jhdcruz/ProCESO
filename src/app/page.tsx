import { RedirectType, redirect } from 'next/navigation';

import { getUserSession } from '@/utils/supabase/api/user';
import { rootUrl } from './routes';

/**
 * Contains the main layout for the application.
 *
 * Auth checking is done in the middleware.
 */
export default async function App() {
  const user = await getUserSession();

  // Redirect to log in on invalid session,
  // presumably expired/timeout.
  if (!user) {
    return redirect('/login', RedirectType.replace);
  }

  return redirect(rootUrl, RedirectType.replace);
}
