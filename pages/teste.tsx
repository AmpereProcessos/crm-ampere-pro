import { useSession } from "@/app/providers/SessionProvider";
import DateInput from "@/components/Inputs/DateInput";
import OpportunitiesKanbanModePageV2 from "@/components/Opportunities/OpportunitiesKanbanModePageV2";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { useOpportunitiesKanbanView, useOpportunitiesQueryDefinitions } from "@/utils/queries/opportunities";
import { Loader2 } from "lucide-react";
import { ComponentType, useEffect, useState } from "react";
import { BarChart, XAxis, CartesianGrid, YAxis, Bar } from "recharts";
import dayjs from "dayjs";
import { IconType } from "react-icons";
import { renderIconWithClassNames } from "@/lib/methods/rendering";
import { cn } from "@/lib/utils";
import { formatDateOnInputChange } from "@/lib/methods/formatting";

// JSDoc typing for the function:
/**
 * 
 * @param {string | undefined} value 
 * @param {string | Date} returnType // 'string' or 'date'
 * @param {'natural' | "start" | "end"} type 
 * @returns {string | Date | null}
 */
function formatDateOnInputChange(value: string | undefined, returnType: 'string' | 'date', type: 'natural' | 'start' | 'end') {
	// The value coming from input change can be either string or undefined
	// First, checking if the value is either empty or undefined
	if (value === '' || value === undefined || value === null) return null

	const isFullISO = value.includes('T') && value.includes('Z')
	const isDateTimeOnly = value.includes('T') && !value.includes('Z')
	console.log("Formatting date on input change", {
		value,
		returnType,
		type,
		isFullISO,
		isDateTimeOnly,
	})
	// Then, since we know it's not empty, we can define the default date we will be working with
	// If the value includes "T", we can assume it comes with datetime definition, we only complement it with "00.000Z" to make a valid ISO string
	// If not, we define 12:00:00.000Z as "midday" for the coming input date (which already is YYYY-MM-DD)
	const defaultDateStringAsISO = isFullISO ? value : isDateTimeOnly ? `${value}:00.000Z` : `${value}T12:00:00.000Z`;

	const isValid = dayjs(defaultDateStringAsISO).isValid()
	if (!isValid) return null

	if (type === 'natural') {
		// If type is natural, we return the default date without any further treatment
		if (returnType === 'string') return defaultDateStringAsISO;
		if (returnType === 'date') return dayjs(defaultDateStringAsISO).toDate();
	}

	if (type === 'start') {
		if (returnType === 'string') return dayjs(defaultDateStringAsISO).startOf('day').toISOString();
		if (returnType === 'date') return dayjs(defaultDateStringAsISO).startOf('day').toDate();
	}

	if (type === 'end') {
		if (returnType === 'string') return dayjs(defaultDateStringAsISO).endOf('day').toISOString();
		if (returnType === 'date') return dayjs(defaultDateStringAsISO).endOf('day').toDate();
	}

	return null
}

// JSDoc typing for the function:
/**
 * 
 * @param {string | undefined} value 
 * @returns {string | null}
 */
function formatDateForInputValue(value: string | undefined): string | undefined {
	if (value === '' || value === undefined || value === null) return undefined
	const date = dayjs(value)
	const year = date.year().toString().padStart(4, '0')
	const month = (date.month() + 1).toString().padStart(2, '0')
	const day = date.day().toString().padStart(2, '0')
	return `${year}-${month}-${day}`

}


function Teste() {
	const [date, setDate] = useState<string | null>(null);
	console.log("DATA:", date)
	return (
		<FullScreenWrapper>
			<NewDateInput label="DATA (NORMAL)" value={formatDateForInputValue(date ?? undefined)} handleChange={(value) => {
				const formattedDate = formatDateOnInputChange(value, 'string', 'natural')
				console.log("natural change", {
					value,
					formattedDate
				})
				setDate(formattedDate as string)
			}} />
			<NewDateInput label="DATA (START)" value={formatDateForInputValue(date ?? undefined)} handleChange={(value) => {
				const formattedDate = formatDateOnInputChange(value, 'string', 'start')
				console.log("start change", {
					value,
					formattedDate
				})
				setDate(formattedDate as string)
			}} />
			<NewDateInput label="DATA (END)" value={formatDateForInputValue(date ?? undefined)} handleChange={(value) => {
				const formattedDate = formatDateOnInputChange(value, 'string', 'end')
				console.log("end change", {
					value,
					formattedDate
				})
				setDate(formattedDate as string)
			}} />
		</FullScreenWrapper>
	);
}

export default Teste;



type DateInputProps = {
	width?: string;
	label: string;
	labelIcon?: ComponentType | IconType;
	labelIconClassName?: string;
	labelClassName?: string;
	holderClassName?: string;
	showLabel?: boolean;
	value: string | undefined;
	editable?: boolean;
	handleChange: (value: string | undefined) => void;
};
function NewDateInput({
	width,
	label,
	labelIcon,
	labelIconClassName,
	labelClassName,
	holderClassName,
	showLabel = true,
	value,
	editable = true,
	handleChange,
}: DateInputProps) {
	const [holder, setHolder] = useState<string>(value ? formatDateForInputValue(value) ?? '' : '')
	const inputIdentifier = label.toLowerCase().replace(' ', '_');

	const isValueValid = holder && holder.trim().length > 0 ? dayjs(holder).isValid() : true
	useEffect(() => {
		handleChange(formatDateOnInputChange(holder, 'string', 'natural') ?? undefined)
	}, [holder])

	return (
		<div className={`flex w-full flex-col gap-1 lg:w-[${width ? width : '350px'}]`}>
			{showLabel ? (
				labelIcon ? (
					<label className={cn('flex items-center gap-1 font-medium text-primary/80 text-sm tracking-tight', labelClassName)} htmlFor={inputIdentifier}>
						{renderIconWithClassNames(labelIcon, labelIconClassName)}
						{label}
					</label>
				) : (
					<label className={cn('font-medium text-primary/80 text-sm tracking-tight', labelClassName)} htmlFor={inputIdentifier}>
						{label}
					</label>
				)
			) : null}
			<input
				className={cn(
					'w-full rounded-md border border-primary/20 p-3 text-sm shadow-md outline-none duration-500 ease-in-out placeholder:italic focus:border-primary',
					holderClassName,
					!isValueValid && 'border-red-500'
				)}
				id={inputIdentifier}
				onChange={(e) => {
					setHolder(e.target.value);
				}}
				onReset={() => setHolder('')}
				readOnly={!editable}
				type="date"
				value={holder}
			/>
		</div>
	);
}