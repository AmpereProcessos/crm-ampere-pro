import type { TGetGoalsRouteOutput } from '@/app/api/goals/route';
import type { TUserSession } from '@/lib/auth/session';
import { formatDecimalPlaces, formatToMoney } from '@/lib/methods/formatting';
import { useGoals } from '@/utils/queries/goals';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { BadgeDollarSign, Check, Goal, Percent, Plus, Send, Zap } from 'lucide-react';
import { useState } from 'react';
import EditGoal from '../Modals/Goals/EditGoal';
import NewGoal from '../Modals/Goals/NewGoal';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type GoalsProps = {
  session: TUserSession;
};
function Goals({ session }: GoalsProps) {
  const queryClient = useQueryClient();
  const [newGoalModalIsOpen, setNewGoalModalIsOpen] = useState(false);
  const [editGoalModalId, setEditGoalModalId] = useState<string | null>(null);
  const { data: goals, isLoading, isError, isSuccess, queryKey } = useGoals();

  const handleOnMutate = async () => await queryClient.cancelQueries({ queryKey });
  const handleOnSettled = async () => await queryClient.invalidateQueries({ queryKey });

  return (
    <div className='flex h-full grow flex-col'>
      <div className='flex w-full items-center justify-between border-primary/30 border-b pb-2'>
        <div className='flex w-full items-center justify-between border-primary/30 border-b pb-2'>
          <div className='flex flex-col'>
            <h1 className={'font-bold text-lg'}>Metas</h1>
            <p className='text-[#71717A] text-sm'>Gerencie as metas.</p>
          </div>
          <button
            className='h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 font-medium text-sm text-white shadow-sm enabled:hover:bg-primary/80 enabled:hover:text-white disabled:bg-primary/50 disabled:text-white'
            onClick={() => setNewGoalModalIsOpen(true)}
            type='button'
          >
            NOVA META
          </button>
        </div>
      </div>
      <div className='flex w-full flex-col gap-2 py-2'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg='Erro ao buscar metas' /> : null}
        {isSuccess
          ? goals.map((goal) => <GoalCard goal={goal} handleEditClick={() => setEditGoalModalId(goal._id.toString())} key={goal._id.toString()} />)
          : null}
      </div>
      {newGoalModalIsOpen ? (
        <NewGoal
          callbacks={{
            onMutate: handleOnMutate,
            onSettled: handleOnSettled,
          }}
          closeMenu={() => setNewGoalModalIsOpen(false)}
          session={session}
        />
      ) : null}
      {editGoalModalId ? <EditGoal goalId={editGoalModalId} session={session} closeMenu={() => setEditGoalModalId(null)} /> : null}
    </div>
  );
}

export default Goals;

function GoalCard({
  goal,
  handleEditClick,
}: {
  goal: Exclude<TGetGoalsRouteOutput['data']['default'], undefined>[number];
  handleEditClick: () => void;
}) {
  const periodStr = `${dayjs(goal.periodo.inicio).format('DD/MM/YYYY')} - ${dayjs(goal.periodo.fim).format('DD/MM/YYYY')}`;
  function GoalValueCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
    return (
      <div className='flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-0.5'>
        <div className='flex items-center gap-1'>
          {icon}
          <h1 className='text-[0.65rem]'>{label}</h1>
        </div>
        <h1 className='font-medium text-xs'>{value}</h1>
      </div>
    );
  }
  return (
    <div className='flex w-full flex-col gap-3 rounded-md border border-primary/30 p-2'>
      <div className='flex grow items-center gap-1'>
        <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
          <Goal className='w-4 min-w-4' />
        </div>
        {true ? (
          <button
            className='cursor-pointer font-medium text-sm leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'
            onClick={handleEditClick}
          >
            META: {periodStr}
          </button>
        ) : (
          <p className='font-medium text-sm leading-none tracking-tight'>META: {periodStr}</p>
        )}
      </div>
      <div className='flex w-full flex-col gap-2'>
        <h1 className='"w-full text-start font-medium text-xs'>OBJETIVOS</h1>
        <div className='flex w-full flex-wrap items-center justify-start gap-2'>
          <GoalValueCard icon={<Plus className='h-3.5 w-3.5' />} label='OPORTUNIDADES CRIADAS' value={goal.objetivo.oportunidadesCriadas} />
          <GoalValueCard icon={<Send className='h-3.5 w-3.5' />} label='OPORTUNIDADES ENVIADAS' value={goal.objetivo.oportunidadesEnviadas} />
          <GoalValueCard icon={<Check className='h-3.5 w-3.5' />} label='OPORTUNIDADES GANHAS' value={goal.objetivo.oportunidadesGanhas} />
          <GoalValueCard
            icon={<BadgeDollarSign className='h-3.5 w-3.5' />}
            label='VALOR VENDIDO (R$)'
            value={formatToMoney(goal.objetivo.valorVendido)}
          />
          <GoalValueCard
            icon={<Zap className='h-3.5 w-3.5' />}
            label='POTÊNCIA VENDIDA (kWp)'
            value={`${formatDecimalPlaces(goal.objetivo.potenciaVendida)}kWp`}
          />
          <GoalValueCard
            icon={<Percent className='h-3.5 w-3.5' />}
            label='CONVERSÃO EM ENVIO (%)'
            value={goal.objetivo.oportunidadesEnviadasConversao}
          />
          <GoalValueCard
            icon={<Percent className='h-3.5 w-3.5' />}
            label='CONVERSÃO EM GANHO (%)'
            value={goal.objetivo.oportunidadesGanhasConversao}
          />
        </div>
      </div>
    </div>
  );
}
