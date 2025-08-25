import CheckboxInput from '@/components/Inputs/CheckboxInput';
import { THomologation } from '@/utils/schemas/homologation.schema';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
import { MdCode } from 'react-icons/md';
import OpportunityVinculationMenu from './Utils/OpportunityVinculationMenu';

type OpportunityInformationBlockProps = {
  infoHolder: THomologation;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function OpportunityInformationBlock({ infoHolder, setInfoHolder }: OpportunityInformationBlockProps) {
  const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState(false);
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground'>OPORTUNIDADE</h1>
      {infoHolder.oportunidade.id ? (
        <div className='my-2 flex flex-col items-center justify-center'>
          <h1 className='font-bold'>OPORTUNIDADE</h1>
          <Link href={`/comercial/oportunidades/id/${infoHolder.oportunidade.id}`}>
            <div className='flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-1 text-primary-foreground hover:bg-blue-500'>
              <MdCode />
              <p className='cursor-pointer text-sm font-bold tracking-tight'>{infoHolder.oportunidade.nome}</p>
            </div>
          </Link>
        </div>
      ) : null}

      <div className='flex w-full items-center justify-center py-2'>
        <div className='w-fit'>
          <CheckboxInput
            labelFalse='ABRIR MENU DE VINCULAÇÃO'
            labelTrue='ABRIR MENU DE VINCULAÇÃO'
            checked={vinculationMenuIsOpen}
            handleChange={(value) => setVinculationMenuIsOpen(value)}
          />
        </div>
      </div>
      <AnimatePresence>
        {vinculationMenuIsOpen ? (
          <OpportunityVinculationMenu
            vinculatedId={infoHolder.oportunidade.id}
            infoHolder={infoHolder}
            setInfoHolder={setInfoHolder}
            closeMenu={() => setVinculationMenuIsOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default OpportunityInformationBlock;
