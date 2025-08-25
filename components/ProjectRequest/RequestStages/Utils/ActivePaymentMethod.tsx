import { formatToMoney } from '@/lib/methods/formatting';
import { getFractionnementValue, getPaymentMethodFinalValue } from '@/utils/payment';
import { TProposalPaymentMethodItem } from '@/utils/schemas/proposal.schema';
import { BsCircleHalf } from 'react-icons/bs';
import { FaPercentage } from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';

type ActivePaymentMethodProps = {
  saleValue: number;
  method: TProposalPaymentMethodItem;
};
function ActivePaymentMethod({ method, saleValue }: ActivePaymentMethodProps) {
  return (
    <div className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
      <div className='flex grow items-center justify-between gap-2'>
        <div className='flex items-center gap-1'>
          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
            <MdPayment size={13} />
          </div>
          <p className='text-sm font-medium leading-none tracking-tight'>{method.nome}</p>
        </div>
      </div>

      <h1 className='"w-full mt-2 text-start text-xs font-medium'>FRACIONAMENTO</h1>
      <div className='flex w-full flex-wrap items-center justify-start gap-2'>
        {method.fracionamento.map((fractionnement, itemIndex) => (
          <div key={itemIndex} className={`flex w-[450px] flex-col rounded-md border border-primary/50 p-2  shadow-md`}>
            <div className='flex w-full items-center justify-between gap-2'>
              <h1 className='text-xs font-black leading-none tracking-tight lg:text-sm'>FRAÇÃO DE {fractionnement.porcentagem}%</h1>
              <h1 className='rounded-full bg-primary/80 px-2 py-1 text-[0.65rem] font-medium text-primary-foreground lg:text-xs'>
                {formatToMoney(getFractionnementValue({ fractionnement, proposalValue: saleValue }))}
              </h1>
            </div>
            <div className='mt-2 flex w-full flex-wrap items-center justify-between'>
              <div className='flex items-center gap-2'>
                <MdPayment color={'#76c893'} />
                <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>{fractionnement.metodo}</p>
              </div>
              <div className='flex items-center gap-2'>
                <BsCircleHalf color='#ed174c' />
                <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                  {fractionnement.parcelas} {fractionnement.parcelas ? (fractionnement.parcelas > 1 ? 'PARCELAS' : 'PARCELA') : null}
                </p>
              </div>
              {fractionnement.taxaJuros ? (
                <div className='flex items-center gap-2'>
                  <FaPercentage />
                  <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                    {fractionnement.taxaJuros} DE JUROS
                  </p>
                </div>
              ) : null}
              {fractionnement.taxaUnica ? (
                <div className='flex items-center gap-2'>
                  <FaPercentage />
                  <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                    {fractionnement.taxaUnica} DE USO
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className='mt-2 flex w-full items-center justify-end'>
        <h1 className='text-sm text-primary/70'>
          VALOR FINAL DE: <strong className='text-primary'>{formatToMoney(getPaymentMethodFinalValue({ method, proposalValue: saleValue }))}</strong>
        </h1>
      </div>
    </div>
  );
}

export default ActivePaymentMethod;
