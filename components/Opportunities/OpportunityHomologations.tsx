import NewHomologation from '@/app/components/Modals/Homologations/NewHomologation';
import type { TUserSession } from '@/lib/auth/session';
import { useOpportunityHomologations } from '@/utils/queries/homologations';
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import { useState } from 'react';
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io';
import { MdAdd } from 'react-icons/md';
import OpportunityHomologationCard from '../Cards/OpportunityHomologation';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type OpportunityHomologationsProps = {
  opportunity: TOpportunityDTOWithClient;
  session: TUserSession;
};
function OpportunityHomologations({ opportunity, session }: OpportunityHomologationsProps) {
  const { data: homologations, isLoading, isError, isSuccess } = useOpportunityHomologations({ opportunityId: opportunity._id });
  const [newHomologationModalIsOpen, setNewHomologationModalIsOpen] = useState<boolean>(false);
  const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

  return (
    <div className='flex max-h-[250px] w-full flex-col rounded-md border border-primary/30 bg-background p-3 shadow-lg'>
      <div className='flex  h-[40px] items-center  justify-between border-b border-primary/30 pb-2'>
        <div className='flex items-center justify-center gap-5'>
          <h1 className='p-1 text-center font-bold text-primary'>Homologação</h1>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setNewHomologationModalIsOpen(true)}
            className='hidden rounded-sm bg-green-600 p-1 text-[0.7rem] font-bold text-primary-foreground lg:flex'
          >
            SOLICITAR HOMOLOGAÇÃO
          </button>
          <button
            onClick={() => setNewHomologationModalIsOpen(true)}
            className='flex rounded-sm bg-green-600 p-1 text-sm font-bold text-primary-foreground lg:hidden'
          >
            <MdAdd />
          </button>
          {blockIsOpen ? (
            <button className='text-primary/60 hover:text-blue-400'>
              <IoMdArrowDropupCircle style={{ fontSize: '25px' }} onClick={() => setBlockIsOpen(false)} />
            </button>
          ) : (
            <button className='text-primary/60 hover:text-blue-400'>
              <IoMdArrowDropdownCircle style={{ fontSize: '25px' }} onClick={() => setBlockIsOpen(true)} />
            </button>
          )}
        </div>
      </div>
      {blockIsOpen ? (
        <div className='overscroll-y flex w-full grow flex-col gap-1 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg='Erro ao buscar homologações da oportunidade.' /> : null}
          {isSuccess ? (
            homologations.length > 0 ? (
              homologations.map((homologation) => <OpportunityHomologationCard key={homologation._id} homologation={homologation} />)
            ) : (
              <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
                Sem homologações vinculadas a essa oportunidade.
              </p>
            )
          ) : null}
        </div>
      ) : null}

      {newHomologationModalIsOpen ? (
        <NewHomologation opportunity={opportunity} session={session} closeModal={() => setNewHomologationModalIsOpen(false)} />
      ) : null}
    </div>
  );
}

export default OpportunityHomologations;
