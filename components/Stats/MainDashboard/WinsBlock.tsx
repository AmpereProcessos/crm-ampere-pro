import Avatar from '@/components/utils/Avatar';
import type { TUserSession } from '@/lib/auth/session';
import { formatToMoney } from '@/lib/methods/formatting';
import { formatLongString } from '@/utils/methods';
import type { TGeneralStats } from '@/utils/schemas/stats.schema';
import Link from 'next/link';
import { BsCode, BsFillMegaphoneFill } from 'react-icons/bs';
import { MdOutlineAttachMoney, MdSell } from 'react-icons/md';

type WinsBlockProps = {
  data: TGeneralStats['ganhos'];
  session: TUserSession;
};
function WinsBlock({ data, session }: WinsBlockProps) {
  return (
    <div className='flex h-[650px] w-full flex-col rounded-xl  border border-primary/30 bg-background p-6 shadow-md lg:h-[450px]'>
      <div className='flex min-h-[42px] w-full flex-col'>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>Projetos ganhos</h1>
          <MdSell />
        </div>
        <p className='text-sm text-primary/70'>{data.length || 0} no período de escolha</p>
      </div>
      <div className='flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {data.length > 0 ? (
          data.map((win, index: number) => (
            <div
              key={`${win._id}`}
              className='flex w-full flex-col items-center justify-between border-b  border-primary/30 p-2 md:flex-row md:border-b-0'
            >
              <div className='flex w-full items-start gap-4 md:grow'>
                <div className='flex h-[30px] min-h-[30px] w-[30px] min-w-[30px] items-center justify-center rounded-full border border-black'>
                  <MdOutlineAttachMoney />
                </div>
                <div className='flex grow flex-col items-start'>
                  <Link href={`/comercial/proposta/${win.proposta?._id}`}>
                    <h1 className='w-full text-start text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'>
                      {formatLongString(win?.proposta?.nome.toUpperCase() || '', 30)}
                    </h1>
                  </Link>

                  <div className='mt-1 flex w-full items-center justify-start gap-2'>
                    <Link href={`/comercial/oportunidades/id/${win._id}`} className='text-primary/70 duration-300 ease-in-out hover:text-cyan-500'>
                      <div className='flex items-center gap-1'>
                        <BsCode />
                        <p className='text-xs'>#{win.nome}</p>
                      </div>
                    </Link>
                    {win.idMarketing ? (
                      <div className='flex items-center justify-center rounded-full border border-[#3e53b2] p-1 text-[#3e53b2]'>
                        <BsFillMegaphoneFill size={10} />
                      </div>
                    ) : null}
                    {win.responsaveis.map((resp) => (
                      <div key={resp.id} className='flex items-center gap-2'>
                        <Avatar fallback={'R'} url={resp?.avatar_url || undefined} height={20} width={20} />
                        <p className='text-xs text-primary/70'>{resp.nome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex min-w-fit items-center gap-1'>
                <p className='font-medium'>{win.proposta?.valor ? formatToMoney(win.proposta.valor) : 'N/A'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className='flex grow items-center justify-center'>
            <p className='text-center text-sm italic text-primary/70'>Sem projetos ganhos no período.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WinsBlock;
