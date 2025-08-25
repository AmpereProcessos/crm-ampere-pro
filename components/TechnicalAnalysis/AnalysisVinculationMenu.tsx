import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { Optional } from '@/utils/models';
import { useOpportunityTechnicalAnalysis } from '@/utils/queries/technical-analysis';
import { TTechnicalAnalysis, TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import TechnicalAnalysisVinculationCard from '../Cards/TechnicalAnalysisVinculationCard';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type AnalysisVinculationMenuProps = {
  infoHolder: TTechnicalAnalysis;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  closeMenu: () => void;
};
function AnalysisVinculationMenu({ infoHolder, setInfoHolder, closeMenu }: AnalysisVinculationMenuProps) {
  const {
    data: opportunityAnalysis,
    isLoading,
    isError,
    isSuccess,
  } = useOpportunityTechnicalAnalysis({ opportunityId: infoHolder.oportunidade.id || '', concludedOnly: false });
  function handleVinculation(analysis: TTechnicalAnalysisDTO) {
    const analysisId = analysis._id;
    var info = { ...analysis } as Optional<TTechnicalAnalysisDTO, '_id'>;
    delete info._id;
    setInfoHolder((prev) => ({ ...info, idAnaliseReferencia: analysisId }));
  }
  return (
    <AnimatePresence>
      <motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial='hidden' animate='visible' exit='exit' className='flex w-full flex-col'>
        <h1 className='w-full rounded-md  bg-orange-700 p-1 text-center font-medium text-white'>VINCULAÇÃO DE ANÁLISE EXISTENTE</h1>
        <div className='flex max-h-[600px] min-h-[100px] w-full flex-col gap-1 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent /> : null}
          {isSuccess
            ? opportunityAnalysis?.map((analysis) => (
                <TechnicalAnalysisVinculationCard
                  key={analysis._id}
                  analysis={analysis}
                  handleClick={(analysis) => handleVinculation(analysis)}
                  selectedId={infoHolder.idAnaliseReferencia}
                />
              ))
            : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AnalysisVinculationMenu;
