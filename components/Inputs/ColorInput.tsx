import { ChevronDown } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// Quick access colors - most commonly used, primary colors
const QUICK_COLORS = [
	"#FF5733", // Red-Orange
	"#33A1FF", // Sky Blue
	"#33FF57", // Lime Green
	"#FFD700", // Gold
	"#FF33A1", // Pink
	"#9B59B6", // Purple
	"#2ECC71", // Emerald
	"#E74C3C", // Red
];

// Extended color palette organized by hue families
const EXTENDED_COLORS = [
	// Reds
	"#FF0000",
	"#DC143C",
	"#B22222",
	"#8B0000",
	"#FF6347",
	"#FF4500",
	// Oranges
	"#FFA500",
	"#FF8C00",
	"#FF7F50",
	"#FF6B35",
	"#E67E22",
	"#D35400",
	// Yellows
	"#FFFF00",
	"#FFD700",
	"#FFEB3B",
	"#FFC107",
	"#F1C40F",
	"#F39C12",
	// Greens
	"#00FF00",
	"#32CD32",
	"#228B22",
	"#006400",
	"#2ECC71",
	"#27AE60",
	"#1ABC9C",
	"#16A085",
	// Blues
	"#0000FF",
	"#1E90FF",
	"#4169E1",
	"#000080",
	"#3498DB",
	"#2980B9",
	"#00CED1",
	"#5DADE2",
	// Purples
	"#800080",
	"#9B59B6",
	"#8E44AD",
	"#663399",
	"#6A5ACD",
	"#7D3C98",
	// Pinks
	"#FF1493",
	"#FF69B4",
	"#DB7093",
	"#C71585",
	"#E91E63",
	"#AD1457",
	// Neutrals
	"#000000",
	"#2C3E50",
	"#34495E",
	"#7F8C8D",
	"#95A5A6",
	"#BDC3C7",
	"#ECF0F1",
	"#FFFFFF",
];

type ColorInputProps = {
	width?: string;
	label: string;
	labelClassName?: string;
	showLabel?: boolean;
	value: string | null | undefined;
	editable?: boolean;
	handleChange: (value: string | undefined) => void;
};

function ColorInput({ width, label, labelClassName, showLabel = true, value, editable = true, handleChange }: ColorInputProps) {
	const inputIdentifier = label.toLowerCase().replace(/ /g, "_");
	const colorInputRef = useRef<HTMLInputElement>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const handleColorSelect = (color: string) => {
		handleChange(color);
		setPopoverOpen(false);
	};

	const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleChange(e.target.value);
	};

	const openNativeColorPicker = () => {
		colorInputRef.current?.click();
	};

	const handleClear = () => {
		handleChange(undefined);
		setPopoverOpen(false);
	};

	return (
		<div className={`flex w-full flex-col gap-1 lg:w-[${width ? width : "350px"}]`}>
			{showLabel ? (
				<label className={cn("font-medium text-primary/80 text-sm tracking-tight", labelClassName)} htmlFor={inputIdentifier}>
					{label}
				</label>
			) : null}

			<div className="flex w-full items-center gap-2 rounded-md border border-primary/20 p-3 shadow-md">
				{/* Current selected color preview */}
				<div
					className="flex h-5 w-5 min-w-5 items-center justify-center rounded-full border border-primary/30"
					style={{ backgroundColor: value || "transparent" }}
				>
					{!value && <span className="text-xs text-primary/50">?</span>}
				</div>

				{/* Quick access colors */}
				<div className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
					{QUICK_COLORS.map((color) => (
						<button
							key={color}
							type="button"
							disabled={!editable}
							onClick={() => handleColorSelect(color)}
							className={cn(
								"flex h-5 w-5 min-w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
								value === color ? "border-primary scale-110" : "border-transparent hover:scale-105 hover:border-primary/30",
								!editable && "cursor-not-allowed opacity-50",
							)}
							style={{ backgroundColor: color }}
							title={color}
						>
							{value === color && <HiCheck className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" size={14} />}
						</button>
					))}
				</div>

				{/* More colors popover */}
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							disabled={!editable}
							className={cn(
								"flex items-center gap-1 rounded-md border border-primary/20 text-xs font-medium text-primary/70 transition-colors hover:bg-primary/10",
								!editable && "cursor-not-allowed opacity-50",
							)}
						>
							<ChevronDown className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-3" align="end">
						<div className="flex flex-col gap-3">
							{/* Header */}
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium text-primary">PALETA DE CORES</p>
								{value && (
									<button type="button" onClick={handleClear} className="text-xs text-red-500 hover:text-red-700">
										LIMPAR
									</button>
								)}
							</div>

							{/* Extended color grid */}
							<div className="grid grid-cols-8 gap-2">
								{EXTENDED_COLORS.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => handleColorSelect(color)}
										className={cn(
											"flex h-[28px] w-[28px] items-center justify-center rounded-md border-2 transition-all duration-200",
											value === color ? "border-primary scale-110" : "border-transparent hover:scale-105 hover:border-primary/30",
										)}
										style={{ backgroundColor: color }}
										title={color}
									>
										{value === color && <HiCheck className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" size={14} />}
									</button>
								))}
							</div>

							{/* Divider */}
							<div className="h-px w-full bg-primary/20" />

							{/* Custom color section */}
							<div className="flex items-center gap-2">
								<p className="text-xs font-medium text-primary/70">COR PERSONALIZADA:</p>
								<button
									type="button"
									onClick={openNativeColorPicker}
									className="flex h-[28px] flex-1 items-center justify-center gap-2 rounded-md border border-dashed border-primary/30 text-xs text-primary/60 transition-colors hover:border-primary hover:text-primary"
								>
									<div className="h-[16px] w-[16px] rounded border border-primary/30" style={{ backgroundColor: value || "#FFFFFF" }} />
									{value || "SELECIONAR"}
								</button>
								<input ref={colorInputRef} type="color" value={value || "#000000"} onChange={handleNativeColorChange} className="invisible absolute h-0 w-0" />
							</div>

							{/* Current value display */}
							{value && (
								<div className="flex items-center gap-2 rounded-md bg-primary/5 p-2">
									<div className="h-[20px] w-[20px] rounded border border-primary/30" style={{ backgroundColor: value }} />
									<p className="text-xs font-mono text-primary/80">{value.toUpperCase()}</p>
								</div>
							)}
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

export default ColorInput;
