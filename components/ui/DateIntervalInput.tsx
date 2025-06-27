import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DateIntervalInputProps = {
	label: string;
	labelClassName?: string;
	className?: string;
	value: { after?: Date; before?: Date };
	handleChange: (value: { after?: Date; before?: Date }) => void;
};
function DateIntervalInput({ label, labelClassName, className, value, handleChange }: DateIntervalInputProps) {
	return (
		<div className={cn("flex flex-col gap-1")}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-full justify-start rounded-md border border-primary/20 bg-[#fff] text-left text-sm font-normal ease-in-out focus:border-primary dark:bg-[#121212]",
							!value.after && !value.before && "text-muted-foreground",
							className,
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value?.after ? (
							value.before ? (
								<>
									{format(value.after, "dd/MM/yyyy", { locale: ptBR })} - {format(value.before, "dd/MM/yyyy", { locale: ptBR })}
								</>
							) : (
								format(value.after, "dd/MM/yyyy", { locale: ptBR })
							)
						) : (
							<span>Escolha uma data</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						initialFocus
						mode="range"
						locale={ptBR}
						defaultMonth={value?.after}
						selected={{ from: value.after, to: value.before }}
						onSelect={(value) => handleChange({ after: value?.from, before: value?.to })}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default DateIntervalInput;
