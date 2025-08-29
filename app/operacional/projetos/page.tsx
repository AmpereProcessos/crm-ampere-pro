import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import OperationalProjectsPage from './projects-page';

export default async function OperationalProjects() {
  const session = await getCurrentSession();
  if (!session.session || !session.user) redirect('/auth/signin');

  return <OperationalProjectsPage session={session} />;
}
