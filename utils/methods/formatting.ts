import type { InverterType, ModuleType } from "@/utils/models";
import dayjs from "dayjs";

export function formatToMoney(value: string | number, tag = "R$") {
  return `${tag} ${Number(value).toLocaleString("pt-br", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatToCPForCNPJ(value: string): string {
  const cnpjCpf = value.replace(/\D/g, "");
  if (cnpjCpf.length === 11) return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
  return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
}

export function formatToCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}

export function formatToPhone(value: string): string {
  let newValue = value;
  if (!newValue) return "";
  newValue = newValue.replace(/\D/g, "");
  newValue = newValue.replace(/(\d{2})(\d)/, "($1) $2");
  return newValue.replace(/(\d)(\d{4})$/, "$1-$2");
}

export function formatStringAsOnlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function formatPhoneAsBase(phone: string) {
  const digits = formatStringAsOnlyDigits(phone);
  if (digits.length < 10) return "";
  if (digits.length === 11 && digits[2] === "9") return digits.slice(0, 2) + digits.slice(3);
  if (digits.length === 10) return digits;
  return digits.slice(0, 2) + digits.slice(-8);
}

export function formatDateForInputValue(
  value: Date | string | null | undefined,
): string | undefined {
  if (value === "" || value === undefined || value === null) return undefined;
  const date = dayjs(value);
  const year = date.year().toString().padStart(4, "0");
  const month = (date.month() + 1).toString().padStart(2, "0");
  const day = date.date().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatUpdateSetObject(changes: object) {
  const setObject: Record<string, unknown> = {};
  for (const [tag, value] of Object.entries(changes)) {
    if (typeof value === "object" && value != null) {
      for (const [nestedTag, nestedValue] of Object.entries(value)) {
        setObject[`${tag}.${nestedTag}`] = nestedValue;
      }
    } else {
      setObject[tag] = value;
    }
  }
  return setObject;
}

export function getInverterStr(inverters: InverterType[], kitType: string | undefined) {
  return inverters
    .map((inverter) => {
      if (kitType === "PROMOCIONAL") return `${inverter.qtde}x ${inverter.modelo}`;
      const manufacturer =
        inverter.fabricante != "PERSONALIZADO" ? inverter.fabricante : inverter.modelo;
      return `${inverter.qtde}x ${manufacturer} (${inverter.modelo})`;
    })
    .join(" & ");
}

export function getModulesStr(modules: ModuleType[], kitType: string | undefined) {
  return modules
    .map((module) => {
      if (kitType === "PROMOCIONAL")
        return `${module.qtde}x ${module.modelo} (${module.potencia}W)`;
      const manufacturer =
        module.fabricante !== "PERSONALIZADO" ? module.fabricante : module.modelo;
      return `${module.qtde}x ${manufacturer} (${module.potencia}W)`;
    })
    .join(" & ");
}

export function formatLongString(value: string, size: number) {
  return value.length > size ? `${value.substring(0, size)}\u2026` : value;
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

export function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0);
}

export function getFirstDayOfYear(date: string) {
  return dayjs(date).startOf("year").toDate();
}

export function getLastDayOfYear(date: string) {
  return dayjs(date).endOf("year").toDate();
}

export function isEmpty(value: unknown) {
  return value == null || (typeof value === "string" && value.trim().length === 0);
}
