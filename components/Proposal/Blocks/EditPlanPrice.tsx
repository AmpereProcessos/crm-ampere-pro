import NumberInput from '@/components/Inputs/NumberInput';
import { TProposal } from '@/utils/schemas/proposal.schema';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { VscChromeClose } from 'react-icons/vsc';

type EditPlanPriceProps = {
  infoHolder: TProposal;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
  planIndex: number;
  alterationLimit: number | undefined;
  closeModal: () => void;
};
function EditPlanPrice({ infoHolder, setInfoHolder, planIndex, alterationLimit, closeModal }: EditPlanPriceProps) {
  const initialPrice = infoHolder.planos[planIndex].valor || 0;
  const [priceHolder, setPriceHolder] = useState<number>(initialPrice);
  function handlePriceCorrection(newPrice: number) {
    var plans = [...infoHolder.planos];
    plans[planIndex].valor = newPrice;

    setInfoHolder((prev) => ({ ...prev, planos: plans }));
    toast.success('Preço alterado com sucesso !');
    return closeModal();
  }
  return (
    <div id='defaultModal' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-fit w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px]  lg:w-[25%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>ALTERAÇÃO DE PREÇOS</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <NumberInput
              label='PREÇO FINAL DA PROPOSTA'
              value={priceHolder}
              placeholder='Preencha aqui o valor final da proposta...'
              handleChange={(value) => {
                setPriceHolder(value);
              }}
              width='100%'
            />
          </div>
          <div className='flex w-full items-center justify-end py-2'>
            <button
              onClick={() => handlePriceCorrection(priceHolder)}
              className='rounded bg-primary/90 px-4 py-2 text-xs font-medium text-white shadow-sm disabled:bg-primary/50 disabled:text-white enabled:hover:bg-primary/80 enabled:hover:text-white'
            >
              EFETIVAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPlanPrice;
