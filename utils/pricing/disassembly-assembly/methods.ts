import { IProject, IProposalDisassemblyAssemblyInfo, ITechnicalAnalysis, InverterType, ModuleType } from "@/utils/models";
import { getProposaldPrice, getTechnicalAnalysisCosts } from "../shared";

const SALE_COMISSION = 10 / 100;
const MODULES_DONE_BY_DAY = 12;
const FOOD_COST_BY_TEAM = 70;
const STANDARD_PROFIT_MARGIN = 5 / 100;
const STANDARD_TAX_ALIQUOT = 17.5 / 100;
export interface DisassemblyAssemblyPricing {
	instalacao: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	maoDeObra: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	projeto?: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	venda: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	padrao?: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	estrutura?: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	extra?: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
}
export type GetDisassemblyAssemblyParams = {
	project?: IProject;
	proposal: IProposalDisassemblyAssemblyInfo;
	technicalAnalysis: ITechnicalAnalysis | null;
};
export function getDisassemblyAssemblyPrices({ project, proposal, technicalAnalysis }: GetDisassemblyAssemblyParams) {
	const moduleQty = getModulesQty(proposal.kit?.modulos);
	const peakPower = getPeakPotByModules(proposal.kit?.modulos); // extract from kit info
	const distance = proposal.premissas.distancia;
	const distanceNewLocal = proposal.premissas.novoEndereco?.distancia || 0;

	const uf = project?.cliente?.uf;
	const city = project?.cliente?.cidade;
	const structureType = proposal.premissas.tipoEstrutura;
	const willChangeLocal = !!proposal.premissas.novoEndereco;
	const extractedCostsFromTechnicalAnalysis = getTechnicalAnalysisCosts(technicalAnalysis);
	const { installationCosts: installationCostFromTechnicalAnalysis } = extractedCostsFromTechnicalAnalysis;
	// Extracting and defining costs
	const installationCost = getInstallationCost({
		willChangeLocal,
		distance,
		distanceNewLocal,
		installationCostFromTechnicalAnalysis,
		peakPower,
		uf,
	});
	const laborCost = getLaborCost({ moduleQty });
	const projectEngineeringCost = getProjectEngineeringCost({
		peakPower,
		willChangeLocal,
	});
	const paCost = extractedCostsFromTechnicalAnalysis.paCosts;
	const structureCost = getStructureCost({
		willChangeLocal,
		structureCostFromTechnicalAnalysis: extractedCostsFromTechnicalAnalysis.structureCosts,
		structureType: structureType,
		moduleQty: moduleQty,
		peakPower: peakPower,
		city: city,
	});
	const extraServicesCost = extractedCostsFromTechnicalAnalysis.otherCosts;
	const saleCost = getSaleCost({
		installationCost: installationCost,
		laborCost: laborCost,
		projectEngineeringCost: projectEngineeringCost,
		paCost: paCost,
		structureCost: structureCost,
		extraCost: extraServicesCost,
	});
	// Defining Prices object
	var prices = {} as any;
	prices.instalacao = {
		margemLucro: STANDARD_PROFIT_MARGIN,
		imposto: STANDARD_TAX_ALIQUOT,
		custo: installationCost,
		vendaProposto: getProposaldPrice(installationCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		vendaFinal: getProposaldPrice(installationCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
	};
	prices.maoDeObra = {
		margemLucro: STANDARD_PROFIT_MARGIN,
		imposto: STANDARD_TAX_ALIQUOT,
		custo: laborCost,
		vendaProposto: getProposaldPrice(laborCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		vendaFinal: getProposaldPrice(laborCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
	};
	if (projectEngineeringCost > 0) {
		prices.projeto = {
			margemLucro: STANDARD_PROFIT_MARGIN,
			imposto: STANDARD_TAX_ALIQUOT,
			custo: projectEngineeringCost,
			vendaProposto: getProposaldPrice(projectEngineeringCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
			vendaFinal: getProposaldPrice(projectEngineeringCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		};
	}
	if (paCost > 0) {
		prices.padrao = {
			margemLucro: STANDARD_PROFIT_MARGIN,
			imposto: STANDARD_TAX_ALIQUOT,
			custo: paCost,
			vendaProposto: getProposaldPrice(paCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
			vendaFinal: getProposaldPrice(paCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		};
	}
	if (structureCost) {
		prices.estrutura = {
			margemLucro: STANDARD_PROFIT_MARGIN,
			imposto: STANDARD_TAX_ALIQUOT,
			custo: structureCost,
			vendaProposto: getProposaldPrice(structureCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
			vendaFinal: getProposaldPrice(structureCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		};
	}
	if (extraServicesCost > 0) {
		prices.extra = {
			margemLucro: STANDARD_PROFIT_MARGIN,
			imposto: STANDARD_TAX_ALIQUOT,
			custo: extraServicesCost,
			vendaProposto: getProposaldPrice(extraServicesCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
			vendaFinal: getProposaldPrice(extraServicesCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		};
	}
	// Finally, once estabilished all costs, getting sale cost/price
	prices.venda = {
		margemLucro: STANDARD_PROFIT_MARGIN,
		imposto: STANDARD_TAX_ALIQUOT,
		custo: saleCost,
		vendaProposto: getProposaldPrice(saleCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
		vendaFinal: getProposaldPrice(saleCost, STANDARD_TAX_ALIQUOT, STANDARD_PROFIT_MARGIN),
	};
	const returnPrices: DisassemblyAssemblyPricing = prices;
	return returnPrices;
}

export function getModulesQty(modules: Omit<ModuleType, "id" | "garantia" | "modelo">[] | undefined) {
	if (modules) {
		var totalModulesQty = 0;
		for (let i = 0; i < modules.length; i++) {
			totalModulesQty = totalModulesQty + modules[i].qtde;
		}
		return totalModulesQty;
	} else {
		return 0;
	}
}
export function getInverterQty(inverters: Omit<InverterType, "id" | "garantia" | "modelo">[] | undefined) {
	if (inverters) {
		var totalInverterQty = 0;
		for (let i = 0; i < inverters.length; i++) {
			totalInverterQty = totalInverterQty + inverters[i].qtde;
		}
		return totalInverterQty;
	} else {
		return 0;
	}
}
export function getPeakPotByModules(modules: Omit<ModuleType, "id" | "garantia" | "modelo">[] | undefined) {
	if (modules) {
		var peakPotSum = 0;
		for (let i = 0; i < modules.length; i++) {
			peakPotSum = peakPotSum + modules[i].qtde * modules[i].potencia;
		}
		return peakPotSum / 1000;
	} else {
		return 0;
	}
}
type GetInstallationCostParams = {
	willChangeLocal: boolean;
	peakPower: number;
	distance: number;
	distanceNewLocal: number;
	uf?: string | null;
	installationCostFromTechnicalAnalysis: number;
};
function getInstallationCost({
	willChangeLocal,
	peakPower,
	distance,
	distanceNewLocal,
	uf,
	installationCostFromTechnicalAnalysis,
}: GetInstallationCostParams) {
	if (installationCostFromTechnicalAnalysis) return installationCostFromTechnicalAnalysis;
	if (willChangeLocal) {
		// Peak system power must be in kilowatts

		// Grounding for project in the state of Goiás
		var grounding = 0;

		if (uf == "GO") grounding = 900;
		if (distance > 30) {
			return peakPower * 150 + (distance - 30) * 3.2 + (distanceNewLocal - 30) * 3.2 + grounding;
		} else {
			return peakPower * 150 + grounding;
		}
	}
	return 250;
}
type GetLaborCostParams = {
	moduleQty: number;
};
function getLaborCost({ moduleQty }: GetLaborCostParams) {
	const laborDays = Math.ceil(moduleQty / MODULES_DONE_BY_DAY) * 2;
	const feedingCosts = laborDays * FOOD_COST_BY_TEAM;

	return moduleQty * 160 + feedingCosts;
}
type GetProjectEngineeringCostParams = {
	peakPower: number;
	willChangeLocal: boolean;
};
function getProjectEngineeringCost({ peakPower, willChangeLocal }: GetProjectEngineeringCostParams) {
	if (willChangeLocal) {
		return peakPower * 80;
	} else {
		return 0;
	}
}
type GetSaleCostParams = {
	installationCost: number;
	laborCost: number;
	projectEngineeringCost: number;
	structureCost: number;
	paCost: number;
	extraCost: number;
};
function getSaleCost({ installationCost, laborCost, projectEngineeringCost, structureCost, paCost, extraCost }: GetSaleCostParams) {
	return (installationCost + laborCost + projectEngineeringCost + structureCost + paCost + extraCost) * SALE_COMISSION;
}
type GetStructureCostParams = {
	willChangeLocal: boolean;
	structureCostFromTechnicalAnalysis?: number;
	structureType: string;
	city?: string | null;
	peakPower: number;
	moduleQty: number;
};
function getStructureCost({
	willChangeLocal,
	structureCostFromTechnicalAnalysis,
	structureType,
	city,
	peakPower,
	moduleQty,
}: GetStructureCostParams) {
	if (structureCostFromTechnicalAnalysis) {
		return structureCostFromTechnicalAnalysis;
	}
	if (willChangeLocal) {
		var structureCost = 0;
		if (structureType == "Solo" && city != "INACIOLÂNDIA") {
			structureCost = peakPower * 100;
		}
		if (structureType == "Carport") {
			structureCost = moduleQty * 350;
		}
		return structureCost;
	}
	return 0;
}
