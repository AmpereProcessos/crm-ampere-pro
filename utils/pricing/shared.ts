import { ITechnicalAnalysis } from "../models";

export const fixedMargin = 0.12;
export const fixedTaxAliquot = 0.175;
type TechnicalAnalysisCostReturnObj = {
	installationCosts: number;
	structureCosts: number;
	paCosts: number;
	otherCosts: number;
};
export function getTechnicalAnalysisCosts(technicalAnalysis: ITechnicalAnalysis | null) {
	var installationCosts = 0;
	var structureCosts = 0;
	var paCosts = 0;
	var otherCosts = 0;
	var returnObj: TechnicalAnalysisCostReturnObj = {
		installationCosts,
		structureCosts,
		paCosts,
		otherCosts,
	};
	if (!technicalAnalysis) return returnObj;
	const costArray = technicalAnalysis.custosAdicionais;
	if (costArray) {
		returnObj = costArray.reduce((acc, current) => {
			var type;
			console.log("ACCUMULADOR", acc);
			if (current.categoria == "PADRÃO") type = "paCosts";
			if (current.categoria == "ESTRUTURA") type = "structureCosts";
			if (current.categoria == "INSTALAÇÃO") type = "installationCosts";
			if (current.categoria == "OUTROS") type = "otherCosts";
			if (!type) return acc;
			acc[type as keyof TechnicalAnalysisCostReturnObj] = acc[type as keyof TechnicalAnalysisCostReturnObj] + current.valor;
			return acc;
		}, returnObj);

		return returnObj;
	}
	return returnObj;
}
export function getProposaldPrice(cost: number, tax = fixedTaxAliquot, margin = fixedMargin): number {
	const proposaldPrice = cost / (1 - (margin + tax));
	return proposaldPrice;
}

console.log("TESTE");
