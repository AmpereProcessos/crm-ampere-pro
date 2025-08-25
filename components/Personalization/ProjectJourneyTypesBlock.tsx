import type { TUserSession } from '@/lib/auth/session';
import { useProjectJourneyTypes } from '@/utils/queries/project-journey-types';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ProjectJourneyType from '../Cards/ProjectJourneyType';
import NewProjectJourneyTypeMenu from '../ProjectJourneyTypes/NewProjectJourneyTypeMenu';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type ProjectJourneyTypesBlockProps = {
  session: TUserSession;
};
function ProjectJourneyTypesBlock({ session }: ProjectJourneyTypesBlockProps) {
  const [newProjectJourneyType, setNewProjectJourneyType] = useState<boolean>(false);
  const { data: journeyTypes, isLoading, isError, isSuccess } = useProjectJourneyTypes();
  return (
    <div className='flex min-h-[450px] w-full flex-col rounded-sm border border-[#b990e7]'>
      <h1 className='w-full rounded-tl rounded-tr bg-[#b990e7] p-1 text-center text-sm font-bold text-primary-foreground'>
        TIPOS DE JORNADA DE PROJETO
      </h1>
      <div className='my-1 flex w-full flex-col'>
        <p className='w-full text-center text-sm font-light tracking-tighter text-primary/70'>
          Os tipos de jornada de projeto aqui cadastrados serão opções na configuração do projeto.
        </p>
      </div>
      <div className='flex max-h-[600px] w-full grow flex-wrap items-start justify-around gap-2 overflow-y-auto overscroll-y-auto p-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg='Erro ao buscar tipos de jornada.' /> : null}
        {isSuccess ? (
          journeyTypes.length > 0 ? (
            journeyTypes.map((journeyType) => (
              <div className='w-full'>
                <ProjectJourneyType key={journeyType._id} journeyType={journeyType} handleClick={() => {}} />
              </div>
            ))
          ) : (
            <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
              Nenhum tipo de jornada encontrado.
            </p>
          )
        ) : null}
      </div>
      <div className='flex w-full items-center justify-end p-2'>
        {newProjectJourneyType ? (
          <button
            className='rounded bg-red-500 p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-red-600'
            onClick={() => setNewProjectJourneyType(false)}
          >
            FECHAR MENU
          </button>
        ) : (
          <button
            className='rounded bg-green-500 p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-green-600'
            onClick={() => setNewProjectJourneyType(true)}
          >
            NOVO TIPO DE JORNADA
          </button>
        )}
      </div>
      <AnimatePresence>{newProjectJourneyType ? <NewProjectJourneyTypeMenu session={session} /> : null}</AnimatePresence>
    </div>
  );
}

export default ProjectJourneyTypesBlock;
