import type { TUserSession } from '@/lib/auth/session';
import { formatLongString, formatToMoney } from '@/utils/methods';
import type { TGeneralStats } from '@/utils/schemas/stats.schema';
import Link from 'next/link';
import { BsFillMegaphoneFill } from 'react-icons/bs';
import { FaSignature } from 'react-icons/fa';
import Avatar from '../../utils/Avatar';

type PendingWinsBlockProps = {
  data: TGeneralStats['ganhosPendentes'];
  session: TUserSession;
};

function PendingWinsBlock({ data, session }: PendingWinsBlockProps) {
  function getIdleMoney(list: TGeneralStats['ganhosPendentes']) {
    if (!list) return 0;
    const total = list.reduce((acc, current) => {
      const proposalValue = current.proposta?.valor || 0;
      return acc + proposalValue;
    }, 0);
    return total;
  }
  return (
    <div className='flex h-[450px] w-full flex-col items-center rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
      <div className='flex min-h-[42px] w-full flex-col'>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>Contratos para Assinar</h1>
          <FaSignature />
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-primary/70'>{data ? data.length : 0} assinaturas para coletar</p>
          <p className='text-sm text-primary/70'>{formatToMoney(getIdleMoney(data))}</p>
        </div>
      </div>
      <div className='flex w-full grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {data ? (
          data?.length > 0 ? (
            data?.map((opportunity, index: number) => (
              <div
                key={`${opportunity._id}`}
                className='flex w-full flex-col items-center justify-between border-b  border-primary/30 p-2 md:flex-row md:border-b-0'
              >
                <div className='flex w-full items-start gap-4 md:grow'>
                  <div className='flex grow flex-col items-start'>
                    <Link href={`/comercial/oportunidades/id/${opportunity._id}`}>
                      <h1 className='w-full text-start text-sm font-medium leading-none tracking-tight hover:text-cyan-500'>
                        {formatLongString(opportunity?.nome.toUpperCase() || '', 30)}
                      </h1>
                    </Link>
                    <div className='mt-1 flex w-full items-center justify-start gap-2'>
                      {opportunity.idMarketing ? (
                        <div className='flex items-center justify-center rounded-full border border-[#3e53b2] p-1 text-[#3e53b2]'>
                          <BsFillMegaphoneFill size={10} />
                        </div>
                      ) : null}
                      {opportunity.responsaveis.map((resp) => (
                        <div key={resp.id} className='flex items-center gap-2'>
                          <Avatar fallback={'R'} url={resp?.avatar_url || undefined} height={20} width={20} />

                          <p className='text-xs text-primary/70'>{resp?.nome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='flex min-w-[120px] items-center justify-center gap-1 lg:justify-end'>
                  <p className='font-medium'>{opportunity?.proposta?.valor ? formatToMoney(opportunity.proposta?.valor) : 'N/A'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className='flex grow items-center justify-center'>
              <p className='text-center text-sm italic text-primary/70'>Sem assinaturas pendentes...</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

export default PendingWinsBlock;
