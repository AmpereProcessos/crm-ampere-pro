import ActivityCard from '@/components/Cards/ActivityCard';
import type { TUserSession } from '@/lib/auth/session';
import { useActivities } from '@/utils/queries/activities';
import { BsCheckSquare } from 'react-icons/bs';

type OpenActivitiesBlockProps = {
  session: TUserSession;
};
function OpenActivitiesBlock({ session }: OpenActivitiesBlockProps) {
  const scope = session.user.permissoes.oportunidades.escopo;
  const { data: activities } = useActivities({ responsibleIds: scope ? scope : null, openOnly: true });
  return (
    <div className='bg-card border-primary/20 flex h-[650px] lg:h-[450px] w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs'>
      <div className='flex min-h-[42px] w-full flex-col'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xs font-medium tracking-tight uppercase'>ATIVIDADES EM ABERTO</h1>
          <div className='flex items-center gap-2'>
            <BsCheckSquare className='h-4 w-4' />
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-primary/70'>{activities?.length || 0} em aberto</p>
        </div>
      </div>
      <div className='flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {activities ? (
          activities.length > 0 ? (
            activities.map((activity, index: number) => <ActivityCard key={activity._id} activity={activity} />)
          ) : (
            <div className='flex grow items-center justify-center'>
              <p className='text-center text-sm italic text-primary/70'>Sem atividades em aberto.</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

export default OpenActivitiesBlock;
