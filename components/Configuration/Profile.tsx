import type { TUserSession } from '@/lib/auth/session';
import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting';
import { usePartnerById } from '@/utils/queries/partners';
import { useUserById } from '@/utils/queries/users';
import { BsCalendar4Event, BsCalendarPlus, BsTelephone } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { MdOutlineEmail } from 'react-icons/md';
import Avatar from '../utils/Avatar';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';
type ProfileProps = {
  session: TUserSession;
};
function Profile({ session }: ProfileProps) {
  const { data: user, isSuccess, isLoading, isError } = useUserById({ id: session.user.id });
  const { data: partner } = usePartnerById({ id: session.user.idParceiro || '' });
  console.log(user);
  if (isLoading) return <LoadingComponent />;
  if (isError) return <ErrorComponent msg='Erro ao buscar informações do seu usuário.' />;

  return (
    <div className='flex h-full grow flex-col'>
      <div className='flex w-full items-center justify-between border-b border-primary/30 pb-2 flex-col lg:flex-row'>
        <div className='flex flex-col'>
          <h1 className={'text-lg font-bold'}>Meu Perfil</h1>
          <p className='text-sm text-[#71717A]'>Gerencie informações do seu usuário.</p>
        </div>
        <div className='flex items-center gap-2 rounded-md border border-primary/30 p-2 shadow-md'>
          <Avatar url={partner?.logo_url || undefined} fallback={formatNameAsInitials(partner?.nome || '')} height={28} width={28} />
          <p className='text-xs font-medium text-primary/70'>{partner?.nome}</p>
        </div>
      </div>
      <div className='flex w-full flex-col gap-2 py-6'>
        <div className='flex w-full items-center gap-2 flex-col lg:flex-row'>
          {user?.avatar_url ? (
            <Avatar url={user?.avatar_url || undefined} fallback={formatNameAsInitials(user?.nome || '')} height={80} width={80} />
          ) : (
            <div className='flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full'>
              <FaUser style={{ color: 'white', fontSize: '25px' }} fill='true' />
            </div>
          )}
          <div className='flex flex-col'>
            <h1 className='text-lg font-bold leading-none tracking-tight'>{user?.nome}</h1>
            <div className='mt-1 flex items-center gap-2 flex-wrap'>
              <div className='flex items-center gap-1'>
                <MdOutlineEmail size={16} />
                <p className='text-sm text-primary/70'>{user?.email}</p>
              </div>
              <div className='flex items-center gap-1'>
                <BsTelephone size={14} />
                <p className='text-sm text-primary/70'>{user?.telefone}</p>
              </div>
            </div>
            <div className='mt-1 flex items-center gap-2 flex-wrap'>
              <div className='flex items-center gap-1'>
                <BsCalendarPlus size={14} />
                <p className='text-sm text-primary/70'>
                  Criado em <strong>{formatDateAsLocale(user?.dataInsercao || undefined)}</strong>
                </p>
              </div>
              <div className='flex items-center gap-1'>
                <BsCalendar4Event size={14} />
                <p className='text-sm text-primary/70'>
                  Última alteração em <strong>{formatDateAsLocale(user?.dataAlteracao || undefined)}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
