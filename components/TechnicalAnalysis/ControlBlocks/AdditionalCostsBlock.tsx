import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatToMoney } from '@/lib/methods/formatting';
import { STANDARD_PROFIT_MARGIN, STANDARD_TAX } from '@/utils/constants';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { AdditionalCostsCategories, Units } from '@/utils/select-options';
import { FaBox, FaSave } from 'react-icons/fa';
import { ImPriceTag } from 'react-icons/im';
import { IoMdAdd } from 'react-icons/io';
import { MdAttachMoney } from 'react-icons/md';

function getSaleValue(totalCost: number, addTaxes: boolean) {
  const saleValue = addTaxes ? totalCost / (1 - (STANDARD_PROFIT_MARGIN + STANDARD_TAX)) : totalCost / (1 - STANDARD_PROFIT_MARGIN);
  return saleValue;
}

type AdditionalCostsBlockProps = {
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function AdditionalCostsBlock({ infoHolder, setInfoHolder, changes, setChanges }: AdditionalCostsBlockProps) {
  // Costs holder
  const [activeCostIndex, setActiveCostIndex] = useState<number | undefined>(undefined);
  const [costHolder, setCostHolder] = useState<TTechnicalAnalysisDTO['custos'][number]>({
    categoria: 'INSTALAÇÃO',
    descricao: '',
    grandeza: 'UN',
    qtde: 0,
    custoUnitario: null,
  });
  function addCost() {
    if (!costHolder.categoria) {
      toast.error('Preencha uma categoria de custo.');
      return;
    }
    if (costHolder.descricao.trim().length < 3) {
      toast.error('Preencha um nome/descrição válida ao custo.');
      return;
    }
    if (!costHolder.grandeza) {
      toast.error('Preencha a grandeza do custo.');
      return;
    }
    if (costHolder.qtde <= 0) {
      toast.error('Preencha uma quantidade válida para o item de custo.');
      return;
    }
    if (!costHolder.custoUnitario || costHolder.custoUnitario <= 0) {
      toast.error('Preencha o custo unitário do item de custo.');
      return;
    }
    const costsList = infoHolder.custos ? [...infoHolder.custos] : [];
    const newCost = {
      categoria: costHolder.categoria,
      descricao: costHolder.descricao,
      grandeza: costHolder.grandeza,
      qtde: costHolder.qtde,
      custoUnitario: costHolder.custoUnitario,
      total: costHolder.qtde * costHolder.custoUnitario,
      totalVendaSimples: costHolder.totalVendaSimples
        ? costHolder.totalVendaSimples
        : getSaleValue(costHolder.qtde * costHolder.custoUnitario, false),
      totalVendaFaturavel: costHolder.totalVendaFaturavel
        ? costHolder.totalVendaFaturavel
        : getSaleValue(costHolder.qtde * costHolder.custoUnitario, true),
    };
    costsList.push(newCost);
    setInfoHolder((prev) => ({ ...prev, custos: costsList }));
    setChanges((prev) => ({ ...prev, custos: costsList }));
    setCostHolder({
      categoria: 'INSTALAÇÃO',
      descricao: '',
      grandeza: 'UN',
      qtde: 0,
      custoUnitario: null,
    });
    toast.success('Item adicionado aos custos com sucesso !');
  }
  function removeCost(index: number) {
    const costsList = [...infoHolder.custos];
    costsList.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, custos: costsList }));
    setChanges((prev) => ({ ...prev, custos: costsList }));

    toast.success('Custo removido!');
  }
  function saveChanges({ index }: { index: number }) {
    if (!costHolder.custoUnitario || costHolder.custoUnitario <= 0) {
      toast.error('Preencha o custo unitário do item de custo.');
      return;
    }
    const costsList = [...infoHolder.custos];
    const cost = {
      //
      categoria: costHolder.categoria,
      descricao: costHolder.descricao,
      grandeza: costHolder.grandeza,
      qtde: costHolder.qtde,
      custoUnitario: costHolder.custoUnitario,
      total: costHolder.qtde * (costHolder.custoUnitario || 0),
      totalVendaSimples: costHolder.totalVendaSimples
        ? costHolder.totalVendaSimples
        : getSaleValue(costHolder.qtde * costHolder.custoUnitario, false),
      totalVendaFaturavel: costHolder.totalVendaFaturavel
        ? costHolder.totalVendaFaturavel
        : getSaleValue(costHolder.qtde * costHolder.custoUnitario, true),
    };
    costsList[index] = cost;
    setInfoHolder((prev) => ({ ...prev, custos: costsList }));
    setChanges((prev) => ({ ...prev, custos: costsList }));
    setCostHolder({
      categoria: 'INSTALAÇÃO',
      descricao: '',
      grandeza: 'UN',
      qtde: 0,
      custoUnitario: null,
    });
    toast.success('Custo atualizado!');
    setActiveCostIndex(undefined);
  }
  return (
    <div className='flex w-full flex-col'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-white'>CUSTOS ADICIONAIS</h1>
      </div>
      <div className='mt-2 flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label={'CATEGORIA DO CUSTO'}
              resetOptionLabel={'NÃO DEFINIDO'}
              options={AdditionalCostsCategories}
              value={costHolder.categoria}
              handleChange={(value) => setCostHolder((prev) => ({ ...prev, categoria: value }))}
              onReset={() => setCostHolder((prev) => ({ ...prev, categoria: 'INSTALAÇÃO' }))}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label={'DESCRIÇÃO DO CUSTO'}
              placeholder={'Preencha o nome ou descreva o custo...'}
              value={costHolder.descricao}
              handleChange={(value) => setCostHolder((prev) => ({ ...prev, descricao: value }))}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label={'GRANDEZA DO CUSTO'}
              resetOptionLabel={'NÃO DEFINIDO'}
              options={Units}
              value={costHolder.grandeza}
              handleChange={(value) => setCostHolder((prev) => ({ ...prev, grandeza: value }))}
              onReset={() => setCostHolder((prev) => ({ ...prev, grandeza: 'UN' }))}
              width={'100%'}
            />
          </div>
        </div>
        <div className='mt-2 flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/5'>
            <NumberInput
              label={'QUANTIDADE'}
              placeholder={'Preencha a quantidade o item de custo...'}
              value={costHolder.qtde}
              handleChange={(value) =>
                setCostHolder((prev) => ({
                  ...prev,
                  qtde: value,
                  totalVendaSimples: getSaleValue(value * (prev.custoUnitario || 0), false),
                  totalVendaFaturavel: getSaleValue(value * (prev.custoUnitario || 0), true),
                }))
              }
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/5'>
            <NumberInput
              label={'PREÇO UNITÁRIO'}
              placeholder={'Preencha a preço unitário do item de custo...'}
              value={costHolder.custoUnitario || null}
              handleChange={(value) =>
                setCostHolder((prev) => ({
                  ...prev,
                  custoUnitario: value,
                  totalVendaSimples: getSaleValue(prev.qtde * value, false),
                  totalVendaFaturavel: getSaleValue(prev.qtde * value, true),
                }))
              }
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/5'>
            <NumberInput
              label={'TOTAL'}
              editable={false}
              placeholder={'Valor total do item de custo...'}
              value={costHolder.qtde && costHolder.custoUnitario ? costHolder.qtde * costHolder.custoUnitario : null}
              handleChange={(value) => console.log('NO')}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/5'>
            <NumberInput
              label={'TOTAL VENDA SIMPLES'}
              editable={true}
              placeholder={'Valor total do item de custo...'}
              value={costHolder.totalVendaSimples || 0}
              handleChange={(value) => setCostHolder((prev) => ({ ...prev, totalVendaSimples: value }))}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/5'>
            <NumberInput
              label={'TOTAL VENDA FATURÁVEL'}
              editable={true}
              placeholder={'Valor total do item de custo...'}
              value={costHolder.totalVendaFaturavel || 0}
              handleChange={(value) => setCostHolder((prev) => ({ ...prev, totalVendaFaturavel: value }))}
              width={'100%'}
            />
          </div>
        </div>
        <div className='mt-4 flex w-full items-center justify-end'>
          {!!activeCostIndex && activeCostIndex >= 0 ? (
            <button
              onClick={() => saveChanges({ index: activeCostIndex })}
              className='flex w-fit items-center gap-2 rounded-sm border border-blue-500 p-1 text-blue-500 duration-300 ease-in-out hover:bg-blue-500 hover:text-white'
            >
              <p className='font-bold'>SALVAR</p>
              <FaSave />
            </button>
          ) : (
            <button
              onClick={() => addCost()}
              className='flex w-fit items-center gap-2 rounded-sm border border-green-500 p-1 text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-white'
            >
              <p className='font-bold'>ADICIONAR ITEM</p>
              <IoMdAdd />
            </button>
          )}
        </div>
        {infoHolder.custos?.length > 0 ? (
          <div className='mt-2 flex w-full flex-col gap-2'>
            {infoHolder.custos.map((cost, index) => (
              <div key={index} className='flex w-full flex-col rounded-md border border-primary/30 p-3'>
                <div className='flex w-full justify-between'>
                  <h1 className='text-start font-bold leading-none tracking-tight'>{cost.categoria}</h1>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => {
                        const holder = {
                          categoria: cost.categoria,
                          descricao: cost.descricao,
                          grandeza: cost.grandeza,
                          qtde: cost.qtde,
                          custoUnitario: cost.custoUnitario,
                        };
                        setActiveCostIndex(index);
                        setCostHolder(holder);
                      }}
                      className='text-red-400 duration-300 ease-in-out hover:text-red-500'
                    >
                      <AiFillEdit />
                    </button>
                    <button onClick={() => removeCost(index)} className='text-red-400 duration-300 ease-in-out hover:text-red-500'>
                      <AiFillDelete />
                    </button>
                  </div>
                </div>
                <p className='text-sm text-primary/50'>{cost.descricao}</p>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <FaBox color='#fead41' />
                      <p className='text-sm font-medium text-primary/50'>
                        {cost.qtde} {cost.grandeza}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-green-500'>
                      <MdAttachMoney color='rgb(34,197,94)' />
                      <p className='text-sm font-medium text-primary/50'>
                        {cost.custoUnitario ? formatToMoney(cost.custoUnitario) : 'R$ 0,00'} / {cost.grandeza}
                      </p>
                    </div>
                    {cost.totalVendaSimples ? (
                      <div className='flex items-center gap-2 text-green-500'>
                        <ImPriceTag color='rgb(34,197,94)' />
                        <p className='text-sm font-medium text-primary/50'>VENDA SIMPLES: {formatToMoney(cost.totalVendaSimples)}</p>
                      </div>
                    ) : null}
                    {cost.totalVendaFaturavel ? (
                      <div className='flex items-center gap-2 text-green-500'>
                        <ImPriceTag color='rgb(34,197,94)' />
                        <p className='text-sm font-medium text-primary/50'>VENDA FATURÁVEL: {formatToMoney(cost.totalVendaFaturavel)}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className='flex items-center gap-2'>
                    {/* <MdAttachMoney /> */}
                    <p className='text-lg font-black'>{formatToMoney(cost.total || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AdditionalCostsBlock;
