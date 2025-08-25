import { formatToMoney } from '@/lib/methods/formatting';
import { getPricingTotals, getProfitMargin } from '@/utils/pricing/methods';
import { TProposalDTO } from '@/utils/schemas/proposal.schema';
import { TbMathFunction } from 'react-icons/tb';

type ProposalViewPricingBlockProps = {
  userHasPricingViewPermission: boolean;
  pricing: TProposalDTO['precificacao'];
};
function ProposalViewPricingBlock({ userHasPricingViewPermission, pricing }: ProposalViewPricingBlockProps) {
  return (
    <>
      {userHasPricingViewPermission ? (
        <>
          {/**WEB PAGE STYLES */}
          <div className='mt-2 hidden w-full flex-col gap-1 rounded-sm border border-primary/50 shadow-md lg:flex'>
            <div className='flex w-full items-center rounded-sm bg-cyan-500'>
              <div className='flex w-6/12 items-center justify-center p-1'>
                <h1 className='font-bold text-primary-foreground'>ITEM</h1>
              </div>
              <div className='flex w-2/12 items-center justify-center p-1'>
                <h1 className='font-bold text-primary-foreground'>CUSTO</h1>
              </div>
              <div className='flex w-2/12 items-center justify-center p-1'>
                <h1 className='font-bold text-primary-foreground'>LUCRO</h1>
              </div>
              <div className='flex w-2/12 items-center justify-center p-1'>
                <h1 className='font-bold text-primary-foreground'>VENDA</h1>
              </div>
            </div>
            <div className='flex w-full flex-col rounded-md bg-background py-2'>
              {pricing.map((priceItem, index) => {
                const { descricao, custoFinal, custoCalculado, margemLucro, valorCalculado, valorFinal } = priceItem;
                const profitMarginPercentage = margemLucro / 100;
                const calculatedProfitMargin = getProfitMargin(custoCalculado, valorCalculado);
                return (
                  <div
                    className={`flex w-full items-center rounded-sm ${Math.abs(valorFinal - valorCalculado) > 1 ? 'bg-orange-200' : ''}`}
                    key={index}
                  >
                    <div className='flex w-6/12 items-center justify-center p-1'>
                      <h1 className='text-primary/70'>{descricao}</h1>
                    </div>
                    <div className='flex w-2/12 flex-col items-center justify-center p-1'>
                      <h1 className='text-primary/70'>{formatToMoney(custoFinal)}</h1>
                      <div className='flex items-center gap-1'>
                        <TbMathFunction color={'rgb(6,182,212)'} />
                        <h1 className='text-[0.65rem] text-primary/70'>{formatToMoney(custoFinal)}</h1>
                      </div>
                    </div>
                    <div className='flex w-2/12 flex-col items-center justify-center p-1'>
                      <h1 className='text-primary/70'>{formatToMoney(valorFinal * profitMarginPercentage)}</h1>
                      <div className='flex items-center gap-1'>
                        <TbMathFunction color={'rgb(6,182,212)'} />
                        <h1 className='text-[0.65rem] text-primary/70'>{formatToMoney(valorCalculado * calculatedProfitMargin)}</h1>
                      </div>
                    </div>
                    <div className='flex w-2/12 flex-col items-center justify-center p-1'>
                      <h1 className='w-full text-center text-primary/70 lg:w-1/2'>{formatToMoney(valorFinal)}</h1>
                      <div className='flex items-center gap-1'>
                        <TbMathFunction color={'rgb(6,182,212)'} />
                        <h1 className='text-[0.65rem] text-primary/70'>{formatToMoney(valorCalculado)}</h1>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className='flex w-full items-center rounded-sm border-t border-primary/30 py-1'>
                <div className='flex w-6/12 items-center justify-center p-1'>
                  <h1 className='font-bold text-primary/80'>TOTAIS</h1>
                </div>
                <div className='flex w-2/12 flex-col items-center justify-center p-1'>
                  <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).cost)}</h1>
                  <div className='flex items-center gap-1'>
                    <TbMathFunction color={'rgb(6,182,212)'} />
                    <h1 className='text-[0.65rem] text-primary/70'>{formatToMoney(getPricingTotals(pricing).costCalculated)}</h1>
                  </div>
                </div>
                <div className='flex w-2/12 flex-col items-center justify-center p-1'>
                  <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).profit)}</h1>
                  <div className='flex items-center gap-1'>
                    <TbMathFunction color={'rgb(6,182,212)'} />
                    <h1 className='text-[0.65rem] text-primary/70'>{formatToMoney(getPricingTotals(pricing).profitCalculated)}</h1>
                  </div>
                </div>
                <div className='flex w-2/12 flex-col items-center justify-center p-1'>
                  <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).total)}</h1>
                  <div className='flex items-center gap-1'>
                    <TbMathFunction color={'rgb(6,182,212)'} />
                    <h1 className='text-[0.65rem] text-primary/70'>{formatToMoney(getPricingTotals(pricing).totalCalculated)}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/**MOBILE STYLES */}
          <div className='mt-2 flex w-full flex-col gap-1 rounded-sm border border-primary/50 shadow-md lg:hidden'>
            <h1 className='rounded-tl-md rounded-tr-md bg-primary/50 p-2 text-center font-Raleway font-bold text-primary-foreground'>ITENS</h1>
            {pricing.map((priceItem, index) => {
              if (pricing) {
                const { descricao, custoFinal, margemLucro, valorCalculado, valorFinal } = priceItem;
                return (
                  <div className='flex w-full flex-col items-center rounded-sm px-4' key={index}>
                    <div className='flex w-full items-center justify-center p-1'>
                      <h1 className='font-medium text-primary/80'>{descricao}</h1>
                    </div>
                    <div className='grid w-full grid-cols-3  items-center gap-1'>
                      <div className='col-span-1 flex flex-col items-center justify-center p-1'>
                        <h1 className='text-sm font-thin text-primary/70'>CUSTO</h1>
                        <h1 className='text-center text-xs font-bold text-[#15599a]'>{formatToMoney(custoFinal)}</h1>
                      </div>
                      <div className='col-span-1 flex flex-col items-center justify-center p-1'>
                        <h1 className='text-sm font-thin text-primary/70'>LUCRO</h1>
                        <h1 className='text-center text-xs font-bold text-[#15599a]'>{formatToMoney(valorFinal * margemLucro)}</h1>
                      </div>
                      <div className='col-span-1 flex flex-col items-center justify-center p-1'>
                        <h1 className='text-sm font-thin text-primary/70'>VENDA</h1>
                        <h1 className='text-center text-xs font-bold text-[#fead41]'>{formatToMoney(valorFinal)}</h1>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            <h1 className='mt-4 bg-primary/80 p-2 text-center font-Raleway font-bold text-primary-foreground'>TOTAIS</h1>
            <div className='grid w-full grid-cols-3  items-center gap-1 p-2'>
              <div className='col-span-1 flex flex-col items-center justify-center p-1'>
                <h1 className='text-sm font-thin text-primary/70'>CUSTO</h1>
                <h1 className='text-center text-xs font-bold text-[#15599a]'>{formatToMoney(getPricingTotals(pricing).cost)}</h1>
              </div>
              <div className='col-span-1 flex flex-col items-center justify-center p-1'>
                <h1 className='text-sm font-thin text-primary/70'>LUCRO</h1>
                <h1 className='text-center text-xs font-bold text-[#15599a]'>{formatToMoney(getPricingTotals(pricing).profit)}</h1>
              </div>
              <div className='col-span-1 flex flex-col items-center justify-center p-1'>
                <h1 className='text-sm font-thin text-primary/70'>VENDA</h1>
                <h1 className='text-center text-xs font-bold text-[#fead41]'>{formatToMoney(getPricingTotals(pricing).total)}</h1>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='mt-2 flex w-full grow flex-col gap-1'>
          <div className='flex w-full items-center rounded-sm bg-cyan-500'>
            <div className='flex w-full items-center justify-center p-1'>
              <h1 className='font-bold text-primary-foreground'>ITEM</h1>
            </div>
          </div>
          {pricing.map((priceItem, index) => {
            const { descricao, valorCalculado, valorFinal } = priceItem;
            return (
              <div className={`flex w-full items-center rounded-sm ${Math.abs(valorFinal - valorCalculado) > 1 ? 'bg-orange-200' : ''}`} key={index}>
                <div className='flex w-full items-center justify-center p-1'>
                  <h1 className='text-primary/70'>{descricao}</h1>
                </div>
              </div>
            );
          })}
          <div className='flex w-full items-center rounded-sm border-t border-primary/30 py-1'>
            <div className='flex w-8/12 items-center justify-center p-1'>
              <h1 className='font-bold text-primary/80'>TOTAIS</h1>
            </div>
            <div className='flex w-4/12 items-center justify-center p-1'>
              <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).total)}</h1>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProposalViewPricingBlock;
