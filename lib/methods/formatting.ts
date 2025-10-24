import type { TInverter, TModule, TProductItem } from "@/utils/schemas/kits.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import dayjs from "dayjs";
import { isValidNumber } from "./validation";

export function formatDateAsLocale(date?: string | Date | null, showHours = false) {
	if (!date) return null;
	if (showHours) return dayjs(date).format("DD/MM/YYYY HH:mm");
	return dayjs(date).add(3, "hour").format("DD/MM/YYYY");
}

// export function formatDateOnInputChange<T extends 'date' | 'string' | undefined>(
//   value: any,
//   returnType?: T,
//   normalizeHours = true
// ): T extends 'date' ? Date : string | null {
//   if (Number.isNaN(new Date(value).getMilliseconds())) return null as any;
//   if (!returnType || returnType === 'string') {
//     if (!normalizeHours) return new Date(value).toISOString() as any;
//     return dayjs(new Date(value)).add(3, 'hours').toISOString() as any;
//   }
//   if (!normalizeHours) return new Date(value) as any;
//   return dayjs(new Date(value)).add(3, 'hours').toDate() as any;
// }

// JSDoc typing for the function:
/**
 *
 * @param {string | undefined} value
 * @param {string | Date} returnType // 'string' or 'date'
 * @param {'natural' | "start" | "end"} type
 * @returns {string | Date | null}
 */
export function formatDateOnInputChange<T extends "string" | "date" = "string">(
	value: string | undefined,
	returnType: T = "string" as T,
	type: "natural" | "start" | "end" = "natural",
): T extends "string" ? string | null : Date | null {
	// The value coming from input change can be either string or undefined
	// First, checking if the value is either empty or undefined
	if (value === "" || value === undefined || value === null) return null;

	const isFullISO = value.includes("T") && value.includes("Z");
	const isDateTimeOnly = value.includes("T") && !value.includes("Z");

	// Then, since we know it's not empty, we can define the default date we will be working with
	// If the value includes "T", we can assume it comes with datetime definition, we only complement it with "00.000Z" to make a valid ISO string
	// If not, we define 12:00:00.000Z as "midday" for the coming input date (which already is YYYY-MM-DD)
	const defaultDateStringAsISO = isFullISO ? value : isDateTimeOnly ? new Date(value).toISOString() : `${value}T12:00:00.000Z`;

	const isValid = dayjs(defaultDateStringAsISO).isValid();
	if (!isValid) return null;

	if (type === "natural") {
		// If type is natural, we return the default date without any further treatment
		if (returnType === "string") return defaultDateStringAsISO as T extends "string" ? string | null : Date | null;
		if (returnType === "date") return dayjs(defaultDateStringAsISO).toDate() as T extends "string" ? string | null : Date | null;
	}

	if (type === "start") {
		if (returnType === "string") return dayjs(defaultDateStringAsISO).startOf("day").toISOString() as T extends "string" ? string | null : Date | null;
		if (returnType === "date") return dayjs(defaultDateStringAsISO).startOf("day").toDate() as T extends "string" ? string | null : Date | null;
	}

	if (type === "end") {
		if (returnType === "string") return dayjs(defaultDateStringAsISO).endOf("day").toISOString() as T extends "string" ? string | null : Date | null;
		if (returnType === "date") return dayjs(defaultDateStringAsISO).endOf("day").toDate() as T extends "string" ? string | null : Date | null;
	}

	return null;
}

export function formatDateTime(value: any) {
	if (!value) return;
	if (Number.isNaN(new Date(value).getMilliseconds())) return;
	return dayjs(value).format("YYYY-MM-DDTHH:mm");
}

// JSDoc typing for the function:
/**
 *
 * @param {string | undefined} value
 * @returns {string | null}
 */
export function formatDateForInputValue(value: Date | string | null | undefined, type: "default" | "datetime" = "default"): string | undefined {
	if (value === "" || value === undefined || value === null) return undefined;
	const date = dayjs(value);
	const yearValue = date.year();
	const monthValue = date.month();
	const dayValue = date.date();

	const year = yearValue.toString().padStart(4, "0");
	const month = (monthValue + 1).toString().padStart(2, "0");
	const day = dayValue.toString().padStart(2, "0");

	if (type === "datetime") {
		const hourValue = date.hour();
		const minuteValue = date.minute();
		const hour = hourValue.toString().padStart(2, "0");
		const minute = minuteValue.toString().padStart(2, "0");
		return `${year}-${month}-${day}T${hour}:${minute}`;
	}

	return `${year}-${month}-${day}`;
}

export function formatToDateTime(date: string | null) {
	if (!date) return "";
	return dayjs(date).format("DD/MM/YYYY HH:mm");
}
export function formatDateQuery(date: string, type: "start" | "end", returnAs?: "string" | "date") {
	if (type === "start") {
		if (returnAs === "date") return dayjs(date).startOf("day").subtract(3, "hour").toDate() as Date;
		return dayjs(date).startOf("day").subtract(3, "hour").toISOString();
	}
	if (type === "end") {
		if (returnAs === "date") return dayjs(date).endOf("day").subtract(3, "hour").toDate() as Date;
		return dayjs(date).endOf("day").subtract(3, "hour").toISOString();
	}
	return dayjs(date).startOf("day").subtract(3, "hour").toISOString();
}
export function formatNameAsInitials(name: string) {
	const splittedName = name.split(" ");
	const firstLetter = splittedName[0][0];
	let secondLetter: string | undefined;
	if (["DE", "DA", "DO", "DOS", "DAS"].includes(splittedName[1])) secondLetter = splittedName[2] ? splittedName[2][0] : "";
	else secondLetter = splittedName[1] ? splittedName[1][0] : "";
	if (!(firstLetter || secondLetter)) return "N";
	return firstLetter + secondLetter;
}
export function formatToMoney(value: string | number, tag = "R$") {
	return `${tag} ${Number(value).toLocaleString("pt-br", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}
export function formatDecimalPlaces(value: string | number, minPlaces?: number, maxPlaces?: number) {
	return Number(value).toLocaleString("pt-br", {
		minimumFractionDigits: minPlaces != null && minPlaces !== undefined ? minPlaces : 0,
		maximumFractionDigits: maxPlaces != null && maxPlaces !== undefined ? maxPlaces : 2,
	});
}
export function formatInverterStr(inverter: TInverter, showModel?: boolean) {
	if (showModel) return `${inverter.qtde}x ${inverter.modelo} (${inverter.fabricante})`;
	return `${inverter.qtde}x ${inverter.fabricante} ${inverter.potencia}W`;
}
export function formatModuleStr(module: TModule, showModel?: boolean) {
	if (showModel) return `${module.qtde}x ${module.modelo} (${module.fabricante})`;
	return `${module.qtde}x ${module.fabricante} ${module.potencia}W`;
}
export function formatProductStr(product: TProductItem, showModel?: boolean) {
	if (showModel) return `${product.qtde}x ${product.modelo} (${product.fabricante})`;
	return `${product.qtde}x ${product.fabricante}${product.potencia ? ` ${product.potencia}W` : ""}`;
}
export function formatLocation({ location, includeUf, includeCity }: { location: TOpportunity["localizacao"]; includeUf?: boolean; includeCity?: boolean }) {
	let addressStr = "";
	if (includeCity && location.cidade) addressStr = addressStr + `${location.cidade}`;
	if (includeUf && location.uf) addressStr = addressStr + ` (${location.uf}), `;
	if (!location.endereco) return "";
	addressStr = addressStr + location.endereco;
	if (location.numeroOuIdentificador) addressStr = addressStr + `, Nº ${location.numeroOuIdentificador}`;
	if (location.bairro) addressStr = addressStr + `, ${location.bairro}`;
	addressStr += ".";
	return addressStr.toUpperCase();
}
export function formatWithoutDiacritics(string: string, useUpperCase?: boolean) {
	if (!useUpperCase) return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

	return string
		.toUpperCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

export function formatToSlug(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remove accents
		.replace(/[^a-z0-9\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
		.trim();
}

export function formatAsValidNumber(value: number | null | undefined) {
	if (isValidNumber(value)) return value as number;
	return null;
}
