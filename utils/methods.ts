import type { TUserSession } from "@/lib/auth/session";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import genFactors from "../utils/json-files/generationFactors.json" with { type: "json" };
import type { orientations } from "./constants";
import type { IClient, IKit, IRepresentative, IResponsible, ISession, InverterType, ModuleType } from "./models";
import type { TModule, TProductItem } from "./schemas/kits.schema";
import { TOpportunity } from "./schemas/opportunity.schema";
import type { TProposal } from "./schemas/proposal.schema";
import { TTechnicalAnalysis } from "./schemas/technical-analysis.schema";

type ViaCEPSuccessfulReturn = {
	cep: string;
	logradouro: string;
	complemento: string;
	bairro: string;
	localidade: string;
	uf: string;
	ibge: string;
	gia: string;
	ddd: string;
	siafi: string;
};

type GetMaxHomologationPowerEstimationParams = {
	group: TProposal["premissas"]["grupoInstalacao"];
	avgConsumption: number;
};
export function getMaxHomologationPowerEstimation({ group, avgConsumption }: GetMaxHomologationPowerEstimationParams) {
	if (group == "RESIDENCIAL") {
		const CS = 0.68;
		const convertionFactor = 115.2 / CS;
		const maxHomologationPower = avgConsumption / convertionFactor;
		return maxHomologationPower;
	}
	if (group == "COMERCIAL") {
		const CS = 0.69;
		const convertionFactor = 115.2 / CS;
		const maxHomologationPower = avgConsumption / convertionFactor;
		return maxHomologationPower;
	}
	if (group == "INDUSTRIAL") {
		const CS = 0.8;
		const convertionFactor = 115.2 / CS;
		const maxHomologationPower = avgConsumption / convertionFactor;
		return maxHomologationPower;
	}
	if (group == "RURAL") {
		const CS = 0.59;
		const convertionFactor = 115.2 / CS;
		const maxHomologationPower = avgConsumption / convertionFactor;
		return maxHomologationPower;
	}
	const CS = 0.68;
	const convertionFactor = 115.2 / CS;
	const maxHomologationPower = avgConsumption / convertionFactor;
	return maxHomologationPower;
}
export function isFile(variable: any): variable is File {
	return variable instanceof File;
}
export function getPeakPotByModules(modules: TModule[] | undefined) {
	if (modules) {
		var peakPotSum = 0;
		for (let i = 0; i < modules.length; i++) {
			peakPotSum = peakPotSum + modules[i].qtde * modules[i].potencia;
		}
		return peakPotSum / 1000;
	}
	return 0;
}
export function getModulesQty(products: TProductItem[] | undefined) {
	if (!products) return 0;
	const qty = products.filter((p) => p.categoria == "MÓDULO").reduce((acc, current) => acc + current.qtde, 0);
	return qty;
}
export function formatToMoney(value: string | number, tag = "R$") {
	return `${tag} ${Number(value).toLocaleString("pt-br", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}
export function getEstimatedGen(
	peakPower: number,
	city: string | undefined | null,
	uf: string | undefined | null,
	orientation?: (typeof orientations)[number],
): number {
	if (!(city && uf)) return 127 * peakPower;
	const cityFactor = genFactors.find((genFactor) => genFactor.CIDADE == city && genFactor.UF == uf);
	if (!cityFactor) return 127 * peakPower;

	var genFactor;
	if (orientation) genFactor = cityFactor[orientation];
	else genFactor = cityFactor.ANUAL;

	if (genFactor) return genFactor * peakPower;
	return 127 * peakPower;
}
export async function getCEPInfo(cep: string): Promise<ViaCEPSuccessfulReturn | null> {
	try {
		const { data } = await axios.get(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`);
		console.log(data);
		if (data.erro) throw new Error("Erro");
		return data;
	} catch (error) {
		toast.error("Erro ao buscar informações à partir do CEP.");
		return null;
	}
}
export function formatToCPForCNPJ(value: string): string {
	const cnpjCpf = value.replace(/\D/g, "");

	if (cnpjCpf.length === 11) {
		return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
	}

	return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
}
export function formatToCEP(value: string): string {
	const cep = value
		.replace(/\D/g, "")
		.replace(/(\d{5})(\d)/, "$1-$2")
		.replace(/(-\d{3})\d+?$/, "$1");

	return cep;
}
export function formatToPhone(value: string): string {
	let newValue = value;
	if (!newValue) return "";
	newValue = newValue.replace(/\D/g, "");
	newValue = newValue.replace(/(\d{2})(\d)/, "($1) $2");
	newValue = newValue.replace(/(\d)(\d{4})$/, "$1-$2");
	return newValue;
}

export function formatStringAsOnlyDigits(s: string) {
	return s.replace(/[^0-9]/g, "");
}

// Retorna sempre a “base” comparável: DDD (2) + últimos 8 dígitos
export function formatPhoneAsBase(phone: string) {
	const d = formatStringAsOnlyDigits(phone);
	if (d.length < 10) return ""; // inválido
	// Se 11 dígitos e tiver '9' logo após o DDD, remove esse '9'
	if (d.length === 11 && d[2] === "9") {
		return d.slice(0, 2) + d.slice(3); // remove o 3º dígito
	}
	// Se 10 dígitos (fixo/antigo), já é a base
	if (d.length === 10) return d;
	// Outros comprimentos: tente usar DDD + últimos 8
	return d.slice(0, 2) + d.slice(-8);
}

// JSDoc typing for the function:
/**
 *
 * @param {string | undefined} value
 * @returns {string | null}
 */
export function formatDateForInputValue(value: Date | string | null | undefined): string | undefined {
	if (value === "" || value === undefined || value === null) return undefined;
	const date = dayjs(value);
	const yearValue = date.year();
	const monthValue = date.month();
	const dayValue = date.date();

	const year = yearValue.toString().padStart(4, "0");
	const month = (monthValue + 1).toString().padStart(2, "0");
	const day = dayValue.toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatUpdateSetObject(changes: object) {
	const setObj: Record<string, any> = {};
	const entries = Object.entries(changes);
	for (const entry of entries) {
		if (typeof entry[1] === "object" && entry[1] != null) {
			const tag = entry[0];
			const insideEntries = Object.entries(entry[1]);
			for (const insideEntry of insideEntries) {
				setObj[`${tag}.${insideEntry[0]}`] = insideEntry[1];
			}
		} else {
			const tag = entry[0];
			const value = entry[1];
			setObj[tag] = value;
		}
	}

	return setObj;
}
// STR functions
export function getInverterStr(inverters: InverterType[], kitType: string | undefined) {
	let str = "";
	if (kitType === "PROMOCIONAL") {
		for (let i = 0; i < inverters.length; i++) {
			if (i < inverters.length - 1) {
				str = str + `${inverters[i].qtde}x ${inverters[i].modelo} & `;
			} else {
				str = str + `${inverters[i].qtde}x ${inverters[i].modelo}`;
			}
		}
	} else {
		for (let i = 0; i < inverters.length; i++) {
			if (i < inverters.length - 1) {
				str =
					str +
					`${inverters[i].qtde}x ${inverters[i].fabricante != "PERSONALIZADO" ? inverters[i].fabricante : inverters[i].modelo} (${inverters[i].modelo}) & `;
			} else {
				str =
					str + `${inverters[i].qtde}x ${inverters[i].fabricante != "PERSONALIZADO" ? inverters[i].fabricante : inverters[i].modelo} (${inverters[i].modelo})`;
			}
		}
	}
	return str;
}
export function getModulesStr(modules: ModuleType[], kitType: string | undefined) {
	let str = "";
	if (kitType === "PROMOCIONAL") {
		for (let i = 0; i < modules.length; i++) {
			if (i < modules.length - 1) {
				str = `${str}${modules[i].qtde}x ${modules[i].modelo} (${modules[i].potencia}W) & `;
			} else {
				str = `${str}${modules[i].qtde}x ${modules[i].modelo} (${modules[i].potencia}W)`;
			}
		}
	} else {
		for (let i = 0; i < modules.length; i++) {
			if (i < modules.length - 1) {
				str = `${str}${modules[i].qtde}x ${modules[i].fabricante !== "PERSONALIZADO" ? modules[i].fabricante : modules[i].modelo} (${modules[i].potencia}W) & `;
			} else {
				str = `${str}${modules[i].qtde}x ${modules[i].fabricante !== "PERSONALIZADO" ? modules[i].fabricante : modules[i].modelo} (${modules[i].potencia}W)`;
			}
		}
	}

	return str;
}

export function useKitQueryPipelines(type: "TODOS OS KITS" | "KITS POR PREMISSA", payload: Record<string, any>, partnerQuery: any) {
	const currentDate = new Date().toISOString();
	switch (type) {
		case "TODOS OS KITS":
			return [
				{
					$match: {
						ativo: true,
						$or: [{ dataValidade: null }, { dataValidade: { $gt: currentDate } }],
						estruturasCompativeis: payload.structure ? payload.structure : [],
						...partnerQuery,
					},
				},
				{
					$addFields: {
						methodologyObjectId: { $toObjectId: "$idMetodologiaPrecificacao" },
					},
				},
				{
					$lookup: {
						from: "pricing-methods",
						localField: "methodologyObjectId",
						foreignField: "_id",
						as: "metodologia",
					},
				},
				{
					$sort: {
						dataInsercao: -1,
					},
				},
			];
		case "KITS POR PREMISSA":
			return [
				{
					$match: {
						ativo: true,
						$or: [{ dataValidade: null }, { dataValidade: { $gt: currentDate } }],
						estruturasCompativeis: payload.structure ? payload.structure : [],
						$and: [{ potenciaPico: { $gte: payload.min } }, { potenciaPico: { $lte: payload.max } }],
						...partnerQuery,
					},
				},
				{
					$addFields: {
						methodologyObjectId: { $toObjectId: "$idMetodologiaPrecificacao" },
					},
				},
				{
					$lookup: {
						from: "pricing-methods",
						localField: "methodologyObjectId",
						foreignField: "_id",
						as: "metodologia",
					},
				},
				{
					$sort: {
						dataInsercao: -1,
					},
				},
			];
		default:
			return [
				{
					$match: {
						ativo: true,
						$or: [{ dataValidade: null }, { dataValidade: { $gt: currentDate } }],
						...partnerQuery,
					},
				},
				{
					$addFields: {
						methodologyObjectId: { $toObjectId: "$idMetodologiaPrecificacao" },
					},
				},
				{
					$lookup: {
						from: "pricing-methods",
						localField: "methodologyObjectId",
						foreignField: "_id",
						as: "metodologia",
					},
				},
				{
					$sort: {
						dataInsercao: -1,
					},
				},
			];
	}
}
export function checkQueryEnableStatus(session: ISession | null, queryId: any) {
	if (session?.user && typeof queryId === "string") {
		return true;
	}
	return false;
}
// Hooks
export function useRepresentatives(): UseQueryResult<IRepresentative[], Error> {
	return useQuery({
		queryKey: ["representatives"],
		queryFn: async (): Promise<IRepresentative[]> => {
			try {
				const { data } = await axios.get("/api/representatives");
				return data.data;
			} catch (error) {
				if (error instanceof AxiosError) {
					const errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
				}
				if (error instanceof Error) {
					const errorMsg = error.message;
					toast.error(errorMsg);
				}
				return [];
			}
		},
		refetchOnWindowFocus: false,
	});
}

export function useClient(clientId: string, enabled: boolean): UseQueryResult<IClient, Error> {
	return useQuery<IClient, Error>({
		queryKey: ["client", clientId],
		queryFn: async () => {
			try {
				const { data } = await axios.get(`/api/clients?id=${clientId}`);
				return data.data;
			} catch (error) {
				if (error instanceof AxiosError) {
					const errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
				}
				if (error instanceof Error) {
					const errorMsg = error.message;
					toast.error(errorMsg);
				}
				return [];
			}
		},
		enabled: enabled && !!clientId,
	});
}
export function useResponsibles(): UseQueryResult<IResponsible[], Error> {
	return useQuery({
		queryKey: ["responsibles"],
		queryFn: async (): Promise<IResponsible[]> => {
			try {
				const { data } = await axios.get("/api/responsibles");
				return data.data;
			} catch (error) {
				if (error instanceof AxiosError) {
					const errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
				}
				if (error instanceof Error) {
					const errorMsg = error.message;
					toast.error(errorMsg);
				}
				return [];
			}
		},
		staleTime: 0,
		refetchOnWindowFocus: false,
	});
}
export function useResponsibleInfo(responsibleId: string | undefined): IResponsible | null {
	const { data: responsible } = useQuery({
		queryKey: ["responsible", responsibleId],
		queryFn: async (): Promise<IResponsible | null> => {
			try {
				const { data } = await axios.get(`/api/responsibles?id=${responsibleId}`);
				return data.data;
			} catch (error) {
				if (error instanceof AxiosError) {
					const errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
				}
				if (error instanceof Error) {
					const errorMsg = error.message;
					toast.error(errorMsg);
				}
				return null;
			}
		},
		refetchOnWindowFocus: false,
		staleTime: 0,
		enabled: !!responsibleId,
	});

	if (responsible) return responsible;
	return null;
}
export function useKits(onlyActive?: boolean): UseQueryResult<IKit[], Error> {
	return useQuery({
		queryKey: ["kits"],
		queryFn: async (): Promise<IKit[]> => {
			try {
				let url: string | undefined;
				if (onlyActive) url = "/api/kits?active=true";
				else url = "/api/kits";
				const { data } = await axios.get(url);
				return data.data;
			} catch (error) {
				if (error instanceof AxiosError) {
					const errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
				}
				if (error instanceof Error) {
					const errorMsg = error.message;
					toast.error(errorMsg);
				}
				return [];
			}
		},
		refetchOnWindowFocus: false,
	});
}
export function useClients(representative: string | null | undefined, enabled: boolean): UseQueryResult<IClient[], Error> {
	return useQuery({
		queryKey: ["clients"],
		queryFn: async (): Promise<IClient[]> => {
			try {
				const { data } = await axios.get(`/api/clients?representative=${representative}`);
				return data.data;
			} catch (error) {
				if (error instanceof AxiosError) {
					const errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
				}
				if (error instanceof Error) {
					const errorMsg = error.message;
					toast.error(errorMsg);
				}
				return [];
			}
		},
		refetchOnWindowFocus: false,
		enabled,
	});
}

export function extractErrorMessage(error: unknown) {
	let errorMsg = "Oops, um erro não identificado ocorreu.";
	if (error instanceof AxiosError) {
		errorMsg = error.response?.data.error.message;
		return errorMsg;
	}
	if (error instanceof ZodError) {
		errorMsg = error.errors[0].message;
		return errorMsg;
	}
	if (error instanceof Error) {
		errorMsg = error.message;
		return errorMsg;
	}
	return errorMsg;
}
//
function getLevenshteinDistance(string1: string, string2: string): number {
	const matrix = Array(string1.length + 1)
		.fill(null)
		.map(() => Array(string2.length + 1).fill(null));

	for (let i = 0; i <= string1.length; i++) {
		matrix[i][0] = i;
	}

	for (let j = 0; j <= string2.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= string1.length; i++) {
		for (let j = 1; j <= string2.length; j++) {
			const indicator = string1[i - 1] === string2[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + indicator);
		}
	}

	return matrix[string1.length][string2.length];
}
export function calculateStringSimilarity(string1: string, string2: string): number {
	const maxLength = Math.max(string1.length, string2.length);
	const distance = getLevenshteinDistance(string1, string2);
	const similarity = (maxLength - distance) / maxLength;
	const similarityPercentage = similarity * 100;

	return similarityPercentage;
}

export function getMostFrequent(arr: any[]) {
	const hashmap = arr.reduce((acc, val) => {
		acc[val] = (acc[val] || 0) + 1;
		return acc;
	}, {});
	return Object.keys(hashmap).reduce((a, b) => (hashmap[a] > hashmap[b] ? a : b));
}
export function getAverageValue(arr: number[]) {
	const sum = arr.reduce((a, b) => a + b, 0);
	const avg = sum / arr.length || 0;
	return avg;
}
export function formatLongString(str: string, size: number) {
	if (str.length > size) {
		return str.substring(0, size) + "\u2026";
	}
	return str;
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
export function isEmpty(value: any) {
	return value == null || (typeof value === "string" && value.trim().length === 0);
}
