import dayjs from "dayjs";
import { Calendar, LayoutGrid } from "lucide-react";
import DateInput from "@/components/Inputs/DateInput";

import { useGoalStore } from "@/utils/stores/goal-store";
import { formatDateForInputValue } from "@/utils/methods";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";

export function GoalGeneralBlock() {
	const periodStart = useGoalStore((s) => s.goal.periodo.inicio);
	const periodEnd = useGoalStore((s) => s.goal.periodo.fim);
	const updatePeriod = useGoalStore((s) => s.updatePeriod);

	const dateToInputValue = (date: string | Date | null) => {
		if (!date) return '';
		if (typeof date === 'string') return date;
		return date.toISOString().split('T')[0];
	};

	// Convert input string to Date object
	const inputValueToDate = (value: string | null) => {
		if (!value) return null;
		return new Date(value + 'T00:00:00');
	};
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex w-fit items-center gap-2 rounded bg-primary/20 px-2 py-1">
				<LayoutGrid size={15} />
				<h1 className="text-start  w-fit font-medium text-xs tracking-tight">INFORMAÇÕES GERAIS</h1>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<DateInput
						handleChange={(v) => {
							updatePeriod({ inicio: inputValueToDate(v ?? null)?.toISOString() ?? null });
						}}
						label="INÍCIO DO PERÍODO"
						labelIcon={Calendar}
						labelIconClassName="w-3.5 h-3.5"
						value={dateToInputValue(periodStart)}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<DateInput
						handleChange={(v) => {
							console.log("Period End change", {
								comingValue: v,
								comingValueMarked: `$${v}$`,
								formattedValue: formatDateOnInputChange(v, "string", 'end'),
							});
							updatePeriod({ fim: formatDateOnInputChange(v, "string", 'end') as string });
						}}
						label="FIM DO PERÍODO"
						labelIcon={Calendar}
						labelIconClassName="w-3.5 h-3.5"
						value={formatDateForInputValue(periodEnd)}
						width="100%"
					/>
				</div>
			</div>

		</div>
	);
}
