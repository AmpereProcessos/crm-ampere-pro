import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import { TExpense } from '@/utils/schemas/expenses.schema';
import React from 'react';
import ExpenseCategoriesMenu from './Utils/CategoriesMenu';

type GeneralInformationBlockProps = {
  infoHolder: TExpense;
  setInfoHolder: React.Dispatch<React.SetStateAction<TExpense>>;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder }: GeneralInformationBlockProps) {
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>INFORMAÇÕES GERAIS</h1>
      <div className='flex w-full flex-col gap-1'>
        <TextInput
          label='TÍTULO DA DESPESA'
          placeholder='Preencha aqui o título a ser dado à despesa...'
          value={infoHolder.titulo}
          handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
          width='100%'
        />
        <TextareaInput
          label='ANOTAÇÕES'
          placeholder='Preencha aqui, se necessário, anotações e informações relevantes, peculiaridades e observações acerca da despesa...'
          value={infoHolder.anotacoes}
          handleChange={(value) => setInfoHolder((prev) => ({ ...prev, anotacoes: value }))}
        />
        <ExpenseCategoriesMenu infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
      </div>
    </div>
  );
}

export default GeneralInformationBlock;
