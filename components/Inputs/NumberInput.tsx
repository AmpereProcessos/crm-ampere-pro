import { formatAsValidNumber } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import React from "react";
type NumberInputProps = {
	width?: string;
	label: string;
	labelClassName?: string;
	holderClassName?: string;
	showLabel?: boolean;
	value: number | null | undefined;
	editable?: boolean;
	placeholder: string;
	handleChange: (value: number) => void;
};
function NumberInput({ width, label, labelClassName, holderClassName, showLabel = true, value, editable = true, placeholder, handleChange }: NumberInputProps) {
	const inputIdentifier = label.toLowerCase().replace(" ", "_");
	return (
		<div className={`flex w-full flex-col gap-1 lg:w-[${width ? width : "350px"}]`}>
			{showLabel ? (
				<label htmlFor={inputIdentifier} className={cn("text-sm font-medium tracking-tight text-primary/80", labelClassName)}>
					{label}
				</label>
			) : null}

			<input
				readOnly={!editable}
				value={formatAsValidNumber(value)?.toString() ?? ""}
				onChange={(e) => handleChange(Number(e.target.value))}
				id={inputIdentifier}
				type="number"
				step={0.01}
				placeholder={placeholder}
				className={cn(
					"w-full rounded-md dark:bg-[#121212] border border-primary/20 p-3 text-sm shadow-sm outline-none duration-500 ease-in-out placeholder:italic focus:border-primary",
					holderClassName,
				)}
			/>
		</div>
	);
}

export default NumberInput;
