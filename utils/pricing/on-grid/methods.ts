import { IProject, IProposalInfo, ITechnicalAnalysis, aditionalServicesType } from "@/utils/models";
import { fixedMargin, fixedTaxAliquot, getProposaldPrice, getTechnicalAnalysisCosts } from "../shared";
import { getModulesQty, getPeakPotByModules } from "@/utils/methods";

export interface TraditionalPricing {
	kit: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
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
	projeto: {
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
export interface PromotionalPricing {
	kit: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	instalacao?: {
		margemLucro: number;
		imposto: number;
		custo: number;
		vendaProposto: number;
		vendaFinal: number;
	};
	maoDeObra?: {
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
export type GetONGridPricesParams = {
	project: IProject | undefined;
	proposal: IProposalInfo;
	technicalAnalysis: ITechnicalAnalysis | null;
};
const SALE_COMISSION = 6 / 100;
export function getONGridPrices({ project, proposal, technicalAnalysis }: GetONGridPricesParams): TraditionalPricing | PromotionalPricing {
	if (proposal.kit?.tipo == "PROMOCIONAL") {
		// Extracting premisses and other info from project/proposal
		const city = project?.cliente?.cidade;
		const structureType = proposal.premissas.tipoEstrutura;
		const peakPower = getPeakPotByModules(proposal.kit?.modulos);
		const moduleQty = getModulesQty(proposal.kit?.modulos);
		const distance = proposal.premissas.distancia;
		const extractedCostsFromTechnicalAnalysis = getTechnicalAnalysisCosts(technicalAnalysis);
		// Extracting and defining prices
		const kitPrice = proposal.kit?.preco ? proposal.kit?.preco : 0; // extract from kit info
		const paPrice = extractedCostsFromTechnicalAnalysis.paCosts;
		const structurePrice = getStructureCost({
			structurePrice: extractedCostsFromTechnicalAnalysis.structureCosts,
			structureType: structureType,
			moduleQty: moduleQty,
			peakPower: peakPower,
			city: city,
		});
		const extraServicesPrice = extractedCostsFromTechnicalAnalysis.otherCosts;

		const displacement = distance > 120 ? distance * 3.2 : 0;
		// Defining price object
		var pricesPromo: PromotionalPricing = {
			kit: {
				margemLucro: 0,
				imposto: 0,
				custo: kitPrice,
				vendaProposto: getProposaldPrice(kitPrice, 0, 0),
				vendaFinal: getProposaldPrice(kitPrice, 0, 0),
			},
		};

		// Updating labor prices for Inaciolandia projects
		if (city == "INACIOLÂNDIA") {
			const specialLaborPriceInaciolandia = moduleQty * 100;
			pricesPromo.maoDeObra = {
				margemLucro: 0,
				imposto: 0,
				custo: specialLaborPriceInaciolandia,
				vendaProposto: getProposaldPrice(specialLaborPriceInaciolandia, 0, 0),
				vendaFinal: getProposaldPrice(specialLaborPriceInaciolandia, 0, 0),
			};
		}
		// Updating prices object in case of PA/structure/installation/extra costs
		if (extractedCostsFromTechnicalAnalysis.installationCosts > 0) {
			pricesPromo.instalacao = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: extractedCostsFromTechnicalAnalysis.installationCosts + displacement,
				vendaProposto: getProposaldPrice(extractedCostsFromTechnicalAnalysis.installationCosts + displacement),
				vendaFinal: getProposaldPrice(extractedCostsFromTechnicalAnalysis.installationCosts + displacement),
			};
		}
		if (!extractedCostsFromTechnicalAnalysis.installationCosts && displacement != 0) {
			pricesPromo.instalacao = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: displacement,
				vendaProposto: getProposaldPrice(displacement),
				vendaFinal: getProposaldPrice(displacement),
			};
		}
		if (paPrice > 0) {
			pricesPromo.padrao = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: paPrice,
				vendaProposto: getProposaldPrice(paPrice),
				vendaFinal: getProposaldPrice(paPrice),
			};
		}
		if (structurePrice > 0) {
			pricesPromo.estrutura = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: structurePrice,
				vendaProposto: getProposaldPrice(structurePrice),
				vendaFinal: getProposaldPrice(structurePrice),
			};
		}
		if (extraServicesPrice > 0) {
			pricesPromo.extra = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: extraServicesPrice,
				vendaProposto: getProposaldPrice(extraServicesPrice),
				vendaFinal: getProposaldPrice(extraServicesPrice),
			};
		}
		return pricesPromo;
	} else {
		// Extracting premisses and other info from project/proposal
		const city = project?.cliente?.cidade;
		const uf = project?.cliente?.uf;
		const structureType = proposal.premissas.tipoEstrutura;
		const peakPower = getPeakPotByModules(proposal.kit?.modulos); // extract from kit info
		const moduleQty = getModulesQty(proposal.kit?.modulos); // extract from kit info
		const distance = proposal.premissas.distancia; // get initially from API call
		const extractedCostsFromTechnicalAnalysis = getTechnicalAnalysisCosts(technicalAnalysis);

		// Extracting and defining prices
		const kitPrice = proposal.kit?.preco ? proposal.kit?.preco : 0; // extract from kit info
		const paPrice = extractedCostsFromTechnicalAnalysis.paCosts;
		const structurePrice = getStructureCost({
			structurePrice: extractedCostsFromTechnicalAnalysis.structureCosts,
			structureType: structureType,
			moduleQty: moduleQty,
			peakPower: peakPower,
			city: city,
		});
		const extraServicesPrice = extractedCostsFromTechnicalAnalysis.otherCosts;

		var prices: TraditionalPricing = {
			kit: {
				margemLucro: fixedMargin,
				imposto: 0,
				custo: kitPrice,
				vendaProposto: getProposaldPrice(kitPrice, 0),
				vendaFinal: getProposaldPrice(kitPrice, 0),
			},
			instalacao: {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: 0,
				vendaProposto: 0,
				vendaFinal: 0,
			},
			maoDeObra: {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: 0,
				vendaProposto: 0,
				vendaFinal: 0,
			},
			projeto: {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: 0,
				vendaProposto: 0,
				vendaFinal: 0,
			},
			venda: {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: 0,
				vendaProposto: 0,
				vendaFinal: 0,
			},
		};
		// Costs
		prices.instalacao.custo = extractedCostsFromTechnicalAnalysis.installationCosts // Using installation cost provided by technical analysis, if it exists
			? extractedCostsFromTechnicalAnalysis.installationCosts
			: getInstallationCost(peakPower, distance, uf);
		prices.maoDeObra.custo = getLaborPrice(project?.cliente?.cidade, moduleQty, peakPower, project?.responsavel.id ? project?.responsavel.id : "");
		prices.projeto.custo = getProjectPrice(peakPower);
		prices.venda.custo = getSalePrice({
			kitPrice: kitPrice,
			uf: project?.cliente?.uf,
			installationPrice: prices.instalacao.custo,
			laborPrice: prices.maoDeObra.custo,
			projectPrice: prices.projeto.custo,
			structurePrice: structurePrice,
			paPrice: paPrice,
			extraPrice: extraServicesPrice,
		});

		// Proposald Price
		prices.instalacao.vendaProposto = getProposaldPrice(prices.instalacao.custo);
		prices.maoDeObra.vendaProposto = getProposaldPrice(prices.maoDeObra.custo);
		prices.projeto.vendaProposto = getProposaldPrice(prices.projeto.custo);
		prices.venda.vendaProposto = getProposaldPrice(prices.venda.custo);

		// Final sale price for each item (initially, equal to proposald price)
		prices.instalacao.vendaFinal = getProposaldPrice(prices.instalacao.custo);
		prices.maoDeObra.vendaFinal = getProposaldPrice(prices.maoDeObra.custo);
		prices.projeto.vendaFinal = getProposaldPrice(prices.projeto.custo);
		prices.venda.vendaFinal = getProposaldPrice(prices.venda.custo);

		// Updating prices object in case of PA/structure costs
		if (paPrice > 0) {
			prices.padrao = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: paPrice,
				vendaProposto: getProposaldPrice(paPrice),
				vendaFinal: getProposaldPrice(paPrice),
			};
		}
		if (structurePrice > 0) {
			prices.estrutura = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: structurePrice,
				vendaProposto: getProposaldPrice(structurePrice),
				vendaFinal: getProposaldPrice(structurePrice),
			};
		}
		if (extraServicesPrice > 0) {
			prices.extra = {
				margemLucro: fixedMargin,
				imposto: fixedTaxAliquot,
				custo: extraServicesPrice,
				vendaProposto: getProposaldPrice(extraServicesPrice),
				vendaFinal: getProposaldPrice(extraServicesPrice),
			};
		}
		return prices;
	}
}

interface StructureCostArguments {
	structurePrice?: number;
	structureType: string;
	city?: string | null;
	peakPower: number;
	moduleQty: number;
}
function getStructureCost({ structurePrice, structureType, city, peakPower, moduleQty }: StructureCostArguments) {
	if (structurePrice) {
		return structurePrice;
	} else {
		var structureCost = 0;
		if (structureType == "Solo" && city != "INACIOLÂNDIA") {
			structureCost = peakPower * 100;
		}
		if (structureType == "Carport") {
			structureCost = moduleQty * 350;
		}
		return structureCost;
	}
}
function getInstallationCost(peakPower: number, distance: number, uf?: string | null) {
	// Peak system power must be in kilowatts

	// Grounding for project in the state of Goiás
	var grounding = 0;

	if (uf == "GO") grounding = 900;
	if (distance > 30) {
		return peakPower * 150 + (distance - 30) * 3.2 + grounding;
	} else {
		return peakPower * 150 + grounding;
	}
}
function getProjectPrice(peakPower: number) {
	// return peakPower * 100 + 228;
	return peakPower * 80;
}
type SaleCostArguments = {
	kitPrice: number;
	uf: string | null | undefined;
	installationPrice: number;
	structurePrice: number;
	laborPrice: number;
	projectPrice: number;
	paPrice: number;
	extraPrice: number;
};
function getSalePrice({ kitPrice, uf, installationPrice, structurePrice, laborPrice, projectPrice, paPrice, extraPrice }: SaleCostArguments) {
	return (
		// This pricing method considering a comission for the seller, estipulated at 6%
		(kitPrice + installationPrice + structurePrice + laborPrice + projectPrice + paPrice + extraPrice) * SALE_COMISSION
	);
}
function getLaborPrice(city: string | undefined | null, moduleQty: number, peakPower: number, responsibleId: string) {
	// Personalized costs for INACIOLANDIA and QUIRINÓPOLIS
	if (city == "INACIOLÂNDIA" || city == "QUIRINÓPOLIS") {
		if (moduleQty < 7) return moduleQty * 250;
		else return peakPower * 450;
	}
	// Personalized costs for Marcos Vinicius
	if (responsibleId == "312454213141") {
		//  use Marcos Vinicius ID when his account is created
		if (moduleQty < 7) return moduleQty * 250;
		else return peakPower * 450;
	}
	// General price
	return peakPower * 275;
}
