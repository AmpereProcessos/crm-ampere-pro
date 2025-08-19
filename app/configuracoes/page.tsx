import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import ConfigurationsPage from './configurations-page';

export default async function Configurations() {
  const session = await getCurrentSession();

  if (!(session.user && session.session)) {
    return redirect('/auth/signin');
  }

  return <ConfigurationsPage session={session} />;
}
