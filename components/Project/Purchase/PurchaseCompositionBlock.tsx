import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatToMoney } from '@/lib/methods/formatting';
import { renderCategoryIcon, renderUnitLabel } from '@/lib/methods/rendering';
import { TPurchase, TPurchaseCompositionItem } from '@/utils/schemas/purchase.schema';
import { ProductItemCategories, Units } from '@/utils/select-options';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaDollarSign } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { TbRulerMeasure } from 'react-icons/tb';

type PurchaseCompositionBlockProps = {
  infoHolder: TPurchase;
  setInfoHolder: React.Dispatch<React.SetStateAction<TPurchase>>;
};
function PurchaseCompositionBlock({ infoHolder, setInfoHolder }: PurchaseCompositionBlockProps) {
  const [compositionItem, setCompositionItem] = useState<TPurchaseCompositionItem>({
    categoria: 'INSUMO',
    descricao: '',
    qtde: 1,
    unidade: 'UN',
    valor: 0,
  });
  function addItem(item: TPurchaseCompositionItem) {
    const items = [...infoHolder.composicao];
    items.push(item);
    // Calculating new total
    const total = items.reduce((acc, current) => acc + current.qtde * current.valor, 0);
    setInfoHolder((prev) => ({ ...prev, composicao: items, total: total }));
    setCompositionItem({
      categoria: 'INSUMO',
      descricao: '',
      qtde: 1,
      unidade: 'UN',
      valor: 0,
    });
    return toast.success('Item adicionado !', { duration: 1000 });
  }
  function removeItem(index: number) {
    const items = [...infoHolder.composicao];
    items.splice(index, 1);
    // Calculating new total
    const total = items.reduce((acc, current) => acc + current.qtde * current.valor, 0);
    setInfoHolder((prev) => ({ ...prev, composicao: items, total: total }));
    return toast.success('Item removido !', { duration: 1000 });
  }
  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex w-full items-center justify-between gap-2'>
        <h1 className='text-start font-Inter text-xs font-bold leading-none tracking-tight text-primary/50'>COMPOSIÇÃO DA COMPRA</h1>
        <h1 className='rounded border border-green-600 bg-green-50 p-1 text-xs font-medium text-green-600'>
          TOTAL: {formatToMoney(infoHolder.total)}
        </h1>
      </div>
      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-[25%]'>
            <SelectInput
              label='CATEGORIA'
              resetOptionLabel='NÃO DEFINIDO'
              options={ProductItemCategories}
              value={compositionItem.categoria}
              handleChange={(value) =>
                setCompositionItem((prev) => ({
                  ...prev,
                  categoria: value,
                }))
              }
              onReset={() => {
                setCompositionItem((prev) => ({
                  ...prev,
                  categoria: 'INSUMO',
                }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[25%]'>
            <TextInput
              label='DESCRIÇÃO'
              placeholder='Preencha a descrição do item...'
              value={compositionItem.descricao}
              handleChange={(value) => setCompositionItem((prev) => ({ ...prev, descricao: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[15%]'>
            <SelectInput
              label='UNIDADE'
              resetOptionLabel='NÃO DEFINIDO'
              options={Units}
              value={compositionItem.unidade}
              handleChange={(value) =>
                setCompositionItem((prev) => ({
                  ...prev,
                  unidade: value,
                }))
              }
              onReset={() => {
                setCompositionItem((prev) => ({
                  ...prev,
                  unidade: 'UN',
                }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[15%]'>
            <NumberInput
              label='QTDE'
              value={compositionItem.qtde}
              handleChange={(value) =>
                setCompositionItem((prev) => ({
                  ...prev,
                  qtde: value,
                }))
              }
              placeholder='Preencha a quantidade do item...'
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[20%]'>
            <NumberInput
              label='VALOR UNITÁRIO'
              value={compositionItem.valor}
              handleChange={(value) =>
                setCompositionItem((prev) => ({
                  ...prev,
                  valor: value,
                }))
              }
              placeholder='Preencha o valor do item...'
              width='100%'
            />
          </div>
        </div>
        <div className='flex items-center justify-end'>
          <button
            className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
            onClick={() => addItem(compositionItem)}
          >
            ADICIONAR ITEM
          </button>
        </div>
      </div>
      {infoHolder.composicao.map((item, index) => (
        <div key={index} className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
          <div className='flex w-full flex-col items-start justify-between gap-2'>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='flex items-center gap-1'>
                <div className='flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black p-1 text-[20px]'>
                  {renderCategoryIcon(item.categoria, 15)}
                </div>
                <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                  <strong className='text-[#FF9B50]'>{item.qtde}</strong> x {item.descricao}
                </p>
              </div>
              {item.valor > 0 ? (
                <div className='flex min-w-fit items-center gap-2 rounded-full bg-primary/80 px-2 py-1 '>
                  <h1 className='text-[0.65rem] font-medium text-white lg:text-xs'>{formatToMoney(item.qtde * item.valor)}</h1>
                </div>
              ) : null}
            </div>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <TbRulerMeasure />
                  <p className='text-xs italic text-primary/50'>{renderUnitLabel(item.unidade)}</p>
                </div>
                {item.valor > 0 ? (
                  <div className='flex items-center gap-1'>
                    <FaDollarSign />
                    <p className='text-xs italic text-primary/50'>
                      {formatToMoney(item.valor)}/{item.unidade}
                    </p>
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => removeItem(index)}
                type='button'
                className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
              >
                <MdDelete style={{ color: 'red' }} size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PurchaseCompositionBlock;
