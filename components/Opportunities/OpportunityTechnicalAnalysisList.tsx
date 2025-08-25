import { useOpportunityTechnicalAnalysis } from '@/utils/queries/technical-analysis';
import React, { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import TechAnalysisItem from '../Cards/TechAnalysisKitItem';
import RequestTechnicalAnalysis from '../Modals/RequestTechnicalAnalysis';
import LoadingComponent from '../utils/LoadingComponent';
import { TOpportunityBlockMode } from './OpportunityPage';

type TechAnalysisListBlockProps = {
  opportunityId: string;
  setBlockMode: React.Dispatch<React.SetStateAction<TOpportunityBlockMode>>;
};

function TechAnalysisListBlock({ opportunityId, setBlockMode }: TechAnalysisListBlockProps) {
  const {
    data: technicalAnalysis,
    isFetching: fetchingTechAnalysis,
    isSuccess: successTechAnalysis,
  } = useOpportunityTechnicalAnalysis({ opportunityId });

  const [requestModalIsOpen, setRequestModalIsOpen] = useState<boolean>(false);
  return (
    <div className='flex h-[320px] w-full flex-col rounded-md border border-primary/30 bg-background p-3 shadow-lg lg:h-[230px] lg:w-[60%]'>
      <div className='flex  h-[40px] items-center  justify-between border-b border-primary/30 pb-2'>
        <div className='flex items-center justify-center gap-5'>
          <h1
            onClick={() => setBlockMode('PROPOSES')}
            className='w-[120px] cursor-pointer border-b border-transparent p-1 text-center font-bold text-primary hover:border-blue-500'
          >
            Propostas
          </h1>
          <h1
            onClick={() => setBlockMode('TECHNICAL ANALYSIS')}
            className='w-fit cursor-pointer border-b border-[#15599a] p-1 text-center font-bold text-primary hover:border-blue-500'
          >
            Análises Técnicas
          </h1>
        </div>

        <button onClick={() => setRequestModalIsOpen(true)} className='hidden rounded-sm bg-green-600 p-1 text-sm font-bold text-white lg:flex'>
          SOLICITAR ANÁLISE
        </button>
        <button onClick={() => setRequestModalIsOpen(true)} className='flex rounded-sm bg-green-600 p-1 text-sm font-bold text-white lg:hidden'>
          <MdAdd />
        </button>
      </div>
      <div className='overscroll-y relative flex w-full grow flex-col gap-2 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {fetchingTechAnalysis ? (
          <div className='flex grow items-center justify-center'>
            <LoadingComponent />
          </div>
        ) : null}
        {successTechAnalysis && technicalAnalysis ? (
          technicalAnalysis?.length > 0 ? (
            technicalAnalysis?.map((analysis, index) => <TechAnalysisItem key={analysis._id} info={analysis} />)
          ) : (
            <p className='flex grow items-center justify-center italic text-primary/50'>
              Não foram encontradas análises técnicas vinculadas a esse projeto...
            </p>
          )
        ) : null}
      </div>
      {requestModalIsOpen ? <RequestTechnicalAnalysis project={project} closeModal={() => setRequestModalIsOpen(false)} /> : null}
    </div>
  );
}

export default TechAnalysisListBlock;
