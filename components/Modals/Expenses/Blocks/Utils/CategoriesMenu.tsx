import TextInput from '@/components/Inputs/TextInput';
import { TExpense } from '@/utils/schemas/expenses.schema';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTag } from 'react-icons/fa';
import { VscChromeClose } from 'react-icons/vsc';

type ExpenseCategoriesMenuProps = {
  infoHolder: TExpense;
  setInfoHolder: React.Dispatch<React.SetStateAction<TExpense>>;
};
function ExpenseCategoriesMenu({ infoHolder, setInfoHolder }: ExpenseCategoriesMenuProps) {
  const [categoryHolder, setCategoryHolder] = useState('');
  function addCategory(category: string) {
    const categories = [...infoHolder.categorias];
    categories.push(category);
    setInfoHolder((prev) => ({ ...prev, categorias: categories }));
    return toast.success('Categoria adicionada com sucesso !', { duration: 500 });
  }
  function removeCategory(index: number) {
    const categories = [...infoHolder.categorias];
    categories.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, categorias: categories }));
    return toast.success('Categoria removida com sucesso !', { duration: 500 });
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>CATEGORIAS</h1>
      <div className='my-2 flex w-full flex-wrap items-center gap-2'>
        {infoHolder.categorias.length > 0 ? (
          infoHolder.categorias.map((category, index) => (
            <div className='group flex items-center gap-2 rounded-sm border border-blue-800 px-4 py-2 shadow-md'>
              <div className='flex h-[20px] min-h-[20px] w-[20px] min-w-[20px] items-center justify-center rounded-full text-xs text-blue-800'>
                <FaTag />
              </div>
              <p className='text-xs font-bold tracking-tight text-blue-800'>{category}</p>
              <button
                onClick={() => removeCategory(index)}
                className='text-xs text-red-600 opacity-0 duration-300 ease-in-out group-hover:opacity-100'
              >
                <VscChromeClose />
              </button>
            </div>
          ))
        ) : (
          <p className='flex w-full grow items-center justify-center py-2 text-center text-sm font-medium italic tracking-tight text-primary/50'>
            Sem categorias adicionadas.
          </p>
        )}
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full items-end gap-2'>
          <div className='grow'>
            <TextInput
              label='CATEGORIA'
              placeholder='Preencha aqui a categoria a ser adicionada...'
              labelClassName='text-xs font-medium tracking-tight text-primary'
              value={categoryHolder}
              handleChange={(value) => setCategoryHolder(value)}
              width='100%'
            />
          </div>
          <div className='w-fit'>
            <button
              onClick={() => addCategory(categoryHolder)}
              className='rounded-md bg-black p-3 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
            >
              ADICIONAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCategoriesMenu;
