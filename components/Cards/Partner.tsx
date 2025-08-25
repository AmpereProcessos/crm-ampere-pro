import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting';
import { Optional } from '@/utils/models';
import { TPartnerDTOWithUsers } from '@/utils/schemas/partner.schema';
import { BsCalendarPlus, BsTelephone } from 'react-icons/bs';
import { FaRegUserCircle } from 'react-icons/fa';
import { MdOutlineEmail } from 'react-icons/md';
import Avatar from '../utils/Avatar';

type PartnerProps = {
  partner: Optional<TPartnerDTOWithUsers, 'usuarios'>;
  handleClick: (id: string) => void;
};
function Partner({ partner, handleClick }: PartnerProps) {
  return (
    <div className='flex w-full gap-2 rounded-md border border-primary/30 bg-background font-Inter shadow-md'>
      <div className={`flex h-full min-h-full min-w-[6px] rounded-bl-md rounded-tl-md bg-blue-500`}></div>
      <div className='flex h-full grow flex-col p-3'>
        <div className='flex w-full items-center gap-2'>
          <Avatar width={40} height={40} url={partner.logo_url || undefined} fallback={formatNameAsInitials(partner.nome)} backgroundColor='black' />
          <h1
            onClick={() => handleClick(partner._id)}
            className='cursor-pointer font-bold leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'
          >
            {partner.nome}
          </h1>
        </div>
        <div className='flex w-full grow flex-col'>
          <div className='flex w-full items-center gap-2'>
            <div className='flex items-center gap-2'>
              <BsTelephone size={12} />
              <p className='text-xs font-light text-primary/50'>{partner.contatos.telefonePrimario}</p>
            </div>
            <div className='flex items-center gap-2'>
              <MdOutlineEmail size={15} />
              <p className='text-xs font-light text-primary/50'>{partner.contatos.email}</p>
            </div>
          </div>
          {partner.usuarios ? (
            <>
              <div className='mt-2 flex w-full items-center justify-start gap-2'>
                <div className='flex items-center gap-1 text-blue-500'>
                  <FaRegUserCircle />
                  <h1 className='font-Inter text-xs font-bold'>{partner.usuarios.length}</h1>
                </div>
                <h1 className='font-Inter text-xs text-primary/50'>USUÁRIOS</h1>
              </div>
              <div className='mt-2 flex w-full flex-wrap items-start justify-start gap-2'>
                {partner.usuarios.map((user, index) => {
                  if (index < 10)
                    return (
                      <div key={user._id} className='flex items-center gap-1'>
                        <Avatar url={user.avatar_url || undefined} fallback={formatNameAsInitials(user.nome)} height={15} width={15} />
                        <p className='font-Inter text-xs font-medium text-primary/50'>{user.nome}</p>
                      </div>
                    );
                })}
                {partner.usuarios.length > 10 ? <p className='font-Inter text-xs font-medium text-primary/50'>E MAIS...</p> : null}
              </div>
            </>
          ) : null}
        </div>
        <div className='mt-2 flex w-full items-center justify-end gap-2'>
          <BsCalendarPlus />
          <p className='text-sm font-light text-primary/50'>{formatDateAsLocale(partner.dataInsercao)}</p>
        </div>
      </div>
    </div>
  );
}

export default Partner;
