import DateTimeInput from '@/components/Inputs/DateTimeInput';
import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import { Button } from '@/components/ui/button';
import { formatDateForInputValue, formatDateOnInputChange } from '@/lib/methods/formatting';
import { cn } from '@/lib/utils';
import { getActivityDateMode, getActivityStatus, type TActivityDateMode, type TActivityStatus } from '@/utils/schemas/activities.schema';
import { useActivityStore } from '@/utils/stores/activity-store';
import dayjs from 'dayjs';
import { CalendarClock, Check, Clock, ListTodo } from 'lucide-react';

function ActivityGeneralBlock() {
  const title = useActivityStore((s) => s.activity.titulo);
  const description = useActivityStore((s) => s.activity.descricao);
  const deadline = useActivityStore((s) => s.activity.dataVencimento);
  const scheduleStart = useActivityStore((s) => s.activity.agendamentoInicio);
  const scheduleEnd = useActivityStore((s) => s.activity.agendamentoFim);
  const startedAt = useActivityStore((s) => s.activity.dataInicio);
  const conclusion = useActivityStore((s) => s.activity.dataConclusao);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const dateMode = getActivityDateMode({ dataVencimento: deadline, agendamentoInicio: scheduleStart, agendamentoFim: scheduleEnd });
  const status = getActivityStatus({ dataInicio: startedAt, dataConclusao: conclusion });

  function changeStatus(nextStatus: TActivityStatus) {
    if (nextStatus === status) return;
    if (nextStatus === 'PENDENTE') {
      updateActivity({ dataInicio: null, dataConclusao: null });
      return;
    }
    if (nextStatus === 'EM_ANDAMENTO') {
      updateActivity({ dataInicio: startedAt ?? new Date().toISOString(), dataConclusao: null });
      return;
    }
    updateActivity({ dataInicio: startedAt ?? new Date().toISOString(), dataConclusao: new Date().toISOString() });
  }

  function changeDateMode(mode: TActivityDateMode) {
    if (mode === 'sem_data') {
      updateActivity({ dataVencimento: null, agendamentoInicio: null, agendamentoFim: null });
      return;
    }
    if (mode === 'prazo') {
      updateActivity({
        dataVencimento: deadline ?? dayjs().add(1, 'day').startOf('hour').toISOString(),
        agendamentoInicio: null,
        agendamentoFim: null,
      });
      return;
    }
    const start = scheduleStart ?? dayjs().add(1, 'hour').startOf('hour').toISOString();
    updateActivity({
      dataVencimento: null,
      agendamentoInicio: start,
      agendamentoFim: scheduleEnd ?? dayjs(start).add(1, 'hour').toISOString(),
    });
  }

  return (
    <div className='w-full flex flex-col gap-2'>
      <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
        <ListTodo size={15} />
        <h1 className='text-xs tracking-tight font-medium text-start w-fit'>INFORMAÇÕES GERAIS</h1>
      </div>
      <div className='flex w-full flex-col gap-3'>
        <div className='flex w-full flex-wrap items-center justify-center gap-1'>
          <StatusButton active={status === 'PENDENTE'} label='PENDENTE' tone='pending' onClick={() => changeStatus('PENDENTE')} />
          <StatusButton active={status === 'EM_ANDAMENTO'} label='EM ANDAMENTO' tone='ongoing' onClick={() => changeStatus('EM_ANDAMENTO')} />
          <StatusButton
            active={status === 'CONCLUIDA'}
            label={dateMode === 'agenda' ? 'REALIZADA' : 'CONCLUÍDA'}
            tone='completed'
            onClick={() => changeStatus('CONCLUIDA')}
          />
        </div>
        <TextInput
          label='TÍTULO DA ATIVIDADE'
          value={title}
          handleChange={(value) => updateActivity({ titulo: value })}
          placeholder='Preencha aqui o titulo a ser dado à atividade...'
          width='100%'
        />

        <TextareaInput
          label='DESCRIÇÃO DA ATIVIDADE'
          value={description}
          handleChange={(value) => updateActivity({ descricao: value })}
          placeholder='Preencha aqui uma descrição mais específica da atividade a ser feita...'
        />
        <div className='flex flex-col gap-2'>
          <span className='text-sm font-medium tracking-tight text-primary/80'>QUANDO?</span>
          <div className='grid grid-cols-3 rounded-lg border border-primary/20 bg-primary/5 p-1'>
            <DateModeButton active={dateMode === 'sem_data'} label='SEM DATA' onClick={() => changeDateMode('sem_data')} />
            <DateModeButton
              active={dateMode === 'prazo'}
              label='PRAZO'
              icon={<Clock className='h-3.5 w-3.5' />}
              onClick={() => changeDateMode('prazo')}
            />
            <DateModeButton
              active={dateMode === 'agenda'}
              label='AGENDA'
              icon={<CalendarClock className='h-3.5 w-3.5' />}
              onClick={() => changeDateMode('agenda')}
            />
          </div>
        </div>
        {dateMode === 'prazo' ? (
          <DateTimeInput
            label='DATA DE VENCIMENTO'
            value={formatDateForInputValue(deadline, 'datetime')}
            handleChange={(value) => updateActivity({ dataVencimento: value ? (formatDateOnInputChange(value, 'string') as string) : null })}
            width='100%'
          />
        ) : null}
        {dateMode === 'agenda' ? (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <DateTimeInput
              label='INÍCIO DA AGENDA'
              value={formatDateForInputValue(scheduleStart, 'datetime')}
              handleChange={(value) => updateActivity({ agendamentoInicio: value ? (formatDateOnInputChange(value, 'string') as string) : null })}
              width='100%'
            />
            <DateTimeInput
              label='FIM DA AGENDA'
              value={formatDateForInputValue(scheduleEnd, 'datetime')}
              handleChange={(value) => updateActivity({ agendamentoFim: value ? (formatDateOnInputChange(value, 'string') as string) : null })}
              width='100%'
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ActivityGeneralBlock;

function StatusButton({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone: 'pending' | 'ongoing' | 'completed';
  onClick: () => void;
}) {
  const toneClasses = {
    pending: active ? 'bg-primary/30 text-foreground hover:bg-primary/30' : 'bg-primary/10 text-foreground/80 hover:bg-primary/20',
    ongoing: active ? 'bg-blue-300 text-blue-700 hover:bg-blue-300' : 'bg-blue-100 text-blue-700/80 hover:bg-blue-200',
    completed: active ? 'bg-green-300 text-green-700 hover:bg-green-300' : 'bg-green-100 text-green-700/80 hover:bg-green-200',
  };

  return (
    <Button
      type='button'
      variant='ghost'
      size='fit'
      aria-pressed={active}
      onClick={onClick}
      className={cn('flex min-w-fit items-center gap-1 rounded-lg px-2 py-1 opacity-80', active && 'opacity-100', toneClasses[tone])}
    >
      {tone === 'pending' ? <span className='h-4 w-4 rounded-full border border-current' /> : null}
      {tone === 'ongoing' ? <span className='h-4 w-4 rounded-full bg-blue-500' /> : null}
      {tone === 'completed' ? <Check className='h-4 w-4' /> : null}
      <span className='text-[0.65rem] font-medium'>{label}</span>
    </Button>
  );
}

function DateModeButton({ active, label, icon, onClick }: { active: boolean; label: string; icon?: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type='button'
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-9 items-center justify-center gap-1.5 rounded-md text-[0.7rem] font-semibold transition-colors',
        active ? 'bg-background text-foreground shadow-sm' : 'text-primary/55 hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
