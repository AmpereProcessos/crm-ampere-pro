import { TProjectType } from '@/utils/schemas/project-types.schema';
import { PremissesFieldOptions } from '@/utils/select-options';
import React, { useState } from 'react';
import { IoMdOptions } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import NewSizingSection from './NewSizingSection';

function findFieldLabel(field: string) {
  const equivalent = PremissesFieldOptions.find((p) => p.value == field);
  if (!equivalent) return 'NÃO DEFINIDO';
  return equivalent.label;
}

type SizingInformationBlockProps = {
  infoHolder: TProjectType;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProjectType>>;
};
function SizingInformationBlock({ infoHolder, setInfoHolder }: SizingInformationBlockProps) {
  const [newSizingSectionMenuIsOpen, setNewSizingSectionMenuIsOpen] = useState<boolean>(false);

  function addSection(section: TProjectType['dimensionamento'][number]) {
    const sections = [...infoHolder.dimensionamento];
    sections.push(section);
    setInfoHolder((prev) => ({ ...prev, dimensionamento: sections }));
  }
  function removeSection(index: number) {
    const sections = [...infoHolder.dimensionamento];
    sections.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, dimensionamento: sections }));
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>DIMENSIONAMENTO</h1>
      {newSizingSectionMenuIsOpen ? (
        <NewSizingSection
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          addSection={addSection}
          closeMenu={() => setNewSizingSectionMenuIsOpen(false)}
        />
      ) : (
        <div className='flex w-full items-center justify-end'>
          <button
            className='rounded bg-green-500 p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-green-600'
            onClick={() => setNewSizingSectionMenuIsOpen(true)}
          >
            NOVA SEÇÃO
          </button>
        </div>
      )}
      <h1 className='font-Inter font-black'>SEÇÕES DE DIMENSIONAMENTO</h1>
      <div className='flex w-full flex-col gap-1'>
        {infoHolder.dimensionamento.map((sizing, index) => (
          <div key={index} className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='flex grow items-center gap-1'>
                <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                  <IoMdOptions size={13} />
                </div>

                <p className='text-sm font-medium leading-none tracking-tight'>{sizing.titulo}</p>
              </div>
              <button
                onClick={() => removeSection(index)}
                type='button'
                className='flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
              >
                <MdDelete style={{ color: 'red' }} />
              </button>
            </div>
            <div className='flex w-full flex-col gap-2'>
              <h1 className='"w-full mt-2 text-start text-xs font-medium'>CAMPOS</h1>
              <div className='flex w-full items-center justify-start gap-2'>
                {sizing.campos.map((field, itemIndex) => (
                  <div key={itemIndex} className='rounded-lg border border-primary/30 bg-primary/20 px-2 py-1 text-[0.57rem] font-medium'>
                    {findFieldLabel(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SizingInformationBlock;
