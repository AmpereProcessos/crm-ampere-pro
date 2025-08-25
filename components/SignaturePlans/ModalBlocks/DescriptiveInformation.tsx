import TextInput from '@/components/Inputs/TextInput';
import { TSignaturePlan } from '@/utils/schemas/signature-plans.schema';
import React, { useState } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';

type DescriptiveInformationProps = {
  infoHolder: TSignaturePlan;
  setInfoHolder: React.Dispatch<React.SetStateAction<TSignaturePlan>>;
};
function DescriptiveInformation({ infoHolder, setInfoHolder }: DescriptiveInformationProps) {
  const [descriptiveHolder, setDescriptiveHolder] = useState<TSignaturePlan['descritivo'][number]>({
    descricao: '',
  });
  function addItem(info: TSignaturePlan['descritivo'][number]) {
    const descriptive = [...infoHolder.descritivo];
    descriptive.push(info);
    setInfoHolder((prev) => ({ ...prev, descritivo: descriptive }));
    setDescriptiveHolder({ descricao: '' });
    return;
  }
  function removeItem(index: number) {
    const descriptive = [...infoHolder.descritivo];
    descriptive.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, descritivo: descriptive }));
    return;
  }
  return (
    <div className='flex w-full flex-col gap-1'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>DESCRITIVO</h1>
      <div className='my-2 flex w-full flex-col gap-0.5'>
        <p className='w-full text-center font-medium tracking-tight text-primary/50'>Adicione aqui itens os quais o plano contempla.</p>
        <p className='w-full text-center font-medium tracking-tight text-primary/50'>
          Esses itens serão utilizados na visualização dos planos em uma eventual proposta comercial, de modo a promover os benefícios do plano em
          questão.
        </p>
      </div>
      <TextInput
        label='TEXTO DO ITEM'
        placeholder='Preencha o texto do item de descritivo.'
        value={descriptiveHolder.descricao}
        handleChange={(value) => setDescriptiveHolder((prev) => ({ ...prev, descricao: value }))}
        width='100%'
      />
      <div className='flex items-center justify-end'>
        <button
          className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
          onClick={() => addItem(descriptiveHolder)}
        >
          ADICIONAR ITEM
        </button>
      </div>
      <div className='mt-2 flex min-h-[150px] w-full flex-col rounded-md border border-primary/50 p-3 shadow-md'>
        <h1 className='mb-2 text-start font-Inter font-bold leading-none tracking-tight'>DESCRITIVO</h1>
        <div className='flex w-full flex-col items-center gap-2'>
          {infoHolder.descritivo.length > 0 ? (
            infoHolder.descritivo.map((product, index) => (
              <div
                onClick={() => removeItem(index)}
                className='flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md bg-transparent px-2 py-1 hover:bg-red-100'
              >
                <BsCheckCircleFill color='rgb(21,128,61)' />
                <p className='text-sm font-bold tracking-tight text-primary/50'>{product.descricao}</p>
              </div>
            ))
          ) : (
            <div className='text-center font-light text-primary/50'>Nenhum item adicionado ao descritivo.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DescriptiveInformation;
