import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting';
import { TPPSCallDTO } from '@/utils/schemas/pps-calls.schema';
import Link from 'next/link';
import { BsCalendarCheck, BsCalendarPlus, BsCode } from 'react-icons/bs';
import Avatar from '../utils/Avatar';

function getBarColor(status?: TPPSCallDTO['status'] | null) {
  if (status == 'EM ANDAMENTO') return 'bg-blue-500';
  if (status == 'REALIZADO') return 'bg-green-500';
  if (status == 'PENDENTE') return 'bg-red-400';
  if (status == 'AGUARDANDO VENDEDOR') return 'bg-orange-400';
  return 'bg-red-400';
}
function getStatusTag(status?: TPPSCallDTO['status'] | null) {
  if (status == 'REALIZADO')
    return (
      <h1 className='w-fit self-center rounded-sm border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500'>REALIZADO</h1>
    );
  if (status == 'EM ANDAMENTO')
    return (
      <h1 className='w-fit self-center rounded-sm border border-blue-500 p-1 text-center text-[0.6rem] font-black text-blue-500'>EM ANDAMENTO</h1>
    );
  if (status == 'AGUARDANDO VENDEDOR')
    return (
      <h1 className='w-fit self-center rounded-sm border border-orange-500 p-1 text-center text-[0.6rem] font-black text-orange-500'>
        AG. VENDENDOR
      </h1>
    );
  if (status == 'PENDENTE')
    return <h1 className='w-fit self-center rounded-sm border border-red-400 p-1 text-center text-[0.6rem] font-black text-red-400'>PENDENTE</h1>;

  return <h1 className='w-fit self-center rounded-sm border border-red-400 p-1 text-center text-[0.6rem] font-black text-red-400'>PENDENTE</h1>;
}

type PPSCallProps = {
  call: TPPSCallDTO;
};
function PPSCall({ call }: PPSCallProps) {
  return (
    <div className='flex w-full gap-2 rounded-md border border-primary/30 shadow-md'>
      <div className={`h-full w-[5px] rounded-bl-md rounded-tl-md ${getBarColor(call.status)}`}></div>
      <div className='flex grow flex-col p-3'>
        <div className='flex w-full grow flex-col gap-1'>
          <div className='flex w-full flex-col items-start justify-between gap-1 lg:flex-row'>
            <div className='flex grow flex-col items-center lg:items-start'>
              <h1 className='w-full text-start text-xs font-bold leading-none tracking-tight'>{call.tipoSolicitacao || 'NÃO DEFINIDO'}</h1>
              {call.projeto.id ? (
                <div className='flex w-full items-center gap-1'>
                  <BsCode />
                  <Link href={`/comercial/oportunidades/id/${call.projeto.id}`}>
                    <p className='text-[0.65rem] font-medium uppercase tracking-tight text-primary/70 duration-300 ease-in-out hover:text-cyan-500'>
                      {call.projeto.nome}
                    </p>
                  </Link>
                </div>
              ) : null}
            </div>
            <div className='w-full min-w-fit lg:w-fit'>{getStatusTag(call.status)}</div>
          </div>
          <div className='mt-2 flex items-center gap-2'>
            <Avatar
              url={call.requerente.avatar_url || undefined}
              fallback={formatNameAsInitials(call.requerente.nomeCRM || 'U')}
              width={20}
              height={20}
            />
            <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
              REQUERIDO POR <strong className='text-cyan-500'>{call.requerente.nomeCRM?.toUpperCase() || 'NÃO DEFINIDO'}</strong>
            </p>
          </div>
        </div>
        <div className='mt-2 flex w-full items-center justify-between'>
          <div className='flex items-center justify-center gap-1'>
            <p className='text-[0.6rem] font-medium'>VOLTS</p>
          </div>
          <div className={`flex items-center gap-2`}>
            <div className='ites-center flex gap-1'>
              <BsCalendarPlus />
              <p className={`text-[0.6rem] font-medium`}>{formatDateAsLocale(call.dataInsercao, true)}</p>
            </div>
            {call.dataEfetivacao ? (
              <div className='ites-center flex gap-1'>
                <BsCalendarCheck color='rgb(34,197,94)' />
                <p className={`text-[0.6rem] font-medium`}>{formatDateAsLocale(call.dataEfetivacao, true)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PPSCall;
