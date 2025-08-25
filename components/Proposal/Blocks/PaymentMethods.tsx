import { TProposal } from '@/utils/schemas/proposal.schema';
import React from 'react';
import PaymentMethodCard from './PaymentMethodCard';

type PaymentMethodsProps = {
  infoHolder: TProposal;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
};
function PaymentMethods({ infoHolder, setInfoHolder }: PaymentMethodsProps) {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='w-full rounded-sm bg-[#fead41] p-2 text-center font-bold leading-none tracking-tighter'>MÉTODOS DE PAGAMENTO</h1>
      <div className='flex w-full flex-col gap-1'>
        {infoHolder.pagamento.metodos.length > 0 ? (
          infoHolder.pagamento.metodos.map((method) => (
            <PaymentMethodCard
              key={method.id}
              // @ts-ignore
              method={method}
              proposalValue={infoHolder.valor}
              selectMethod={() => console.log()}
              selectedMethods={[]}
              updateSelectedMethods={(methods) => setInfoHolder((prev) => ({ ...prev, pagamento: { ...prev.pagamento, metodos: methods } }))}
              isSelectable={false}
              fractionnementWidth='300px'
            />
          ))
        ) : (
          <p className='w-full text-center text-sm italic text-primary/70'>Nenhum método de pagamento vinculado à proposta...</p>
        )}
      </div>
    </div>
  );
}

export default PaymentMethods;
