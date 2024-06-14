import { AppContainer } from '@/components/Container/AppContainer';
import { UserAvatarProps } from '@/components/UserButton';
import { createServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

/**
 * Get currently logged-in user.
 */
async function getUserSession(): Promise<null | UserAvatarProps> {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return {
      email: session.user.email ?? '',
      name: session.user.user_metadata.name ?? '',
      avatarUrl: session.user.user_metadata.avatar_url ?? '',
    };
  }

  return null;
}

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

  return <AppContainer {...user} />;
}
