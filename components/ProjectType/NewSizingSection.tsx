import { TProjectType } from '@/utils/schemas/project-types.schema';
import { TProposalPremisses } from '@/utils/schemas/proposal.schema';
import { AutomaticPremissesBySaleCategory, PremissesFieldOptions } from '@/utils/select-options';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdLock } from 'react-icons/io';
import { VscChromeClose } from 'react-icons/vsc';

function findFieldLabel(field: string) {
  const equivalent = PremissesFieldOptions.find((p) => p.value == field);
  if (!equivalent) return 'NÃO DEFINIDO';
  return equivalent.label;
}
type NewSizingSectionProps = {
  infoHolder: TProjectType;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProjectType>>;
  addSection: (info: TProjectType['dimensionamento'][number]) => void;
  closeMenu: () => void;
};
function NewSizingSection({ infoHolder, setInfoHolder, addSection, closeMenu }: NewSizingSectionProps) {
  const [sizingHolder, setSizingHolder] = useState<TProjectType['dimensionamento'][number]>({
    titulo: '',
    campos: [],
  });
  const selectedFields = [...sizingHolder.campos];
  function addField(field: keyof TProposalPremisses) {
    if (selectedFields.includes(field)) return toast.error('Campo já selecionado.');
    const fields = [...sizingHolder.campos];
    fields.push(field);
    setSizingHolder((prev) => ({ ...prev, campos: fields }));
  }
  function removeField(index: number) {
    const fields = [...sizingHolder.campos];
    fields.splice(index, 1);
    setSizingHolder((prev) => ({ ...prev, campos: fields }));
  }
  return (
    <div className='flex w-[80%] flex-col self-center rounded-md border border-primary/50 p-2 font-Inter'>
      <div className='mb-4 flex w-full items-center justify-between'>
        <h1 className='font-Inter font-black'>NOVA SEÇÃO</h1>
        <button
          onClick={() => closeMenu()}
          type='button'
          className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
        >
          <VscChromeClose style={{ color: 'red' }} />
        </button>
      </div>
      <p className='my-2 text-center text-sm tracking-tight text-primary/70'>
        Escolha um nome para uma seção de campos de preenchimento e escolha os campos que comporão essa seção.
      </p>
      <input
        value={sizingHolder.titulo}
        onChange={(e) => setSizingHolder((prev) => ({ ...prev, titulo: e.target.value }))}
        id={'sizing-section'}
        type='text'
        placeholder={'Preencha o nome da seção de dimensionamento.'}
        className='w-full rounded-md border border-primary/30 p-3 text-sm outline-hidden placeholder:italic'
      />
      <h1 className='my-2 w-full text-start text-xs font-black text-[#FF9B50]'>CAMPOS AUTOMÁTICOS POR CATEGORIA DE VENDA</h1>
      <div className='my-2 flex flex-wrap items-center gap-2'>
        {AutomaticPremissesBySaleCategory[infoHolder.categoriaVenda].length > 0 ? (
          AutomaticPremissesBySaleCategory[infoHolder.categoriaVenda].map((field) => (
            <div className='font-xs flex items-center gap-1 rounded-sm bg-primary/60 p-1 text-xs text-primary-foreground'>
              <IoMdLock />
              <p>{findFieldLabel(field)}</p>
            </div>
          ))
        ) : (
          <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
            Sem campos automáticos.
          </p>
        )}
      </div>

      <h1 className='my-2 w-full text-start text-xs font-black text-[#FF9B50]'>CAMPOS DISPONÍVEIS</h1>
      <div className='my-2 flex flex-wrap items-center gap-2'>
        {PremissesFieldOptions.map((p) => p.value)
          .filter((o) => !selectedFields.includes(o) && !AutomaticPremissesBySaleCategory[infoHolder.categoriaVenda].includes(o))
          .map((option, index) => (
            <button
              key={index}
              onClick={() => addField(option as keyof TProposalPremisses)}
              className='grow cursor-pointer rounded-sm border border-primary/70 p-1 text-xs font-medium text-primary/70 duration-300 ease-in-out hover:bg-primary/70 hover:text-primary-foreground'
            >
              {findFieldLabel(option)}
            </button>
          ))}
      </div>
      <h1 className='my-2 w-full text-start text-xs font-black text-cyan-500'>CAMPOS SELECIONADOS</h1>
      <div className='my-2 flex flex-wrap items-center gap-2'>
        {selectedFields.map((field, index) => (
          <div
            onClick={() => removeField(index)}
            className='grow cursor-pointer rounded-sm border border-cyan-500 p-1 text-xs font-medium text-cyan-500 duration-300 ease-in-out hover:border-primary/70 hover:bg-transparent hover:text-primary/70'
          >
            {findFieldLabel(field)}
          </div>
        ))}
      </div>
      <div className='my-2 flex items-center justify-end gap-2'>
        <button
          onClick={() => addSection(sizingHolder)}
          className='rounded bg-blue-600 p-1 px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out hover:bg-blue-800'
        >
          CADASTRAR SEÇÃO
        </button>
      </div>
    </div>
  );
}

export default NewSizingSection;
