import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import CheckboxInput from '../Inputs/CheckboxInput';

import { BsCalendar, BsFillCalendarCheckFill } from 'react-icons/bs';

import { renderIcon } from '@/lib/methods/rendering';
import { projectActivityTypes } from '@/utils/constants';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { updateOpportunityHistory } from '@/utils/mutations/opportunity-history';
import { TOpportunityActivityDTO } from '@/utils/schemas/opportunity-history.schema';
import Avatar from '../utils/Avatar';
type ActivityCardProps = {
  event: TOpportunityActivityDTO;
  opportunityId: string;
};

function ActivityCard({ event, opportunityId }: ActivityCardProps) {
  const queryClient = useQueryClient();
  const { mutate: handleOpportunityHistoryUpdate } = useMutationWithFeedback({
    mutationKey: ['update-opportunity-history', event._id],
    mutationFn: updateOpportunityHistory,
    queryClient: queryClient,
    affectedQueryKey: ['opportunity-history', opportunityId],
    callbackFn: () => queryClient.invalidateQueries({ queryKey: ['opportunity-open-activities', opportunityId] }),
  });
  return (
    <div className='flex w-full flex-col gap-2 rounded-md border border-primary/30 p-2'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-col gap-2'>
          <div className='w-fit'>
            <CheckboxInput
              labelFalse={event.titulo}
              labelTrue={event.titulo}
              checked={!!event.dataConclusao}
              handleChange={() =>
                // @ts-ignore
                handleOpportunityHistoryUpdate({ id: event._id, changes: { dataConclusao: event.dataConclusao ? null : new Date().toISOString() } })
              }
              padding='0.25rem'
            />
          </div>
          <div className='flex items-center gap-1 text-blue-600'>
            {renderIcon(projectActivityTypes[event.tipo].icon)}

            <h1 className='w-full text-start text-xs leading-none tracking-tight '>{event.tipo}</h1>
          </div>
        </div>
        {event.dataConclusao ? (
          <div className='flex items-center gap-2'>
            <BsFillCalendarCheckFill style={{ fontSize: '15px', color: 'rgb(34,197,94)' }} />
            <p className='text-xs font-medium text-primary/50'>{dayjs(event.dataConclusao).format('DD/MM/YYYY HH:mm')}</p>{' '}
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <BsFillCalendarCheckFill style={{ fontSize: '15px', color: 'rgb(249,115,22)' }} />
            <p className='text-xs font-medium text-primary/50'>{dayjs(event.dataVencimento).format('DD/MM/YYYY HH:mm')}</p>{' '}
          </div>
        )}
      </div>
      {event.observacoes ? (
        <div className='flex w-full items-center'>
          <p className='w-full rounded-sm border border-primary/30 bg-primary/10 p-3 text-center font-Inter text-xs text-primary/50'>
            {event.observacoes}
          </p>
        </div>
      ) : null}
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar fallback={'R'} url={event.autor?.avatar_url || undefined} height={22} width={22} />
          <p className='text-xs font-medium text-primary/50'>{event.autor?.nome}</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='hidden items-center gap-2 lg:flex'>
            <Avatar fallback={'R'} url={event.autor?.avatar_url || undefined} height={22} width={22} />
            <p className='text-xs text-primary/50'>Criada por: {event.autor?.nome}</p>
          </div>
          <BsCalendar style={{ fontSize: '15px' }} />
          <p className='text-xs font-medium text-primary/50'>
            {event.dataInsercao ? dayjs(event.dataInsercao).format('DD/MM/YYYY HH:mm') : null}
          </p>{' '}
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;
