import { formatDateAsLocale } from '@/lib/methods/formatting';
import { formatToMoney } from '@/utils/methods';
import { TProposalUpdateRecordDTO } from '@/utils/schemas/proposal-update-records.schema';
import { TPricingItem } from '@/utils/schemas/proposal.schema';
import { BsCalendarPlus } from 'react-icons/bs';
import { MdArrowCircleDown, MdArrowCircleUp } from 'react-icons/md';
import Avatar from '../utils/Avatar';

function renderPricingChanges({ previousPricing, newPricing }: { previousPricing: TPricingItem[]; newPricing: TPricingItem[] }) {
  const mescled = newPricing
    ?.map((newPricingItem) => {
      const previousItem = previousPricing?.find((previousPricingItem) => previousPricingItem.descricao == newPricingItem.descricao);
      const previousCost = previousItem?.custoFinal || 0;
      const previousTotal = previousItem?.valorFinal || 0;
      const newCost = newPricingItem.custoFinal;
      const newTotal = newPricingItem.valorFinal;
      const isDifferent = previousCost != newCost || previousTotal != newTotal;
      return {
        descricao: newPricingItem.descricao,
        custoAnterior: previousCost,
        custoNovo: newCost,
        valorAnterior: previousTotal,
        valorFinal: newTotal,
        diferente: isDifferent,
      };
    })
    .filter((p) => !!p.diferente);
  if (mescled.length == 0)
    return (
      <h1 className='flex w-full grow items-center justify-start py-2 text-center text-xs font-medium italic tracking-tight text-primary/50'>
        Não foi possível identificar alterações nos items da precificação.
      </h1>
    );
  return mescled.map((record, index) => (
    <div key={index} className='flex flex-col rounded-md border border-primary/50'>
      <h1 className='w-full rounded-tl-md rounded-tr-md bg-primary/50 py-1 text-center text-xs tracking-tight text-white'>{record.descricao}</h1>
      <div className='flex w-full items-center gap-2 p-2'>
        <div className='flex flex-col items-center'>
          <h1 className='text-xxs text-cyan-500'>CUSTO</h1>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <MdArrowCircleDown color='rgb(254,173,65)' size={20} />
              <p className='text-[0.55rem] font-medium text-primary/50'>{formatToMoney(record.custoAnterior || 0)}</p>
            </div>
            <div className='flex items-center gap-1'>
              <MdArrowCircleUp color='rgb(34,197,94)' size={20} />
              <p className='text-[0.55rem] font-medium text-primary/50'>{formatToMoney(record.custoNovo || 0)}</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <h1 className='text-xxs text-cyan-500'>TOTAL</h1>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <MdArrowCircleDown color='rgb(254,173,65)' size={20} />
              <p className='text-[0.55rem] font-medium text-primary/50'>{formatToMoney(record.valorAnterior || 0)}</p>
            </div>
            <div className='flex items-center gap-1'>
              <MdArrowCircleUp color='rgb(34,197,94)' size={20} />
              <p className='text-[0.55rem] font-medium text-primary/50'>{formatToMoney(record.valorFinal || 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
}

type ProposalUpdateRecordProps = {
  record: TProposalUpdateRecordDTO;
};
function ProposalUpdateRecord({ record }: ProposalUpdateRecordProps) {
  const differentPricingItems = record.novo.precificacao?.filter((newPricingItem) => {
    const previousItem = record.anterior.precificacao?.find((previousPricingItem) => previousPricingItem.descricao == newPricingItem.descricao);
    const previousCost = previousItem?.custoFinal || 0;
    const previousTotal = previousItem?.valorFinal || 0;
    const newCost = newPricingItem.custoFinal;
    const newTotal = newPricingItem.valorFinal;
    return previousCost != newCost || previousTotal != newTotal;
  });

  return (
    <div className='flex w-full flex-col gap-1 rounded-md border border-primary/30 p-3'>
      <h1 className='text-sm font-black leading-none tracking-tight'>ALTERAÇÃO</h1>
      <div className='my-2 flex flex-col gap-1'>
        <h1 className='text-xs font-medium leading-none tracking-tight text-cyan-500'>VALOR FINAL</h1>
        <div className='flex w-full items-center justify-start gap-2'>
          <div className='flex items-center gap-2'>
            <MdArrowCircleDown color='rgb(254,173,65)' size={20} />
            <p className='text-sm font-medium text-primary/50'>{formatToMoney(record.anterior.valor || 0)}</p>
          </div>
          <div className='flex items-center gap-2'>
            <MdArrowCircleUp color='rgb(34,197,94)' size={20} />
            <p className='text-sm font-medium text-primary/50'>{formatToMoney(record.novo.valor || 0)}</p>
          </div>
        </div>
      </div>
      <div className='my-2 flex flex-col gap-1'>
        <h1 className='text-xs font-medium leading-none tracking-tight text-cyan-500'>PRECIFICAÇÃO</h1>
        <div className='flex w-full flex-wrap items-start gap-2'>
          {renderPricingChanges({ previousPricing: record.anterior.precificacao || [], newPricing: record.novo.precificacao || [] })}
        </div>
      </div>
      <div className='flex w-full items-center gap-2'>
        <div className='flex items-center gap-2'>
          <BsCalendarPlus />
          <p className='text-[0.6rem] font-medium text-primary/50'>{formatDateAsLocale(record.dataInsercao, true)}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Avatar fallback={'R'} url={record.autor.avatar_url || undefined} height={20} width={20} />
          <p className='text-[0.6rem] font-medium text-primary/50'>{record.autor.nome}</p>
        </div>
      </div>
    </div>
  );
}

export default ProposalUpdateRecord;
