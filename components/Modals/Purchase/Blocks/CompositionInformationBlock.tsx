import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { TPurchaseCompositionItem, TPurchaseDTO } from '@/utils/schemas/purchase.schema';
import { ProductItemCategories, Units } from '@/utils/select-options';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import CompositionItemsTable from './Utils/CompositionItemsTable';

type CompositionInformationBlockProps = {
  infoHolder: TPurchaseDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TPurchaseDTO>>;
};
function CompositionInformationBlock({ infoHolder, setInfoHolder }: CompositionInformationBlockProps) {
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
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>COMPOSIÇÃO DA COMPRA</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col gap-1'>
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
        </div>
        <CompositionItemsTable infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
        <div className='flex w-full items-center justify-center'>
          <NumberInput
            label='TOTAL DA COMPRA'
            placeholder='Preencha o valor total da compra...'
            value={infoHolder.total}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, total: value }))}
          />
        </div>
      </div>
    </div>
  );
}

export default CompositionInformationBlock;
