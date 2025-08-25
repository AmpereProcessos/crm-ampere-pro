import CheckboxInput from '@/components/Inputs/CheckboxInput';
import NumberInput from '@/components/Inputs/NumberInput';
import TextInput from '@/components/Inputs/TextInput';
import { getInverterQty, getModulesQty } from '@/lib/methods/extracting';
import { cumulativeVariablesValues, formatFormulaItem, operators, variablesAlias } from '@/utils/pricing/helpers';
import { getCalculatedFinalValue, getProfitMargin, handlePartialPricingReCalculation, TPricingVariableData } from '@/utils/pricing/methods';
import { TPricingItem, TProposal } from '@/utils/schemas/proposal.schema';
import React, { useState } from 'react';
import { FiDelete } from 'react-icons/fi';
import { VscChromeClose } from 'react-icons/vsc';

type AddPricingItemProps = {
  pricing: TPricingItem[];
  setPricing: React.Dispatch<React.SetStateAction<TPricingItem[]>>;
  proposal: TProposal;
  closeModal: () => void;
};
function AddPricingItem({ pricing, setPricing, proposal, closeModal }: AddPricingItemProps) {
  const [type, setType] = useState<'DEFINED COST' | 'CALCULATE COST'>('DEFINED COST');
  const [itemHolder, setItemHolder] = useState<TPricingItem>({
    descricao: '',
    custoCalculado: 0,
    custoFinal: 0,
    faturavel: false,
    formulaArr: null,
    margemLucro: 0,
    valorCalculado: 0,
    valorFinal: 0,
  });
  const [numberHolder, setNumberHolder] = useState(0);
  function addToUnitPricingItems(x: string) {
    const currentList = [...(itemHolder.formulaArr || [])];
    currentList.push(x);
    setItemHolder((prev) => ({ ...prev, formulaArr: currentList }));
    return;
  }
  function dropUnitPricingItem() {
    const currentList = [...(itemHolder.formulaArr || [])];
    currentList.pop();
    setItemHolder((prev) => ({ ...prev, formulaArr: currentList }));
    return;
  }
  function addNewPriceItem(item: TPricingItem) {
    const pricingItems = [...pricing];
    pricingItems.push({ ...item, descricao: item.descricao.toUpperCase() });
    const moduleQty = getModulesQty(proposal.produtos);
    const inverterQty = getInverterQty(proposal.produtos);
    const kitPrice = proposal.kits.reduce((acc, current) => acc + (current.preco || 0), 0);
    const productPrice = proposal.produtos.reduce((acc, current) => acc + (current.valor || 0), 0);
    const servicePrice = proposal.servicos.reduce((acc, current) => acc + (current.valor || 0), 0);
    const variableData: TPricingVariableData = {
      kit: kitPrice,
      numModulos: moduleQty,
      product: productPrice,
      service: servicePrice,
      potenciaPico: proposal.potenciaPico || 0,
      distancia: proposal.premissas.distancia || 0,
      plan: 0,
      numInversores: inverterQty,
      valorReferencia: proposal.premissas.valorReferencia || 0,
      consumoEnergiaMensal: proposal.premissas.consumoEnergiaMensal || 0,
      tarifaEnergia: proposal.premissas.tarifaEnergia || 0,
      custosInstalacao: proposal.premissas.custosInstalacao || 0,
      custosPadraoEnergia: proposal.premissas.custosPadraoEnergia || 0,
      custosEstruturaInstalacao: proposal.premissas.custosEstruturaInstalacao || 0,
      custosOutros: proposal.premissas.custosOutros || 0,
    };
    const calculableItemsIndexes = pricing
      .map((item, index) => {
        if (!item.formulaArr) return null;
        const includesCumulativeVariable = item.formulaArr.some((f) => {
          const variable = f.replace('[', '').replace(']', '');
          return cumulativeVariablesValues.includes(variable);
        });
        if (!includesCumulativeVariable) return null;
        return index;
      })
      .filter((p) => p != null);
    calculableItemsIndexes.push(pricingItems.length - 1);
    const newPricing = handlePartialPricingReCalculation({
      variableData,
      calculableItemsIndexes,
      pricingItems: pricingItems,
      keepFinalValues: false,
    });
    setPricing(newPricing);
    closeModal();
  }
  return (
    <div id='edit-pricing-item' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px]  lg:w-[60%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>ADIÇÃO DE PREÇO</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <div className='w-full'>
              <TextInput
                label='DESCRIÇÃO DO ITEM DE PREÇO'
                placeholder='Preencha aqui o nome/descrição do custo.'
                value={itemHolder.descricao}
                handleChange={(value) => setItemHolder((prev) => ({ ...prev, descricao: value }))}
                width='100%'
              />
            </div>
            <div className='flex w-full flex-col gap-1'>
              <h1 className='w-full text-center text-[0.65rem] font-bold leading-none tracking-tight text-primary/50 lg:text-xs'>TIPO DE CUSTO</h1>
              <div className='flex w-full items-center justify-center gap-4'>
                <button
                  onClick={() => {
                    setItemHolder((prev) => ({ ...prev, formulaArr: null }));
                    setType('DEFINED COST');
                  }}
                  className={`rounded-lg ${type == 'DEFINED COST' ? 'bg-blue-500 text-white' : 'bg-transparent text-blue-500'} border border-blue-500 px-2 py-1 text-xs font-bold`}
                >
                  CUSTO DEFINIDO
                </button>
                <button
                  onClick={() => {
                    setItemHolder((prev) => ({ ...prev, custoFinal: 0, custoCalculado: 0, valorCalculado: 0, valorFinal: 0 }));
                    setType('CALCULATE COST');
                  }}
                  className={`rounded-lg ${type == 'CALCULATE COST' ? 'bg-cyan-500 text-white' : 'bg-transparent text-cyan-500'} border border-cyan-500 px-2 py-1 text-xs font-bold`}
                >
                  CUSTO CALCULADO
                </button>
              </div>
            </div>
            {type == 'DEFINED COST' ? (
              <div className='w-full'>
                <NumberInput
                  label='CUSTO'
                  placeholder='Preencha aqui o custo do item de preço.'
                  value={itemHolder.custoFinal}
                  handleChange={(value) => {
                    const newSalePrice = getCalculatedFinalValue({ value: value, margin: itemHolder.margemLucro / 100 });
                    setItemHolder((prev) => ({
                      ...prev,
                      custoFinal: value,
                      custoCalculado: value,
                      valorFinal: newSalePrice,
                      valorCalculado: newSalePrice,
                    }));
                  }}
                  width='100%'
                />
              </div>
            ) : (
              <div className='flex w-full flex-col'>
                <h1 className='mt-4 w-full text-center font-Inter text-sm font-black leading-none tracking-tight'>CONSTRUÇÃO DO CÁLCULO DE CUSTO</h1>
                <h1 className='my-2 w-full text-start text-sm font-black text-[#FF9B50]'>VALORES</h1>
                <div className='flex w-full items-end gap-2'>
                  <div className='grow'>
                    <NumberInput
                      label='NÚMERO'
                      labelClassName='font-semibold leading-none tracking-tight text-xs'
                      placeholder='Preencha um valor para adição a fórmula...'
                      value={numberHolder}
                      handleChange={(value) => setNumberHolder(Number(value))}
                      width='100%'
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (numberHolder) addToUnitPricingItems(numberHolder?.toString());
                    }}
                    className='min-h-[46px] rounded-md bg-green-500 p-2 text-sm text-white hover:bg-green-600'
                  >
                    ADD
                  </button>
                </div>
                <h1 className='mt-2 w-full text-start text-sm font-black text-[#FF9B50]'>VARIÁVEIS</h1>
                <h1 className='mt-2 w-full text-start text-xs font-black text-blue-500'>GERAIS</h1>
                <div className='my-2 flex flex-wrap items-center gap-2'>
                  {variablesAlias
                    .filter((v) => v.type == 'general')
                    .map((va, index) => (
                      <button
                        key={index}
                        onClick={() => addToUnitPricingItems(`[${va.value}]`)}
                        className='grow rounded-sm border border-primary/70 p-1 text-xs font-medium text-primary/70 duration-300 ease-in-out hover:bg-primary/70 hover:text-white'
                      >
                        {va.label}
                      </button>
                    ))}
                </div>
                <h1 className='mt-2 w-full text-start text-xs font-black text-blue-500'>ACUMULATIVAS</h1>
                <div className='my-2 flex flex-wrap items-center gap-2'>
                  {variablesAlias
                    .filter((v) => v.type == 'cumulative')
                    .map((va, index) => (
                      <button
                        key={index}
                        onClick={() => addToUnitPricingItems(`[${va.value}]`)}
                        className='grow rounded-sm border border-primary/70 p-1 text-xs font-medium text-primary/70 duration-300 ease-in-out hover:bg-primary/70 hover:text-white'
                      >
                        {va.label}
                      </button>
                    ))}
                </div>
                <h1 className='mt-2 w-full text-start text-xs font-black text-blue-500'>ESTIMADO EM ANÁLISE TÉCNICA</h1>
                <div className='my-2 flex flex-wrap items-center gap-2'>
                  {variablesAlias
                    .filter((v) => v.type == 'technical-analysis')
                    .map((va, index) => (
                      <button
                        key={index}
                        onClick={() => addToUnitPricingItems(`[${va.value}]`)}
                        className='grow rounded-sm border border-primary/70 p-1 text-xs font-medium text-primary/70 duration-300 ease-in-out hover:bg-primary/70 hover:text-white'
                      >
                        {va.label}
                      </button>
                    ))}
                </div>
                <h1 className='my-2 w-full text-start text-sm font-black text-[#FF9B50]'>OPERAÇÕES</h1>
                <div className='flex w-full flex-wrap items-center justify-around gap-2'>
                  {operators.map((op, index) => (
                    <button
                      key={index}
                      onClick={() => addToUnitPricingItems(op)}
                      className='grow rounded-sm border border-primary/30 bg-primary/10 p-2 text-center font-medium text-primary/70 duration-300 ease-in-out hover:scale-105 hover:bg-primary/30'
                    >
                      {op}
                    </button>
                  ))}
                  <button
                    onClick={() => dropUnitPricingItem()}
                    className='flex grow items-center justify-center rounded-sm border border-red-300 bg-red-100 p-2 text-center font-medium duration-300 ease-in-out hover:scale-105 hover:bg-red-200'
                  >
                    <FiDelete size={23} />
                  </button>
                </div>
                <h1 className='my-2 w-full text-start text-sm font-black text-[#FF9B50]'>FÓRMULA</h1>
                <div className='my-2 flex w-full flex-col items-center gap-2 lg:flex-row'>
                  <p className='w-[50px] p-1 text-center text-xl font-black'>=</p>
                  <div className='flex min-h-[52px] w-full items-center justify-center gap-1 rounded-md border border-blue-800 p-3'>
                    {itemHolder.formulaArr?.map((y, index) => (
                      <p key={index} className={`text-xs ${y.includes('[') ? 'rounded-sm bg-primary/70  p-1 text-white' : ''}`}>
                        {formatFormulaItem(y)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className='w-full'>
              <NumberInput
                label='MARGEM DE LUCRO'
                placeholder='Preencha a margem de lucro aplicável a esse item. (Ex: 12 para 12%).'
                value={itemHolder.margemLucro}
                handleChange={(value) => {
                  {
                    const newSalePrice = getCalculatedFinalValue({ value: itemHolder.custoFinal, margin: value / 100 });
                    setItemHolder((prev) => ({ ...prev, margemLucro: value, valorCalculado: newSalePrice, valorFinal: newSalePrice }));
                  }
                }}
                width='100%'
              />
            </div>
            <div className='w-fit self-center'>
              <CheckboxInput
                labelTrue='FATURÁVEL'
                labelFalse='FATURÁVEL'
                checked={itemHolder.faturavel}
                handleChange={(value) => setItemHolder((prev) => ({ ...prev, faturavel: value }))}
                justify='justify-center'
              />
            </div>
            {type == 'DEFINED COST' ? (
              <div className='w-full self-center'>
                <NumberInput
                  label='PREÇO DE VENDA'
                  value={itemHolder.valorFinal}
                  placeholder='Preencha o valor de venda final...'
                  handleChange={(value) => {
                    const newMargin = getProfitMargin(itemHolder.custoFinal, value);
                    setItemHolder((prev) => ({ ...prev, margemLucro: newMargin * 100, valorFinal: value }));
                  }}
                  width='100%'
                />
              </div>
            ) : null}
          </div>
          <div className='flex w-full items-center justify-end py-2'>
            <button
              onClick={() => addNewPriceItem(itemHolder)}
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

export default AddPricingItem;
