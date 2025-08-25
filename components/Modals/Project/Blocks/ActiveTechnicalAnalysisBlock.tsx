import ActiveTechnicalAnalysis from '@/components/ProjectRequest/RequestStages/Utils/ActiveTechnicalAnalysis';
import { TProjectDTOWithReferences } from '@/utils/schemas/project.schema';
import React from 'react';

type ActiveTechnicalAnalysisBlockProps = {
  infoHolder: TProjectDTOWithReferences;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>;
  userHasPricingViewPermission: boolean;
};
function ActiveTechnicalAnalysisBlock({ infoHolder, setInfoHolder, userHasPricingViewPermission }: ActiveTechnicalAnalysisBlockProps) {
  const activeAnalysis = infoHolder.analiseTecnicaDados;
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/80'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>ANÁLISE TÉCNICA ATIVA</h1>
      <div className='flex w-full grow flex-col gap-2 p-2'>
        {!!activeAnalysis ? (
          <ActiveTechnicalAnalysis analysis={activeAnalysis} userHasPricingViewPermission={userHasPricingViewPermission} />
        ) : (
          <div className='flex items-center justify-center p-2'>
            <h1 className='text-center font-medium italic tracking-tight text-primary/50'>
              Não foi possível encontrar nenhuma análise técnica ativa para o projeto.
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveTechnicalAnalysisBlock;
