import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';
import React, { useState } from 'react';
import { BsBookmarksFill } from 'react-icons/bs';
import { FaSolarPanel } from 'react-icons/fa';
import System from './KitsSelection';

type CompositionProps = {
  opportunity: TOpportunityDTOWithClient;
  infoHolder: TProposal;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
  moveToNextStage: () => void;
  moveToPreviousStage: () => void;
};
function Composition({ opportunity, infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage }: CompositionProps) {
  const [type, setType] = useState<'KIT' | 'PLANO' | null>(null);
  if (!type)
    return (
      <div className='flex min-h-[400px] w-full flex-col gap-2 py-4'>
        <div className='flex w-full flex-col items-center justify-center'>
          <h1 className='text-center font-medium italic text-[#fead61]'>
            Nessa etapa, defina o tipo de proposta que você deseja dentre as duas opções:
          </h1>
        </div>
        <div className='flex w-full items-center justify-center gap-2'>
          <div className='flex w-[50%] flex-col border border-primary/50 p-3'>
            <div className='flex w-full items-center justify-center gap-2'>
              <FaSolarPanel style={{ fontSize: '17px' }} />
              <h1 className='font-black'>KIT</h1>
            </div>
            <p className='text-center tracking-tight text-primary/50'>Uma proposta de venda única.</p>
            <p className='text-center tracking-tight text-primary/50'>Contemplando produtos e serviços.</p>
          </div>
          <div className='flex w-[50%] flex-col border border-primary/50 p-3'>
            <div className='flex w-full items-center justify-center gap-2'>
              <BsBookmarksFill style={{ fontSize: '17px' }} />
              <h1 className='font-black'>PLANO</h1>
            </div>
            <p className='text-center tracking-tight text-primary/50'>Uma proposta de plano de assinatura.</p>
            <p className='text-center tracking-tight text-primary/50'>Contemplando serviços.</p>
          </div>
        </div>
      </div>
    );
  if (type == 'KIT')
    return (
      <System
        infoHolder={infoHolder}
        setInfoHolder={setInfoHolder}
        opportunity={opportunity}
        moveToPreviousStage={moveToPreviousStage}
        moveToNextStage={moveToNextStage}
      />
    );
  if (type == 'PLANO') return <> </>;
  return <></>;
}

export default Composition;
