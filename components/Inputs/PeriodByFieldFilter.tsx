"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type PeriodByFieldFilterValue = { after?: string; before?: string; field?: string };
type PeriodByFieldFilterProps = {
	value: PeriodByFieldFilterValue;
	handleChange: (value: PeriodByFieldFilterValue) => void;
	fieldOptions: { id: number; label: string; value: string }[];
	holderClassName?: string;
};
export function PeriodByFieldFilter({ value, handleChange, fieldOptions, holderClassName }: PeriodByFieldFilterProps) {
	return (
		<div className={cn("grid gap-2")}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline-solid"}
						className={cn(
							"w-full justify-start min-h-[46.6px] text-left font-normal px-3 flex items-center gap-2 bg-background darK:bg-[#fff]",
							!value && "text-muted-foreground",
							holderClassName,
						)}
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
