import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { renderUnitLabel } from '@/lib/methods/rendering';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { formatToMoney } from '@/utils/methods';
import { TRevenueCompositionItem } from '@/utils/schemas/revenues.schema';
import { Units } from '@/utils/select-options';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { BsCart } from 'react-icons/bs';
import { FaDollarSign } from 'react-icons/fa';
import { MdDelete, MdEdit, MdOutlineMiscellaneousServices } from 'react-icons/md';
import { TbRulerMeasure } from 'react-icons/tb';

type CompositionTableItemProps = {
  item: TRevenueCompositionItem;
  handleUpdate: (item: TRevenueCompositionItem) => void;
  handleRemove: () => void;
};
function CompositionTableItem({ item, handleUpdate, handleRemove }: CompositionTableItemProps) {
  const [editMenuIsOpen, setEditMenuIsOpen] = useState<boolean>(false);
  const [itemHolder, setItemHolder] = useState<TRevenueCompositionItem>(item);
  return (
    <>
      <AnimatePresence>
        <div className='hidden w-full flex-col gap-1 lg:flex'>
          <div className='flex w-full items-center gap-2 p-1'>
            <div className='flex w-[30%] items-start gap-1'>
              <div className='flex flex-col'>
                <h1 className='text-xs tracking-tight'>{item.descricao}</h1>
                <div className='flex items-center gap-2'>
                  {item.idProduto ? (
                    <div className='flex items-center gap-1'>
                      <BsCart size={10} />
                      <p className='text-[0.55rem] font-normal italic leading-none tracking-tight text-primary/70'>#{item.idProduto}</p>
                    </div>
                  ) : null}
                  {item.idServico ? (
                    <div className='flex items-center gap-1'>
                      <MdOutlineMiscellaneousServices size={10} />
                      <p className='text-[0.55rem] font-normal italic leading-none tracking-tight text-primary/70'>#{item.idServico}</p>
                    </div>
                  ) : null}
                </div>
                {/* <p className="text-[0.65rem] font-light italic leading-none tracking-tight text-primary/70">{item.categoria}</p> */}
              </div>
              <button
                onClick={() => setEditMenuIsOpen((prev) => !prev)}
                className='flex items-center justify-center rounded-sm border border-orange-500 bg-orange-50 p-1 text-orange-500 duration-300 ease-in-out hover:border-orange-700 hover:text-orange-700'
              >
                <MdEdit size={10} />
              </button>
              <button
                onClick={() => handleRemove()}
                className='flex items-center justify-center rounded-sm border border-red-500 bg-red-50 p-1 text-red-500 duration-300 ease-in-out hover:border-red-700 hover:text-red-700'
              >
                <MdDelete size={10} />
              </button>
            </div>
            <h1 className='w-[15%] text-center text-xs tracking-tight'>{item.unidade}</h1>
            <h1 className='w-[15%] text-center text-xs tracking-tight'>{item.qtde}</h1>
            <h1 className='w-[20%] text-center text-xs tracking-tight'>{item.valor ? formatToMoney(item.valor) : '-'}</h1>
            <h1 className='w-[20%] text-center text-xs tracking-tight'>{item.valor ? formatToMoney(item.qtde * item.valor) : '-'}</h1>
          </div>
        </div>
        <div className='flex w-full flex-col rounded-md border border-primary/30 p-2 lg:hidden'>
          <div className='flex w-full flex-col items-start justify-between gap-2'>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-1'>
                  <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                    <strong className='text-[#FF9B50]'>{item.qtde}</strong> x {item.descricao}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {item.idProduto ? (
                    <div className='flex items-center gap-1'>
                      <BsCart size={10} />
                      <p className='text-[0.65rem] font-light italic leading-none tracking-tight text-primary/70'>#{item.idProduto}</p>
                    </div>
                  ) : null}
                  {item.idServico ? (
                    <div className='flex items-center gap-1'>
                      <MdOutlineMiscellaneousServices size={10} />
                      <p className='text-[0.65rem] font-light italic leading-none tracking-tight text-primary/70'>#{item.idServico}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {item.valor > 0 ? (
                <div className='flex min-w-fit items-center gap-2 rounded-full bg-primary/80 px-2 py-1 '>
                  <h1 className='text-[0.65rem] font-medium text-primary-foreground lg:text-xs'>{formatToMoney(item.qtde * item.valor)}</h1>
                </div>
              ) : null}
            </div>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <TbRulerMeasure />
                  <p className='text-[0.6rem] italic text-primary/70 lg:text-xs'>{renderUnitLabel(item.unidade)}</p>
                </div>
                {item.valor > 0 ? (
                  <div className='flex items-center gap-1'>
                    <FaDollarSign />
                    <p className='text-[0.6rem] italic text-primary/70 lg:text-xs'>
                      {formatToMoney(item.valor)}/{item.unidade}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setEditMenuIsOpen((prev) => !prev)}
                  type='button'
                  className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-orange-200'
                >
                  <MdEdit style={{ color: 'orange' }} size={15} />
                </button>
                <button
                  onClick={() => handleRemove()}
                  type='button'
                  className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                >
                  <MdDelete style={{ color: 'red' }} size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
        {editMenuIsOpen ? (
          <motion.div
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex w-full flex-col gap-1 p-3'
          >
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[40%]'>
                <TextInput
                  label='DESCRIÇÃO'
                  placeholder='Preencha a descrição do item...'
                  value={itemHolder.descricao}
                  handleChange={(value) => setItemHolder((prev) => ({ ...prev, descricao: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[20%]'>
                <SelectInput
                  label='UNIDADE'
                  resetOptionLabel='NÃO DEFINIDO'
                  options={Units}
                  value={itemHolder.unidade}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      unidade: value,
                    }))
                  }
                  onReset={() => {
                    setItemHolder((prev) => ({
                      ...prev,
                      unidade: 'UN',
                    }));
                  }}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[20%]'>
                <NumberInput
                  label='QTDE'
                  value={itemHolder.qtde}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
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
                  value={itemHolder.valor}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      valor: value,
                    }))
                  }
                  placeholder='Preencha o valor do item...'
                  width='100%'
                />
              </div>
            </div>
            <div className='flex items-center justify-end gap-2'>
              <button
                onClick={() => {
                  setEditMenuIsOpen(false);
                }}
                className='rounded bg-red-800 p-1 px-4 text-[0.6rem] font-medium text-primary-foreground duration-300 ease-in-out hover:bg-red-700'
              >
                FECHAR
              </button>
              <button
                onClick={() => {
                  handleUpdate(itemHolder);
                  setEditMenuIsOpen(false);
                }}
                className='rounded bg-blue-800 p-1 px-4 text-[0.6rem] font-medium text-primary-foreground duration-300 ease-in-out hover:bg-blue-700'
              >
                ATUALIZAR ITEM
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default CompositionTableItem;
