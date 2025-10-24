import React, { type ComponentType } from "react";
import type { IconType } from "react-icons";
import { renderIconWithClassNames } from "@/lib/methods/rendering";
import { cn } from "@/lib/utils";

type TextInputProps = {
	width?: string;
	label: string;
	labelIcon?: ComponentType | IconType;
	labelIconClassName?: string;
	labelClassName?: string;
	holderClassName?: string;
	showLabel?: boolean;
	value: string;
	placeholder: string;
	editable?: boolean;
	handleChange: (value: string) => void;
	handleOnBlur?: () => void;
};
function TextInput({
	width,
	label,
	labelIcon,
	labelIconClassName,
	labelClassName,
	holderClassName,
	showLabel = true,
	value,
	placeholder,
	editable = true,
	handleChange,
	handleOnBlur,
}: TextInputProps) {
	const inputIdentifier = label.toLowerCase().replace(" ", "_");
	return (
		<div className={`flex w-full flex-col gap-1 lg:w-[${width ? width : "350px"}]`}>
			{showLabel ? (
				labelIcon ? (
					<label className={cn("flex items-center gap-2 font-medium text-primary/80 text-sm tracking-tight", labelClassName)} htmlFor={inputIdentifier}>
						{renderIconWithClassNames(labelIcon, labelIconClassName)}
						{label}
					</label>
				) : (
					<label className={cn("font-medium text-primary/80 text-sm tracking-tight", labelClassName)} htmlFor={inputIdentifier}>
						{label}
					</label>
				)
			) : null}

			<input
				className={cn(
					"w-full rounded-md border border-primary/20 p-3 text-sm shadow-md outline-hidden duration-500 ease-in-out placeholder:italic focus:border-primary",
					holderClassName,
				)}
				id={inputIdentifier}
				onBlur={() => {
					if (handleOnBlur) handleOnBlur();
					else return;
				}}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={placeholder}
				readOnly={!editable}
				type="text"
				value={value}
			/>
		</div>
	);
}

export default TextInput;
