import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn, useMediaQuery } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";

type SelectOption<T> = {
	id: string | number;
	value: any;
	label: string;
};
type SelectInputBaseProps<T> = {
	width?: string;
	labelClassName?: string;
	showLabel?: boolean;
	value: T | null;
	editable?: boolean;
	resetOptionLabel: string;
	options: SelectOption<T>[] | null;
	handleChange: (value: T | null) => void;
};
// Caso showLabel seja "true", label é obrigatório
type SelectInputPropsWithLabel<T> = SelectInputBaseProps<T> & {
	showLabel?: true | undefined;
	label: string;
};

// Caso showLabel seja false ou undefined, label não é necessário
type SelectInputPropsWithoutLabel<T> = SelectInputBaseProps<T> & {
	showLabel: false;
	label?: undefined;
};
type SelectInputProps<T> = SelectInputPropsWithLabel<T> | SelectInputPropsWithoutLabel<T>;
function SelectInput<T>({ value, options, handleChange, resetOptionLabel, showLabel = true, label, labelClassName, width }: SelectInputProps<T>) {
	const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	if (isDesktop)
		return (
			<Popover open={menuIsOpen} onOpenChange={setMenuIsOpen}>
				<div className={cn("w-full flex flex-col gap-1", `lg:w-[${width ? width : "350px"}]`)}>
					{showLabel ? <label className={cn("font-sans font-bold  text-[#353432] text-start", labelClassName)}>{label}</label> : null}
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={menuIsOpen}
							className={cn("justify-between outline-none w-full text-sm font-medium min-h-[46.6px] text-[#353432] rounded-md border border-gray-200 bg-[#fff] p-3 shadow-sm")}
						>
							{value ? options?.find((option) => option.value === value)?.label : resetOptionLabel}
							<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
				</div>

				<PopoverContent className={cn("w-full p-0", `lg:w-[${width ? width : "350px"}]`)}>
					<Command>
						<CommandInput placeholder="Selecione uma opção..." className="h-9" />
						<CommandList>
							<CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
							<CommandGroup>
								{options?.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={(currentValue) => {
											handleChange((currentValue as T) === value ? null : (currentValue as T));
											setMenuIsOpen(false);
										}}
									>
										{option.label}
										<CheckIcon className={cn("ml-auto h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);

	return (
		<Drawer open={menuIsOpen} onOpenChange={setMenuIsOpen}>
			<div className={cn("w-full flex flex-col gap-1", `lg:w-[${width ? width : "350px"}]`)}>
				{showLabel ? <label className={cn("font-sans font-bold  text-[#353432] text-start", labelClassName)}>{label}</label> : null}
				<DrawerTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={menuIsOpen}
						className={cn("justify-between outline-none w-full text-sm font-medium min-h-[46.6px] text-[#353432] rounded-md border border-gray-200 bg-[#fff] p-3 shadow-sm")}
					>
						{value ? options?.find((option) => option.value === value)?.label : resetOptionLabel}
						<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DrawerTrigger>
			</div>

			<DrawerContent>
				<Command>
					<CommandInput placeholder="Selecione uma opção..." className="h-9" />
					<CommandList>
						<CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
						<CommandGroup>
							{options?.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										handleChange((currentValue as T) === value ? null : (currentValue as T));
										setMenuIsOpen(false);
									}}
								>
									{option.label}
									<CheckIcon className={cn("ml-auto h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</DrawerContent>
		</Drawer>
	);
}

export default SelectInput;
