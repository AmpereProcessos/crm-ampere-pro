import { PricesObj, PricesOeMObj, PricesPromoObj, getMarginValue, getProposaldPrice } from '@/utils/pricing/methods';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { VscChromeClose } from 'react-icons/vsc';
import NumberInput from '../Inputs/NumberInput';
import SelectInput from '../Inputs/SelectInput';
type NewCostProps = {
  closeModal: () => void;
  pricing: PricesObj | PricesOeMObj | PricesPromoObj;
  setPricing: React.Dispatch<React.SetStateAction<PricesObj | PricesPromoObj>>;
};
function NewCost({ closeModal, pricing, setPricing }: NewCostProps) {
  const [newCostInfo, setNewCostInfo] = useState({
    cost: 0,
    tax: 0.17,
    margin: 0.12,
    sellingValue: 0,
    type: undefined,
  });
  function handleAddCost() {
    if (newCostInfo.cost <= 0) {
      toast.error('Por favor, preencha um valor válido para o custo.');
      return;
    }
    if (newCostInfo.tax < 0) {
      toast.error('Por favor, preencha um valor válido para a taxa de imposto.');
      return;
    }
    if (newCostInfo.sellingValue <= 0) {
      toast.error('Por favor, preencha um valor de venda válido.');
      return;
    }
    if (!newCostInfo.type) {
      toast.error('Por favor, selecione o tipo do novo custo.');
      return;
    }
    const currentPricingCopy = { ...pricing };

    const proposaldPrice = getProposaldPrice(newCostInfo.cost, newCostInfo.tax, newCostInfo.margin);
    // @ts-ignore
    currentPricingCopy[newCostInfo.type] = {
      margemLucro: newCostInfo.margin,
      imposto: newCostInfo.tax,
      custo: newCostInfo.cost,
      vendaProposto: proposaldPrice,
      vendaFinal: newCostInfo.sellingValue,
    };
    // @ts-ignore
    setPricing(currentPricingCopy);

    toast.success('Novo custo adicionado!');
    setNewCostInfo({
      cost: 0,
      tax: 0.17,
      margin: 0.12,
      sellingValue: 0,
      type: undefined,
    });
  }
  return (
    <div id='newCost' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-fit w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px]  lg:w-[30%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>NOVO CUSTO</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <div className='w-full self-center lg:w-[50%]'>
              <SelectInput
                label='TIPO DE CUSTOS'
                value={newCostInfo.type}
                resetOptionLabel='NÃO DEFINIDO'
                options={[
                  { id: 1, label: 'PADRÃO', value: 'padrao' },
                  { id: 2, label: 'ESTRUTURA', value: 'estrutura' },
                  { id: 3, label: 'OUTROS', value: 'extra' },
                ]}
                handleChange={(value) => setNewCostInfo((prev) => ({ ...prev, type: value }))}
                onReset={() => setNewCostInfo((prev) => ({ ...prev, type: undefined }))}
                width='100%'
              />
            </div>
            <div className='w-full self-center lg:w-[50%]'>
              <NumberInput
                label='CUSTO'
                value={newCostInfo.cost}
                placeholder='Valor de custo...'
                handleChange={(value) => {
                  const newSellingPrice = getProposaldPrice(value, newCostInfo.tax, newCostInfo.margin);
                  setNewCostInfo((prev) => ({
                    ...prev,
                    cost: value,
                    sellingValue: newSellingPrice,
                  }));
                }}
                width='100%'
              />
            </div>
            <div className='w-full self-center lg:w-[50%]'>
              <NumberInput
                label='IMPOSTO'
                value={newCostInfo.tax}
                placeholder='Preencha aqui a alíquota de imposto...'
                handleChange={(value) => {
                  const newSellingPrice = getProposaldPrice(newCostInfo.cost, value, newCostInfo.margin);
                  setNewCostInfo((prev) => ({
                    ...prev,
                    tax: value,
                    sellingValue: newSellingPrice,
                  }));
                }}
                width='100%'
              />
            </div>
            <div className='w-full self-center lg:w-[50%]'>
              <NumberInput
                label='MARGEM DE LUCRO'
                value={newCostInfo.margin}
                placeholder='Preencha aqui a margem de lucro...'
                handleChange={(value) => {
                  const newSellingPrice = getProposaldPrice(newCostInfo.cost, newCostInfo.tax, value);
                  setNewCostInfo((prev) => ({
                    ...prev,
                    margin: value,
                    sellingValue: newSellingPrice,
                  }));
                }}
                width='100%'
              />
            </div>
            <div className='w-full self-center lg:w-[50%]'>
              <NumberInput
                label='PREÇO DE VENDA'
                value={newCostInfo.sellingValue}
                placeholder='Valor de venda final...'
                handleChange={(value) => {
                  const newMargin = getMarginValue(newCostInfo.cost, value, newCostInfo.tax);

                  setNewCostInfo((prev) => ({
                    ...prev,
                    margin: newMargin,
                    sellingValue: value,
                  }));
                }}
                width='100%'
              />
            </div>
          </div>
          <button
            onClick={handleAddCost}
            className='w-fit self-center rounded-sm border border-[#fead41] p-2 font-bold text-[#fead41] duration-300 ease-in-out hover:scale-105 hover:bg-[#fead41] hover:text-primary'
          >
            ADICIONAR CUSTO
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewCost;
