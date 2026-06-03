import type { InteractiveFilterOption, InteractiveFilterSortValue } from "@/components/ui/interactive-filter";
import { formatDateAsLocale, formatToMoney } from "@/lib/methods/formatting";

export function formatInteractiveOptionSummary<T extends string | number>(options: InteractiveFilterOption<T>[], values: T[], emptyLabel = "TODOS") {
	if (values.length === 0) return emptyLabel;
	const labels = options.filter((option) => values.includes(option.value)).map((option) => option.label);
	if (labels.length === 0) return `${values.length} selecionado(s)`;
	if (labels.length <= 2) return labels.join(", ");
	return `${labels.length} selecionado(s)`;
}

export function formatInteractiveSingleOptionSummary<T extends string | number>(options: InteractiveFilterOption<T>[], value: T | null | undefined, emptyLabel = "TODOS") {
	if (value === null || value === undefined) return emptyLabel;
	return options.find((option) => option.value === value)?.label ?? String(value);
}

export function formatInteractiveDateRangeSummary(after?: Date | string | null, before?: Date | string | null, emptyLabel = "TODO PERIODO") {
	if (!after && !before) return emptyLabel;
	if (after && before) return `${formatDateAsLocale(after)} a ${formatDateAsLocale(before)}`;
	if (after) return `A partir de ${formatDateAsLocale(after)}`;
	return `Até ${formatDateAsLocale(before)}`;
}

export function formatInteractiveNumberRangeSummary(min?: number | null, max?: number | null, emptyLabel = "TODOS") {
	if (min == null && max == null) return emptyLabel;
	if (min != null && max != null) return `${formatToMoney(min)} a ${formatToMoney(max)}`;
	if (min != null) return `A partir de ${formatToMoney(min)}`;
	return `Até ${formatToMoney(max ?? 0)}`;
}

export function formatInteractiveCountSummary(values: unknown[] | null | undefined, emptyLabel = "TODOS") {
	if (!values || values.length === 0) return emptyLabel;
	return `${values.length} selecionado(s)`;
}

export function formatInteractiveSortFieldSummary<T extends string>(fieldOptions: InteractiveFilterOption<T>[], field: T, fallbackLabel = "PADRAO") {
	return fieldOptions.find((option) => option.value === field)?.label ?? fallbackLabel;
}

export function isInteractiveSortActive<T extends string>(value: InteractiveFilterSortValue<T>, defaults: InteractiveFilterSortValue<T>) {
	return value.field !== defaults.field || value.direction !== defaults.direction;
}
