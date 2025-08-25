import CheckboxInput from '@/components/Inputs/CheckboxInput';
import DateInput from '@/components/Inputs/DateInput';
import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { formatDateAsLocale, formatDateOnInputChange, formatDecimalPlaces } from '@/lib/methods/formatting';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { formatDateForInputValue, formatToMoney } from '@/utils/methods';
import { TRevenueReceiptItem } from '@/utils/schemas/revenues.schema';
import { PaymentMethods } from '@/utils/select-options';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { BsCalendar, BsCalendarCheck, BsPatchCheck } from 'react-icons/bs';
import { FaPercentage } from 'react-icons/fa';
import { MdAttachMoney, MdDelete, MdEdit } from 'react-icons/md';

type ReceiptTableItemProps = {
  item: TRevenueReceiptItem;
  revenueTotal: number;
  handleUpdate: (item: TRevenueReceiptItem) => void;
  handleRemove: () => void;
};
function ReceiptTableItem({ item, revenueTotal, handleUpdate, handleRemove }: ReceiptTableItemProps) {
  const [editMenuIsOpen, setEditMenuIsOpen] = useState<boolean>(false);
  const [itemHolder, setItemHolder] = useState<TRevenueReceiptItem>(item);
  return (
    <>
      <AnimatePresence>
        <div className='hidden w-full flex-col gap-1 lg:flex'>
          <div className='flex w-full items-center gap-2 p-1'>
            <div className='flex w-[25%] items-start gap-1'>
              <div className='flex flex-col'>
                <h1 className='text-xs tracking-tight'>{formatToMoney(item.valor)}</h1>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <FaPercentage size={10} />
                    <p className='text-[0.65rem] font-light italic leading-none tracking-tight text-primary/70'>
                      {formatDecimalPlaces((item.valor / revenueTotal) * 100)}%
                    </p>
                  </div>
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
            <h1 className='w-[25%] text-center text-xs tracking-tight'>{item.metodo}</h1>
            <h1 className='w-[25%] text-center text-xs tracking-tight'>{formatDateAsLocale(item.dataRecebimento || undefined) || '-'}</h1>
            <h1 className='w-[25%] text-center text-xs tracking-tight'>{item.efetivado ? 'SIM' : 'NÃO'}</h1>
          </div>
        </div>
        <div className='flex w-full flex-col rounded-md border border-primary/30 p-2 lg:hidden'>
          <div className='flex w-full items-center justify-between gap-2'>
            <div className='flex items-center gap-1'>
              <div className='flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black p-1 text-[20px]'>
                <MdAttachMoney size={15} />
              </div>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                RECEBIMENTO DE <strong className='text-[#FF9B50]'>{formatDecimalPlaces((item.valor / revenueTotal) * 100)}%</strong>
              </p>
            </div>
            {item.valor > 0 ? (
              <div className='flex min-w-fit items-center gap-2 rounded-full bg-primary/80 px-2 py-1 '>
                <h1 className='text-[0.65rem] font-medium text-primary-foreground lg:text-xs'>{formatToMoney(item.valor)}</h1>
              </div>
            ) : null}
          </div>
          <div className='flex w-full items-center justify-between gap-2'>
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
            <div className='flex items-center gap-2'>
              {item.efetivado ? (
                <div className='flex items-center gap-1'>
                  <BsPatchCheck color='rgb(34,197,94)' />
                  <p className='text-[0.6rem] text-primary/70 lg:text-xs'>EFETIVADO</p>
                </div>
              ) : null}
              <div className='flex items-center gap-1'>
                {item.efetivado ? <BsCalendarCheck /> : <BsCalendar />}
                <p className='text-[0.6rem] text-primary/70 lg:text-xs'>{formatDateAsLocale(item.dataRecebimento || undefined)}</p>
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
              <div className='w-full lg:w-[25%]'>
                <NumberInput
                  label='VALOR'
                  placeholder='Preencha o valor do recebimento...'
                  value={itemHolder.valor}
                  handleChange={(value) => setItemHolder((prev) => ({ ...prev, valor: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[25%]'>
                <SelectInput
                  label='MÉTODO DE PAGAMENTO'
                  resetOptionLabel='NÃO DEFINIDO'
                  options={PaymentMethods}
                  value={itemHolder.metodo}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      metodo: value,
                    }))
                  }
                  onReset={() => {
                    setItemHolder((prev) => ({
                      ...prev,
                      metodo: 'UN',
                    }));
                  }}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[25%]'>
                <DateInput
                  label='DATA/PREVISÃO DE RECEBIMENTO'
                  value={formatDateForInputValue(itemHolder.dataRecebimento)}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      dataRecebimento: formatDateOnInputChange(value),
                    }))
                  }
                  width='100%'
                />
              </div>
              <div className='flex w-full items-center justify-center lg:w-[25%]'>
                <div className='w-fit'>
                  <CheckboxInput
                    labelFalse='RECEBIDO'
                    labelTrue='RECEBIDO'
                    checked={itemHolder.efetivado}
                    handleChange={(value) => setItemHolder((prev) => ({ ...prev, efetivado: value }))}
                  />
                </div>
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

export default ReceiptTableItem;
