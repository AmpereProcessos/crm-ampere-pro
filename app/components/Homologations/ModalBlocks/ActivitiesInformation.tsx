import type { TUserSession } from '@/lib/auth/session';
import { useState } from 'react';

import { THomologation, THomologationDTO } from '@/utils/schemas/homologation.schema';

import NewActivityMenu from '@/components/Activities/NewActivityMenu';
import HomologationActivity from '@/components/Cards/HomologationActivity';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { useActivitiesByHomologationId } from '@/utils/queries/activities';
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io';

type ActivitiesInformationProps = {
  homologation: THomologationDTO;
  session: TUserSession;
  opportunity: THomologation['oportunidade'];
};
function ActivitiesInformation({ homologation, session, opportunity }: ActivitiesInformationProps) {
  const [menuEnabled, setMenuEnabled] = useState<boolean>(false);
  const { data: activities, isLoading, isError, isSuccess } = useActivitiesByHomologationId({ homologationId: homologation._id });
  const openActivityCount = activities?.filter((a) => !a.dataConclusao).length || 0;
  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 p-1'>
        <h1 className='font-bold text-white'>ATIVIDADES</h1>
        <button onClick={() => setMenuEnabled((prev) => !prev)}>
          {!menuEnabled ? <IoMdArrowDropdownCircle color='white' /> : <IoMdArrowDropupCircle color='white' />}
        </button>
      </div>
      {/* <h1 className="w-full rounded-sm bg-cyan-500 p-1 text-center font-bold text-white">ATIVIDADES</h1> */}
      <NewActivityMenu
        session={session}
        opportunity={opportunity}
        homologationId={homologation._id}
        project={undefined}
        affectedQueryKey={['homologation-activities', homologation._id]}
      />
      <div className='mt-2 flex w-full flex-col gap-1'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg='Houve um erro ao buscar atividades da homologação.' /> : null}
        {isSuccess ? (
          activities.length > 0 ? (
            <>
              {menuEnabled ? (
                activities.map((activity, index) => <HomologationActivity key={activity._id} activity={activity} homologationId={homologation._id} />)
              ) : (
                <p className='flex w-full grow items-center justify-center gap-2 py-2 text-center font-medium italic tracking-tight text-primary/50'>
                  <strong className='text-orange-500'>{openActivityCount} </strong> atividades em aberto.
                </p>
              )}
            </>
          ) : (
            <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/50'>
              Sem atividades adicionadas.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

export default ActivitiesInformation;
