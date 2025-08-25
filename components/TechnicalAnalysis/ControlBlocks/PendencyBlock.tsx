import React from 'react';

import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';

import type { TUserSession } from '@/lib/auth/session';

import NewActivityMenu from '@/components/Activities/NewActivityMenu';
import TechnicalAnalysisActivity from '@/components/Cards/TechnicalAnalysisActivity';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { useActivitiesByTechnicalAnalysisId } from '@/utils/queries/activities';

type PendencyBlockProps = {
  session: TUserSession;
  technicalAnalysisId: string;
  opportunity: { id?: string | null; nome?: string | null };
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function PendencyBlock({ session, technicalAnalysisId, opportunity, infoHolder, setInfoHolder, changes, setChanges }: PendencyBlockProps) {
  const { data: activities, isLoading, isError, isSuccess } = useActivitiesByTechnicalAnalysisId({ technicalAnalysisId: technicalAnalysisId });
  return (
    <div className='mt-4 flex w-full flex-col'>
      <div className='mb-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-primary-foreground'>PENDÊNCIAS</h1>
      </div>
      <NewActivityMenu
        session={session}
        opportunity={opportunity}
        project={undefined}
        technicalAnalysisId={technicalAnalysisId}
        affectedQueryKey={['technical-analysis-activities', technicalAnalysisId]}
      />
      <div className='mt-2 flex w-full flex-col gap-1'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg='Houve um erro ao buscar atividades da análise técnica.' /> : null}
        {isSuccess ? (
          activities.length > 0 ? (
            activities.map((activity, index) => (
              <TechnicalAnalysisActivity key={activity._id} activity={activity} technicalAnalysisId={technicalAnalysisId} />
            ))
          ) : (
            <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
              Sem atividades adicionadas.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

export default PendencyBlock;
