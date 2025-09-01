import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import LeadsPage from './leads-page';

export default async function Leads() {
  const session = await getCurrentSession();
  if (!session.user || !session.session) {
    return redirect('/auth/signin');
  }
  return <LeadsPage session={session} />;
}
