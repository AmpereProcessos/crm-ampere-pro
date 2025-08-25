import dayjs from 'dayjs';

import { IoIosCalendar } from 'react-icons/io';

import Avatar from '../utils/Avatar';

import { TOpportunityAnnotation } from '@/utils/schemas/opportunity-history.schema';

type NoteCardProps = {
  event: TOpportunityAnnotation;
};
function NoteCard({ event }: NoteCardProps) {
  return (
    <div className='flex w-full flex-col gap-2 rounded-md bg-yellow-100 p-2'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar fallback={'R'} url={event.autor?.avatar_url || undefined} height={22} width={22} />
          <p className='text-xs font-medium text-primary/70'>{event.autor.nome}</p>
        </div>
        <div className='flex items-center gap-2'>
          <IoIosCalendar style={{ fontSize: '20px' }} />
          <p className='text-xs font-medium text-primary/70'>
            {event.dataInsercao ? dayjs(event.dataInsercao).format('DD/MM/YYYY HH:mm') : null}
          </p>{' '}
        </div>
      </div>
      <div className='flex w-full items-center justify-center border border-primary/30 p-2'>
        <p className='w-full text-center text-sm text-primary/70'>{event.anotacao}</p>
      </div>
    </div>
  );
}

export default NoteCard;
