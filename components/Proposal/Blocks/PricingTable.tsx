import { formatToMoney, getModulesQty } from '@/utils/methods';
import { TPricingItem, TProposal } from '@/utils/schemas/proposal.schema';
import React, { useState } from 'react';

import CheckboxInput from '@/components/Inputs/CheckboxInput';
import { getInverterQty } from '@/lib/methods/extracting';
import { cumulativeVariablesValues } from '@/utils/pricing/helpers';
import { getPricingTotals, handlePartialPricingReCalculation, TPricingVariableData } from '@/utils/pricing/methods';
import { TOpportunity } from '@/utils/schemas/opportunity.schema';
import toast from 'react-hot-toast';
import EditPriceItem from './EditPriceItem';
import PricingTableEditableItem from './PricingTableEditableItem';

type TEditPriceModal = {
  isOpen: boolean;
  priceItemIndex: null | number;
};
type PricingTableProps = {
  pricing: TPricingItem[];
  setPricing: React.Dispatch<React.SetStateAction<TPricingItem[]>>;
  proposal: TProposal;
  opportunity: TOpportunity;
  userHasPricingViewPermission: boolean;
  userHasPricingEditPermission: boolean;
};
function PricingTable({ pricing, setPricing, proposal, opportunity, userHasPricingViewPermission, userHasPricingEditPermission }: PricingTableProps) {
  const [editPriceModal, setEditPriceModal] = useState<TEditPriceModal>({ isOpen: false, priceItemIndex: null });
  const [showOnlyNonZero, setShowOnlyNonZero] = useState<boolean>(true);

  function handleRecalculateCumulatives({ pricing, keepFinalValues }: { pricing: TPricingItem[]; keepFinalValues: boolean }) {
    const moduleQty = getModulesQty(proposal.produtos);
    const inverterQty = getInverterQty(proposal.produtos);
    const kitPrice = proposal.kits.reduce((acc, current) => acc + (current.preco || 0), 0);
    const productPrice = proposal.produtos.reduce((acc, current) => acc + (current.valor || 0), 0);
    const servicePrice = proposal.servicos.reduce((acc, current) => acc + (current.valor || 0), 0);
    const planPrice = proposal.planos.reduce((acc, current) => acc + (current.preco || 0), 0);
    const variableData: TPricingVariableData = {
      kit: kitPrice,
      numModulos: moduleQty,
      product: productPrice,
      service: servicePrice,
      potenciaPico: proposal.potenciaPico || 0,
      distancia: proposal.premissas.distancia || 0,
      plan: planPrice,
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
    if (calculableItemsIndexes.length == 0) return toast.error('Oops, não foi possível encontrar itens recalculávies na precificação.');
    // console.log(calculableItemsIndexes)
    const newPricing = handlePartialPricingReCalculation({ variableData, calculableItemsIndexes, pricingItems: pricing, keepFinalValues });
    const newTotal = getPricingTotals(newPricing);
    console.log(newPricing, newTotal);
    setPricing(newPricing);
    return toast.success('Preços atualizados.');
  }
  // In case user has pricing view permission
  if (userHasPricingViewPermission)
    return (
      <>
        <div className='my-2 flex w-full flex-col-reverse items-center justify-end gap-4 lg:flex-row'>
          <button
            onClick={() => handleRecalculateCumulatives({ pricing, keepFinalValues: false })}
            className='flex flex-col items-center rounded-sm bg-cyan-600 px-4 py-1'
          >
            <h1 className='text-[0.55rem] font-bold text-white'>RECALCULAR ACUMULÁVEIS</h1>
            <p className='text-[0.45rem] font-light text-white'>GERAL</p>
          </button>
          <button
            onClick={() => handleRecalculateCumulatives({ pricing, keepFinalValues: true })}
            className='flex flex-col items-center rounded-sm bg-cyan-800 px-4 py-1'
          >
            <h1 className='text-[0.55rem] font-bold text-white'>RECALCULAR ACUMULÁVEIS</h1>
            <p className='text-[0.45rem] font-light text-white'>SOMENTE CUSTOS</p>
          </button>
          <div className='w-fit'>
            <CheckboxInput
              checked={showOnlyNonZero}
              handleChange={(value) => setShowOnlyNonZero(value)}
              labelTrue='MOSTRAR SOMENTE PREÇOS NÃO NULOS'
              labelFalse='MOSTRAR SOMENTE PREÇOS NÃO NULOS'
            />
          </div>
        </div>
        {/**WEB STYLES */}
        <div className='hidden w-full grow flex-col gap-1 lg:flex'>
          <div className='flex w-full items-center rounded-sm bg-cyan-500'>
            <div className='flex w-6/12 items-center justify-center p-1'>
              <h1 className='font-bold text-white'>ITEM</h1>
            </div>
            <div className='flex w-2/12 items-center justify-center p-1'>
              <h1 className='font-bold text-white'>CUSTO</h1>
            </div>
            <div className='flex w-2/12 items-center justify-center p-1'>
              <h1 className='font-bold text-white'>LUCRO</h1>
            </div>
            <div className='flex w-2/12 items-center justify-center p-1'>
              <h1 className='font-bold text-white'>VENDA</h1>
            </div>
          </div>
          {pricing.map((pricingItem, index) => (
            <PricingTableEditableItem
              pricingItem={pricingItem}
              showOnlyNonZero={showOnlyNonZero}
              userHasPricingEditPermission={userHasPricingEditPermission}
              editPricingItem={() => setEditPriceModal({ isOpen: true, priceItemIndex: index })}
            />
          ))}
          {/* {pricing.map((priceItem, index) => {
            const { descricao, custoCalculado, faturavel, custoFinal, margemLucro, valorCalculado, valorFinal } = priceItem
            const profitMarginPercentage = margemLucro / 100
            if (showOnlyNonZero && valorFinal == 0) return null
            return (
              <div className="flex w-full flex-col">
                <div className={`flex w-full items-center rounded-sm ${Math.abs(valorFinal - valorCalculado) > 1 ? 'bg-orange-200' : ''}`} key={index}>
                  <div className="flex w-6/12 flex-col items-center justify-center p-1">
                    <h1 className="text-primary/50">{descricao}</h1>
                    <div className="flex w-full items-center justify-center gap-2">
                      <div className="flex items-center gap-1 px-1 py-0.5">
                        <TbPercentage color="rgb(34,197,94)" />
                        <p className="text-[0.55rem] tracking-tight text-primary/50">MARGEM DE {formatDecimalPlaces(margemLucro)}%</p>
                      </div>
                      <div className="flex items-center gap-1 px-1 py-0.5">
                        <MdSignalCellularAlt color={'#fead41'} />
                        <p className="text-[0.55rem] tracking-tight text-primary/50">{faturavel ? 'FATURÁVEL' : 'NÃO FATURÁVEL'}</p>
                      </div>
                      {priceItem.formulaArr ? (
                        <button className="group flex items-center gap-1 rounded-sm px-1 py-0.5 duration-300 hover:bg-cyan-50">
                          <TbMathFunction color={'rgb(6,182,212)'} />
                          <p className="text-[0.55rem] tracking-tight text-primary/50 duration-300 group-hover:text-cyan-500">FÓRMULA</p>
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex w-2/12 items-center justify-center p-1">
                    <h1 className="text-primary/50">{formatToMoney(custoFinal)}</h1>
                  </div>
                  <div className="flex w-2/12 items-center justify-center p-1">
                    <h1 className="text-primary/50">{formatToMoney(valorFinal * profitMarginPercentage)}</h1>
                  </div>
                  <div className="flex w-2/12 items-center justify-center gap-4 p-1">
                    <h1 className="w-full text-center text-primary/50 lg:w-1/2">{formatToMoney(valorFinal)}</h1>
                    {userHasPricingEditPermission ? (
                      <button onClick={() => setEditPriceModal({ isOpen: true, priceItemIndex: index })} className="text-md text-primary/40 hover:text-[#fead61]">
                        <AiFillEdit />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })} */}
          <div className='flex w-full items-center rounded-sm border-t border-primary/30 py-1'>
            <div className='flex w-6/12 items-center justify-center p-1'>
              <h1 className='font-bold text-primary/80'>TOTAIS</h1>
            </div>
            <div className='flex w-2/12 items-center justify-center p-1'>
              <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).cost)}</h1>
            </div>
            <div className='flex w-2/12 items-center justify-center p-1'>
              <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).profit)}</h1>
            </div>
            <div className='flex w-2/12 items-center justify-center p-1'>
              <h1 className='font-medium text-primary/80'>{formatToMoney(getPricingTotals(pricing).total)}</h1>
            </div>
          </div>
        </div>
        {/**MOBILE STYLES */}
        <div className='flex w-full grow flex-col gap-1 lg:hidden'>
          <div className='flex w-full items-center rounded-sm bg-cyan-500'>
            <div className='flex w-full items-center justify-center p-1'>
              <h1 className='font-bold text-white'>PRECIFICAÇÃO</h1>
            </div>
          </div>
          {pricing.map((pricingItem, index) => (
            <PricingTableEditableItem
              pricingItem={pricingItem}
              showOnlyNonZero={showOnlyNonZero}
              userHasPricingEditPermission={userHasPricingEditPermission}
              editPricingItem={() => setEditPriceModal({ isOpen: true, priceItemIndex: index })}
            />
          ))}
          {/* {pricing.map((priceItem, index) => {
            const { descricao, custoCalculado, faturavel, custoFinal, margemLucro, valorCalculado, valorFinal } = priceItem
            const profitMarginPercentage = margemLucro / 100
            return (
              <div className={`flex w-full flex-col rounded-md border border-primary/50 p-2`} key={index}>
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-sm font-black leading-none tracking-tight">{descricao}</h1>
                  {userHasPricingEditPermission ? (
                    <button
                      onClick={() => setEditPriceModal({ isOpen: true, priceItemIndex: index })}
                      className="text-md min-w-fit text-primary/40 hover:text-[#fead61]"
                    >
                      <AiFillEdit />
                    </button>
                  ) : null}
                </div>
                <div className="flex w-full items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TbPercentage color="rgb(34,197,94)" />
                    <p className="text-[0.6rem] tracking-tight text-primary/50">MARGEM DE {formatDecimalPlaces(margemLucro)}%</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdSignalCellularAlt color={'#fead41'} />
                    <p className="text-[0.6rem] tracking-tight text-primary/50">{faturavel ? 'FATURÁVEL' : 'NÃO FATURÁVEL'}</p>
                  </div>
                </div>
                <div className="mt-1 flex w-full items-center justify-around gap-2">
                  <div className="flex flex-col items-center rounded-md border border-primary/50 px-2 py-1">
                    <h1 className="text-[0.48rem] tracking-tight text-primary/50">CUSTO</h1>
                    <h1 className="text-xxs font-medium tracking-tight text-primary/50">{formatToMoney(custoFinal)}</h1>
                  </div>
                  <div className="flex flex-col items-center rounded-md border border-green-500 px-2 py-1">
                    <h1 className="text-[0.48rem] tracking-tight text-green-500">LUCRO</h1>
                    <h1 className="text-xxs font-medium tracking-tight text-green-500">{formatToMoney(profitMarginPercentage * valorFinal)}</h1>
                  </div>
                  <div className="flex flex-col items-center rounded-md border border-blue-500 px-2 py-1">
                    <h1 className="text-[0.48rem] tracking-tight text-blue-500">VALOR FINAL</h1>
                    <h1 className="text-xxs font-medium tracking-tight text-blue-500">{formatToMoney(valorFinal)}</h1>
                  </div>
                </div>
              </div>
            )
          })} */}
          <div className='flex w-full items-center justify-center rounded-sm bg-primary/80 p-1'>
            <h1 className='text-xs font-bold text-white'>TOTAIS</h1>
          </div>
          <div className='flex w-full flex-col items-center gap-2'>
            <div className='flex w-full flex-col rounded-md border border-primary/50 p-2'>
              <h1 className='text-[0.65rem] tracking-tight text-primary/50'>CUSTO</h1>
              <h1 className='w-full text-center text-[0.7rem] font-bold tracking-tight text-primary/50'>
                {formatToMoney(getPricingTotals(pricing).cost)}
              </h1>
            </div>
            <div className='flex w-full flex-col rounded-md border border-green-500 p-2'>
              <h1 className='text-[0.65rem] tracking-tight text-green-500'>LUCRO</h1>
              <h1 className='w-full text-center text-[0.7rem] font-bold tracking-tight text-green-500'>
                {formatToMoney(getPricingTotals(pricing).profit)}
              </h1>
            </div>
            <div className='flex w-full flex-col rounded-md border border-blue-500 p-2'>
              <h1 className='text-[0.65rem] tracking-tight text-blue-500'>VALOR FINAL</h1>
              <h1 className='w-full text-center text-[0.7rem] font-bold tracking-tight text-blue-500'>
                {formatToMoney(getPricingTotals(pricing).total)}
              </h1>
            </div>
          </div>
        </div>
        {editPriceModal.isOpen && typeof editPriceModal.priceItemIndex == 'number' ? (
          <EditPriceItem
            itemIndex={editPriceModal.priceItemIndex}
            pricing={pricing}
            setPricing={setPricing}
            closeModal={() => setEditPriceModal({ isOpen: false, priceItemIndex: null })}
          />
        ) : null}
      </>
    );
  return (
    <div className='flex w-full grow flex-col gap-1'>
      <div className='flex w-full items-center rounded-sm bg-cyan-500'>
        <div className='flex w-full items-center justify-center p-1'>
          <h1 className='font-bold text-white'>ITEM</h1>
        </div>
      </div>
      {pricing.map((priceItem, index) => {
        const { descricao, valorCalculado, valorFinal } = priceItem;
        return (
          <div className={`flex w-full items-center rounded-sm ${Math.abs(valorFinal - valorCalculado) > 1 ? 'bg-orange-200' : ''}`} key={index}>
            <div className='flex w-full items-center justify-center p-1'>
              <h1 className='text-primary/50'>{descricao}</h1>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PricingTable;
