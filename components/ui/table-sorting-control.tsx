"use client";

import React from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export type SortOption = {
	value: string;
	label: string;
};

export type SortConfig<T> = {
	field: T;
	direction: SortDirection;
};

type TableSortingControlProps<T> = {
	sortConfig: SortConfig<T>;
	setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T>>>;
	sortOptions: SortOption[];
	title?: string;
	accentColor?: string;
	size?: "sm" | "md" | "lg";
	showCurrentSelection?: boolean;
};

export function TableSortingControl<T>({
	sortConfig,
	setSortConfig,
	sortOptions,
	title = "Ordenação",
	accentColor = "#15599a",
	size = "md",
	showCurrentSelection = true,
}: TableSortingControlProps<T>) {
	const handleFieldChange = (field: T) => {
		setSortConfig((prev) => ({
			...prev,
			field,
		}));
	};

	const handleDirectionToggle = () => {
		setSortConfig((prev) => ({
			...prev,
			direction: prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const sizeClasses = {
		sm: {
			container: "p-3",
			title: "text-xs",
			label: "text-xs",
			select: "w-40 h-8 text-xs",
			button: "h-8 px-2 text-xs",
			status: "text-xs px-2 py-1",
		},
		md: {
			container: "p-4",
			title: "text-sm",
			label: "text-xs",
			select: "w-48 h-9 text-sm",
			button: "h-9 px-3 text-sm",
			status: "text-xs px-3 py-2",
		},
		lg: {
			container: "p-5",
			title: "text-base",
			label: "text-sm",
			select: "w-56 h-10 text-sm",
			button: "h-10 px-4 text-sm",
			status: "text-sm px-4 py-3",
		},
	};

	const currentSize = sizeClasses[size];

	return (
		<div className={cn("mt-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm", currentSize.container)}>
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
						<span className={cn("font-semibold text-gray-700 uppercase tracking-wider", currentSize.title)}>{title}</span>
					</div>
				</div>

				<div className="flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-2">
						<span className={cn("font-medium text-gray-600 uppercase tracking-wide", currentSize.label)}>Ordenar por:</span>
						<Select value={sortConfig.field as string} onValueChange={(value) => handleFieldChange(value as T)}>
							<SelectTrigger
								className={cn("border-gray-300 bg-white hover:border-[${accentColor}] focus:border-[${accentColor}] focus:ring-1 transition-colors", currentSize.select)}
								style={
									{
										"--tw-ring-color": `${accentColor}33`,
									} as React.CSSProperties
								}
							>
								<SelectValue placeholder="Selecione um campo" />
							</SelectTrigger>
							<SelectContent className="border-gray-200 shadow-lg">
								{sortOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
										className="hover:bg-opacity-10 focus:bg-opacity-10"
										style={
											{
												"--hover-bg": `${accentColor}1A`,
												"--focus-bg": `${accentColor}1A`,
											} as React.CSSProperties
										}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<span className={cn("font-medium text-gray-600 uppercase tracking-wide", currentSize.label)}>Direção:</span>
						<Button
							onClick={handleDirectionToggle}
							variant="outline"
							size={size === "sm" ? "xs" : size === "md" ? "sm" : "default"}
							className={cn("border-gray-300 bg-white hover:text-white hover:border-[${accentColor}] transition-all duration-200", currentSize.button)}
							style={
								{
									"--hover-bg": accentColor,
								} as React.CSSProperties
							}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = accentColor;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "white";
							}}
						>
							<div className="flex items-center gap-2">
								{sortConfig.direction === "asc" ? (
									<>
										<FaSortAmountUp className="w-4 h-4" />
										<span className="font-medium">Crescente</span>
									</>
								) : (
									<>
										<FaSortAmountDown className="w-4 h-4" />
										<span className="font-medium">Decrescente</span>
									</>
								)}
							</div>
						</Button>
					</div>

					{showCurrentSelection && (
						<div className={cn("hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-md", currentSize.status)}>
							<div className="flex items-center gap-2 text-gray-500">
								<span>Ordenando por:</span>
								<span className="font-semibold" style={{ color: accentColor }}>
									{sortOptions.find((opt) => opt.value === sortConfig.field)?.label}
								</span>
								<span className="font-semibold" style={{ color: accentColor }}>
									({sortConfig.direction === "asc" ? "↑" : "↓"})
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Utility hook for managing sort state
export function useSorting<T>(initialField: T, initialDirection: SortDirection = "asc") {
	const [sortConfig, setSortConfig] = React.useState<SortConfig<T>>({
		field: initialField,
		direction: initialDirection,
	});

	return {
		sortConfig,
		setSortConfig,
		sortField: sortConfig.field as T,
		sortDirection: sortConfig.direction,
	};
}

// Utility function for sorting arrays
export function applySorting<T>(data: T[], sortConfig: SortConfig<T>, getFieldValue: (item: T, field: T) => string | number): T[] {
	return [...data].sort((a, b) => {
		const aValue = getFieldValue(a, sortConfig.field);
		const bValue = getFieldValue(b, sortConfig.field);

		if (sortConfig.direction === "asc") {
			if (typeof aValue === "string" && typeof bValue === "string") {
				return aValue.localeCompare(bValue);
			}
			return (aValue as number) - (bValue as number);
		}
		if (typeof aValue === "string" && typeof bValue === "string") {
			return bValue.localeCompare(aValue);
		}
		return (bValue as number) - (aValue as number);
	});
}
