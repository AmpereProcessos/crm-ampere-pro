import PPSCall from '@/components/Cards/PPSCall';
import type { TUserSession } from '@/lib/auth/session';
import { usePPSCalls } from '@/utils/queries/pps-calls';
import { GiBugleCall } from 'react-icons/gi';

type PPSOpenCallsBlockProps = {
  session: TUserSession;
};
function PPSOpenCallsBlock({ session }: PPSOpenCallsBlockProps) {
  const scope = session.user.permissoes.oportunidades.escopo;
  const { data: calls } = usePPSCalls({ applicantId: scope ? session.user.id : null, openOnly: true });

  return (
    <div className='flex h-[650px] w-full flex-col rounded-xl  border border-primary/30 bg-background p-6 shadow-md lg:h-[450px]'>
      <div className='flex min-h-[42px] w-full flex-col'>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>Chamados</h1>
          <GiBugleCall />
        </div>
        <p className='text-sm text-primary/70'>{calls?.length || 0} em aberto</p>
      </div>
      <div className='flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {calls?.map((call, index: number) => (
          <PPSCall key={call._id} call={call} />
        ))}
      </div>
    </div>
  );
}

export default PPSOpenCallsBlock;
