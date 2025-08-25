import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { useOpportunityHomologations } from '@/utils/queries/homologations';
import { TProject } from '@/utils/schemas/project.schema';
import React from 'react';
import { TDocumentationHolder } from '../NewProjectRequest';
import ActiveHomologation from './Utils/ActiveHomologation';
import SelectableHomologation from './Utils/SelectableHomologation';

type HomologationBlockProps = {
  infoHolder: TProject;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
  documentationHolder: TDocumentationHolder;
  setDocumentationHolder: React.Dispatch<React.SetStateAction<TDocumentationHolder>>;
  moveToNextStage: () => void;
  moveToPreviousStage: () => void;
  session: TUserSession;
};
function HomologationBlock({
  infoHolder,
  setInfoHolder,
  documentationHolder,
  setDocumentationHolder,
  moveToNextStage,
  moveToPreviousStage,
  session,
}: HomologationBlockProps) {
  const opportunityId = infoHolder.oportunidade.id;
  const { data: homologations, isLoading, isError, isSuccess } = useOpportunityHomologations({ opportunityId });

  const activeHomologation = infoHolder.idHomologacao ? homologations?.find((h) => h._id == infoHolder.idHomologacao) : null;
  const selectableHomologations = homologations?.filter((h) => h._id != infoHolder.idHomologacao);
  function validateAndProceed() {
    if (activeHomologation) {
      // In case there is an active documentation, using is information to update the documentation holder condition data
      setDocumentationHolder((prev) => ({
        ...prev,
        conditionData: {
          ...prev.conditionData,
          grupoInstalacao: activeHomologation.instalacao.grupo,
          tipoTitular: activeHomologation.titular.identificador.length == 18 ? 'PESSOA JURÍDICA' : 'PESSOA FÍSICA',
        },
      }));
    }
    moveToNextStage();
  }
  return (
    <div className='flex w-full grow flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES DA HOMOLOGAÇÃO</h1>
      <div className='flex w-full grow flex-col gap-2'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg='Oops, houve um erro ao buscar as homologações vinculadas a oportunidade.' /> : null}
        {isSuccess ? (
          <>
            {activeHomologation ? (
              <div className='mb-6 flex w-full flex-col items-center justify-center rounded-sm border border-green-500'>
                <h1 className='w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-white'>
                  HOMOLOGAÇÃO ATIVA
                </h1>
                <div className='flex w-full items-center justify-center p-2'>
                  <ActiveHomologation homologation={activeHomologation} />
                </div>
              </div>
            ) : null}
            <h1 className='text-[0.65rem] font-bold leading-none tracking-tight text-primary/50 lg:text-xs'>LISTA DE HOMOLOGAÇÕES DA OPORTUNIDADE</h1>
            {selectableHomologations ? (
              selectableHomologations.length > 0 ? (
                selectableHomologations.map((homologation) => (
                  <SelectableHomologation
                    key={homologation._id}
                    homologation={homologation}
                    selectHomologation={(id) => setInfoHolder((prev) => ({ ...prev, idHomologacao: id }))}
                  />
                ))
              ) : (
                <p className='w-full text-center text-sm font-medium tracking-tight text-primary/50'>Nenhuma homologação encontrada.</p>
              )
            ) : null}
          </>
        ) : null}
      </div>
      <div className='flex w-full items-center justify-between'>
        <button
          onClick={() => {
            moveToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/50 duration-300 hover:scale-105'
        >
          VOLTAR
        </button>
        {activeHomologation ? (
          <button
            onClick={() => validateAndProceed()}
            className='rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
          >
            PROSSEGUIR
          </button>
        ) : (
          <button
            onClick={() => validateAndProceed()}
            className='rounded bg-orange-700 px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-orange-800'
          >
            PROSSEGUIR SEM HOMOLOGAÇÃO
          </button>
        )}
      </div>
    </div>
  );
}

export default HomologationBlock;
