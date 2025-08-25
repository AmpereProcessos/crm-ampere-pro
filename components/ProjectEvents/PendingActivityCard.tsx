import { formatNameAsInitials } from '@/lib/methods/formatting';
import { renderDateDiffText } from '@/lib/methods/rendering';
import { formatLongString } from '@/utils/methods';
import { TActivityDTO } from '@/utils/schemas/activities.schema';
import dayjs from 'dayjs';
import Link from 'next/link';
import { BsCode } from 'react-icons/bs';
import Avatar from '../utils/Avatar';

type PendingActivityCardProps = {
  activity: TActivityDTO;
};
function getBarColor(dueDate?: string) {
  if (!dueDate) return 'bg-green-500';
  const diffHours = dayjs(dueDate).diff(undefined, 'hour');

  if (diffHours > 24) return 'bg-green-500';
  if (diffHours > 0) return 'bg-orange-600';
  return 'bg-red-500';
}

function PendingActivityCard({ activity }: PendingActivityCardProps) {
  const info = activity as TActivityDTO;
  return (
    <div className='flex w-full max-w-full gap-2 rounded-md border border-primary/30 shadow-md'>
      <div className={`flex h-full w-[5px] rounded-tl-md rounded-bl-md ${getBarColor(info.dataVencimento || undefined)}`} />
      <div className='flex w-full grow flex-col gap-1 p-3 pl-1'>
        <div className='flex w-full grow flex-col'>
          <div className='flex items-center gap-2'>
            <h1 className='w-full text-start font-bold text-xs leading-none tracking-tight'>
              {formatLongString(info.titulo.toUpperCase() || '', 100)}
            </h1>
          </div>
          {info.oportunidade.id ? (
            <Link href={`/comercial/oportunidades/id/${info.oportunidade.id}`}>
              <div className='flex items-center gap-1'>
                <BsCode color='#fead41' size={15} />
                <p className='mt-1 font-bold text-primary/70 text-xs hover:text-cyan-500'>{info.oportunidade.nome}</p>
              </div>
            </Link>
          ) : null}

          <h1 className='my-2 w-full rounded-md bg-primary/10 p-2 py-1 text-center font-medium text-primary/70 text-xs'>{activity.descricao}</h1>
          <h1 className='text-primary/70 text-xs leading-none tracking-tight'>RESPONSÁVEIS</h1>
          <div className='flex grow flex-wrap items-center gap-2'>
            {activity.responsaveis.map((resp) => (
              <div className='flex items-center gap-2 rounded-lg border border-cyan-500 p-1 px-2 shadow-md' key={resp.id}>
                <Avatar fallback={formatNameAsInitials(resp.nome)} height={15} url={resp.avatar_url || undefined} width={15} />
                <p className='font-medium text-[0.65rem] text-primary/70 tracking-tight'>{resp.nome}</p>
              </div>
            ))}
          </div>
        </div>
        <div className='flex w-full items-center justify-end'>{renderDateDiffText(info.dataVencimento || undefined)}</div>
      </div>
    </div>
  );
}

export default PendingActivityCard;
