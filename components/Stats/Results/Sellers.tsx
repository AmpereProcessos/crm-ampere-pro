import EditSalePromoter from '@/components/Modals/SalePromoter/EditSalePromoter';
import Avatar from '@/components/utils/Avatar';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { formatDecimalPlaces, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting';
import { cn } from '@/lib/utils';
import { useSalePromotersResults } from '@/utils/queries/stats/sellers';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { BsFileEarmarkText, BsPatchCheck } from 'react-icons/bs';
import { FaBolt, FaPercentage } from 'react-icons/fa';
import { GrSend } from 'react-icons/gr';
import { MdOutlineTrendingDown, MdOutlineTrendingUp } from 'react-icons/md';
import { VscDiffAdded } from 'react-icons/vsc';

function renderPerformance({ achieved, goal }: { achieved?: number | null; goal?: number | null }) {
  if (!goal)
    return <div className={cn('flex items-center gap-1 rounded-lg bg-black px-2 py-0.5 text-[0.6rem] font-medium text-primary-foreground')}>N/A</div>;
  const performance = (100 * (achieved || 0)) / goal;
  if (performance > 100)
    return (
      <div className={cn('flex items-center gap-1 rounded-lg bg-green-500 px-2 py-0.5 text-[0.6rem] font-medium text-primary-foreground')}>
        <h1 className='text-[0.55rem]'>{formatDecimalPlaces(performance)}%</h1>
        <MdOutlineTrendingUp />
      </div>
    );
  return (
    <div className={cn('flex items-center gap-1 rounded-lg bg-red-500 px-2 py-0.5 text-[0.6rem] font-medium text-primary-foreground')}>
      <h1 className='text-[0.55rem]'>{formatDecimalPlaces(performance)}%</h1>
      <MdOutlineTrendingDown />
    </div>
  );
}

type SellersProps = {
  after: string;
  before: string;
  session: TUserSession;
};
function Sellers({ after, before, session }: SellersProps) {
  const [salePromoterViewModal, setSalePromoterViewModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  const { data, isSuccess } = useSalePromotersResults({ after, before });

  return (
    <div className='flex w-full flex-col'>
      <h1 className='mt-4 rounded-md bg-black text-center text-xl font-black text-primary-foreground'>PROMOTORES DE VENDA</h1>
      <div className='mt-2 flex grow flex-col flex-wrap justify-around gap-2 py-2 lg:flex-row'>
        {isSuccess ? (
          data.map((responsible, index) => {
            return (
              <div key={responsible.id} className='flex w-full  flex-col gap-2 rounded-xl border border-black bg-background p-6 shadow-md lg:w-[48%]'>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Avatar width={25} height={25} url={responsible.avatar_url || undefined} fallback={formatNameAsInitials(responsible.nome)} />
                    <p className='text-sm font-bold leading-none tracking-tight'>{responsible.nome}</p>
                  </div>
                </div>
                <h1 className='w-full py-0.5 text-start text-[0.6rem] font-medium italic text-primary/70'>RESULTADOS</h1>
                <div className='flex w-full flex-col justify-between gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center gap-1 lg:w-1/2 lg:justify-start'>
                    <VscDiffAdded width={10} height={10} />
                    <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>PROJETOS CRIADOS</h1>
                    <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
                      {responsible.projetosCriados.atingido}/{responsible.projetosCriados.objetivo}
                    </h1>
                    {renderPerformance({ achieved: responsible.projetosCriados.atingido, goal: responsible.projetosCriados.objetivo })}
                  </div>
                  <div className='flex w-full flex-row items-center justify-center gap-1 lg:w-1/2 lg:flex-row-reverse lg:justify-start'>
                    <BsPatchCheck width={10} height={10} />
                    <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>PROJETOS VENDIDOS</h1>
                    <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
                      {responsible.projetosVendidos.atingido}/{responsible.projetosVendidos.objetivo}
                    </h1>
                    {renderPerformance({ achieved: responsible.projetosVendidos.atingido, goal: responsible.projetosVendidos.objetivo })}
                  </div>
                </div>
                <div className='flex w-full flex-col justify-between gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center gap-1 lg:w-1/2 lg:justify-start'>
                    <FaBolt width={10} height={10} />
                    <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>POTÊNCIA VENDIDA</h1>
                    <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
                      {formatDecimalPlaces(responsible.potenciaVendida.atingido || 0)}kWp/{' '}
                      {formatDecimalPlaces(responsible.potenciaVendida.objetivo || 0)}kWp
                    </h1>
                    {renderPerformance({ achieved: responsible.potenciaVendida.atingido, goal: responsible.potenciaVendida.objetivo })}
                  </div>
                  <div className='flex w-full flex-row items-center justify-center gap-1 lg:w-1/2 lg:flex-row-reverse lg:justify-start'>
                    <BsFileEarmarkText width={10} height={10} />
                    <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>VALOR VENDIDO</h1>
                    <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
                      {formatToMoney(responsible.valorVendido.atingido || 0)}/ {formatToMoney(responsible.valorVendido.objetivo || 0)}
                    </h1>
                    {renderPerformance({ achieved: responsible.valorVendido.atingido, goal: responsible.valorVendido.objetivo })}
                  </div>
                </div>
                <div className='flex w-full flex-col justify-between gap-2 lg:flex-row'>
                  <div className='flex w-full items-center justify-center gap-1 lg:w-1/2 lg:justify-start'>
                    <GrSend width={10} height={10} />
                    <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>PROJETOS ENVIADOS</h1>
                    <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
                      {responsible.projetosEnviados.atingido || 0}/ {responsible.projetosEnviados.objetivo || 0}
                    </h1>
                    {renderPerformance({ achieved: responsible.projetosEnviados.atingido, goal: responsible.projetosEnviados.objetivo })}
                  </div>
                  <div className='flex w-full flex-row items-center justify-center gap-1 lg:w-1/2 lg:flex-row-reverse lg:justify-start'>
                    <FaPercentage width={10} height={10} />
                    <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>CONVERSÃO</h1>
                    <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
                      {formatDecimalPlaces(responsible.conversao.atingido || 0)}%/ {formatDecimalPlaces(responsible.conversao.objetivo || 0)}%
                    </h1>
                    {renderPerformance({ achieved: responsible.conversao.atingido, goal: responsible.conversao.objetivo })}
                  </div>
                </div>
                <div className='flex w-full items-center justify-end'>
                  <button
                    type='button'
                    onClick={() => setSalePromoterViewModal({ id: responsible.id, isOpen: true })}
                    className='flex items-center gap-1 rounded-lg bg-black px-2 py-1 text-[0.6rem] text-primary-foreground'
                  >
                    <Eye width={10} height={10} />
                    <p>VISUALIZAR</p>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <LoadingComponent />
        )}
      </div>
      {salePromoterViewModal.id && salePromoterViewModal.isOpen ? (
        <EditSalePromoter
          promoterId={salePromoterViewModal.id}
          session={session}
          closeModal={() => setSalePromoterViewModal({ id: null, isOpen: false })}
        />
      ) : null}
    </div>
  );
}

export default Sellers;
