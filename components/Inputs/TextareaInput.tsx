import { cn } from "@/lib/utils";
import React from "react";

type TextareaInputProps = {
	label: string;
	value: string;
	labelClassName?: string;
	inputClassName?: string;
	placeholder: string;
	editable?: boolean;
	handleChange: (value: string) => void;
};
function TextareaInput({ label, value, labelClassName, inputClassName, placeholder, editable = true, handleChange }: TextareaInputProps) {
	return (
		<div className="flex w-full flex-col rounded-md border border-gray-300 shadow-sm">
			<h1 className={cn("font w-full rounded-tl-md rounded-tr-md bg-primary p-1 text-center text-xs font-bold text-primary-foreground", labelClassName)}>{label}</h1>
			<textarea
				disabled={!editable}
				placeholder={placeholder}
				value={value}
				onChange={(e) => {
					handleChange(e.target.value);
				}}
				className={cn("min-h-[65px] w-full resize-none rounded-bl-md rounded-br-md bg-gray-50 p-3 text-center text-xs font-medium text-gray-600 outline-none", inputClassName)}
			/>
		</div>
	);
}

export default TextareaInput;
