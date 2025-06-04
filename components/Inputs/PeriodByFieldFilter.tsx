"use client";

import type { HTMLAttributes } from "react";
import { addDays, format, setDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ptBR } from "date-fns/locale";

type PeriodByFieldFilterValue = { after?: string; before?: string; field?: string };
type PeriodByFieldFilterProps = {
	value: PeriodByFieldFilterValue;
	handleChange: (value: PeriodByFieldFilterValue) => void;
	fieldOptions: { id: number; label: string; value: string }[];
};
export function PeriodByFieldFilter({ className, value, handleChange, fieldOptions }: HTMLAttributes<HTMLDivElement> & PeriodByFieldFilterProps) {
	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn("w-full justify-start min-h-[46.6px] text-left font-normal px-3 flex items-center gap-2 bg-[#fff] darK:bg-[#fff]", !value && "text-muted-foreground")}
					>
						<CalendarIcon className="w-4 h-4 min-w-4 min-h-4" />
						{value?.after ? (
							value.before ? (
								<>
									{formatDateAsLocale(value.after)} - {formatDateAsLocale(value.before)}
								</>
							) : (
								formatDateAsLocale(value.after)
							)
						) : (
							<span>FILTRE POR PERÍODO</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="w-full px-2 py-2">
						<Select onValueChange={(v) => handleChange({ after: value?.after, before: value?.before, field: v })}>
							<SelectTrigger>
								<SelectValue placeholder="SELECIONE UM PARÂMETRO" />
							</SelectTrigger>
							<SelectContent position="popper">
								{fieldOptions.map((field) => (
									<SelectItem key={field.id} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Calendar
						locale={ptBR}
						initialFocus
						mode="range"
						defaultMonth={value?.after ? new Date(value.after) : undefined}
						selected={{ from: value?.after ? new Date(value.after) : undefined, to: value?.before ? new Date(value.before) : undefined }}
						onSelect={(v) => {
							console.log(v);
							handleChange({ after: v?.from?.toISOString(), before: v?.to?.toISOString(), field: value?.field });
						}}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
