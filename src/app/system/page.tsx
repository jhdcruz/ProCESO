import { getUserRole } from '@/utils/supabase/api/user';

export default async function DashboardPage() {
  const role = await getUserRole();

  switch (role) {
    case 'admin':
      return <>Admin</>;
    case 'staff':
      return <>Staff</>;
    case 'faculty':
      return <>Faculty</>;
    default:
      // students, or else
      return <>Students</>;
  }
}
