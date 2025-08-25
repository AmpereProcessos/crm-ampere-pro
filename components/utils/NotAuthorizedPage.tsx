import type { TUserSession } from '@/lib/auth/session';
import { Sidebar } from '../Sidebar';

type NotAuthorizedPageProps = {
  session: TUserSession;
};
function NotAuthorizedPage({ session }: NotAuthorizedPageProps) {
  return (
    <div className='flex h-full flex-col md:flex-row'>
      <Sidebar session={session} />
      <div className='flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-background p-6'>
        <p className='text-center text-lg font-medium text-primary/50'>Oops, seu usuário não tem permissão para acessar essa área.</p>
      </div>
    </div>
  );
}

export default NotAuthorizedPage;
