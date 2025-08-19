import dayjs from 'dayjs';
import { Calendar, LayoutGrid } from 'lucide-react';
import DateInput from '@/components/Inputs/DateInput';
import { formatDateInputChange, formatDateInputChangeUtils } from '@/lib/methods/formatting';
import { formatDateForInput } from '@/utils/methods';
import { useGoalStore } from '@/utils/stores/goal-store';

export function GoalGeneralBlock() {
  const periodStart = useGoalStore((s) => s.goal.periodo.inicio);
  const periodEnd = useGoalStore((s) => s.goal.periodo.fim);
  const updatePeriod = useGoalStore((s) => s.updatePeriod);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-fit items-center gap-2 rounded bg-primary/20 px-2 py-1">
        <LayoutGrid size={15} />
        <h1 className="w-fit text-start font-medium text-xs tracking-tight">INFORMAÇÕES GERAIS</h1>
      </div>
      <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <DateInput
            handleChange={(v) => updatePeriod({ inicio: formatDateInputChangeUtils(v, 'string', 'start') as string })}
            label="INÍCIO DO PERÍODO"
            labelIcon={Calendar}
            labelIconClassName="w-3.5 h-3.5"
            value={formatDateForInput(periodStart, false)}
            width="100%"
          />
        </div>
        <div className="w-full lg:w-1/2">
          <DateInput
            handleChange={(v) => updatePeriod({ fim: formatDateInputChangeUtils(v, 'string', 'end') as string })}
            label="FIM DO PERÍODO"
            labelIcon={Calendar}
            labelIconClassName="w-3.5 h-3.5"
            value={formatDateForInput(periodEnd, false)}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
