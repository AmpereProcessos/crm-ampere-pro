import { TElectricalInstallationGroups } from "../schemas/opportunity.schema";
import { TPricingMethodDTO, TPricingMethodItemResultItem } from "../schemas/pricing-method.schema";
import { TEletricalPhases, TPricingItem, TProposal } from "../schemas/proposal.schema";

type getSalePriceParams = {
	cost: number;
	profitMargin: number;
	tax: number;
};
export function getCalculatedFinalValue({ value, margin }: { value: number; margin: number }) {
	return value / (1 - margin);
}
export function getSalePrice({ cost, profitMargin, tax }: getSalePriceParams) {
	const profitMarginPercentage = profitMargin / 100;
	const taxPercentage = tax / 100;
	const salePrice = cost / (1 - (profitMarginPercentage + taxPercentage));
	return salePrice;
}
export function getTaxAliquot(cost: number, salePrice: number, margin: number): number {
	if (salePrice == 0) return 0;
	const marginPercentage = margin / 100;
	const costBySale = cost / salePrice;
	const taxValue = 1 - marginPercentage - costBySale;

	return taxValue;
}
export function getProfitMargin(cost: number, salePrice: number): number {
	if (salePrice == 0) return 0;
	const costBySale = cost / salePrice;
	const marginValue = 1 - costBySale;
	return marginValue;
}
export type TPricingConditionData = {
	uf: string; // automatic based on opportunity's location (in premisses as well)
	cidade: string; // automatic based on opportunity's location (in premisses as well)
	topologia: "MICRO-INVERSOR" | "INVERSOR"; // automatic based on kits's topology (in premisses as well)
	tipoEstrutura: string; // in premisses
	grupoInstalacao: TElectricalInstallationGroups;
	faseamentoEletrico: TEletricalPhases;
	idParceiro: string;
	numModulos: number;
	numInversores: number;
	potenciaPico: number;
	distancia: number;
	valorReferencia: number;
	ativacaoReferencia: "SIM" | "NÃO";
};
export type TPricingVariableData = {
	kit: number; // automatic
	plan: number;
	product: number;
	service: number;
	numModulos: number;
	numInversores: number;
	potenciaPico: number;
	distancia: number;
	valorReferencia: number;
	consumoEnergiaMensal: number;
	tarifaEnergia: number;
	custosInstalacao: number;
	custosPadraoEnergia: number;
	custosEstruturaInstalacao: number;
	custosOutros: number;
	total?: number;
	totalFaturavelFinal?: number;
	totalNaoFaturavelFinal?: number;
	totalFaturavelCustos?: number;
	totalNaoFaturavelCustos?: number;
};

type HandleConditionValidationParams = {
	resultCondition: TPricingMethodItemResultItem["condicao"];
	conditionData: TPricingConditionData;
};
function handleConditionValidation({ resultCondition, conditionData }: HandleConditionValidationParams) {
	if (!resultCondition.tipo || resultCondition.tipo == "IGUAL_TEXTO" || resultCondition.tipo == "IGUAL_NÚMERICO") {
		// If there's a condition, extracting the conditionns comparators and the condition data to compare
		const conditionVariable = resultCondition.variavel;
		const conditionValue = resultCondition.igual;
		const condition = conditionData[conditionVariable as keyof typeof conditionData];
		// If condition is matched, then returning true
		if (condition == conditionValue) return true;
		// If not, false
		return false;
	}
	if (resultCondition.tipo == "MAIOR_QUE_NÚMERICO") {
		// If there's a condition, extracting the conditionns comparators and the condition data to compare
		const conditionVariable = resultCondition.variavel;
		const conditionValue = resultCondition.maiorQue || 0;
		const condition = conditionData[conditionVariable as keyof typeof conditionData];
		// If condition is matched, then returning true
		if (Number(condition) > conditionValue) return true;
		// If not, false
		return false;
	}
	if (resultCondition.tipo == "MENOR_QUE_NÚMERICO") {
		// If there's a condition, extracting the conditionns comparators and the condition data to compare
		const conditionVariable = resultCondition.variavel;
		const conditionValue = resultCondition.maiorQue || 0;
		const condition = conditionData[conditionVariable as keyof typeof conditionData];
		// If condition is matched, then returning true
		if (Number(condition) < conditionValue) return true;
		// If not, false
		return false;
	}
	if (resultCondition.tipo == "INTERVALO_NÚMERICO") {
		// If there's a condition, extracting the conditionns comparators and the condition data to compare
		const conditionVariable = resultCondition.variavel;
		const conditionValueMin = resultCondition.entre?.minimo || 0;
		const conditionValueMax = resultCondition.entre?.maximo || 0;
		const condition = conditionData[conditionVariable as keyof typeof conditionData];
		// If condition is matched, then returning true
		if (Number(condition) >= conditionValueMin && Number(condition) <= conditionValueMax) return true;
		// If not, false
		return false;
	}
	if (resultCondition.tipo == "INCLUI_LISTA") {
		// If there's a condition, extracting the conditionns comparators and the condition data to compare
		const conditionVariable = resultCondition.variavel;
		const conditionValues = resultCondition.inclui || [];
		const condition = conditionData[conditionVariable as keyof typeof conditionData];
		// If condition is matched, then returning true
		if (conditionValues.includes(condition.toString())) return true;
		// If not, false
		return false;
	}
}

type HandlePricingCalculationParams = {
	methodology: TPricingMethodDTO;
	kit?: {
		name: string;
		price: number;
		tax: number;
		profitMargin: number;
	} | null;
	plan?: {
		name: string;
		price: number;
		tax: number;
		profitMargin: number;
	} | null;
	variableData: TPricingVariableData;
	conditionData: TPricingConditionData;
};
export function handlePricingCalculation({ methodology, kit, variableData, conditionData }: HandlePricingCalculationParams): TPricingItem[] {
	var variables = {
		...variableData,
		total: 0,
		totalFaturavelFinal: 0,
		totalNaoFaturavelFinal: 0,
		totalFaturavelCustos: 0,
		totalNaoFaturavelCustos: 0,
	};
	let pricingItems: TPricingItem[] = [];
	let iteration = 0;
	while (iteration < 100) {
		const individualCosts = methodology.itens;
		pricingItems = individualCosts.map((cost) => {
			const costName = cost.nome;
			// Ordering possible results so that general result formulas are find last
			const orderedPossibleResults = cost.resultados.sort((a, b) => (a.condicao.aplicavel === b.condicao.aplicavel ? 0 : a.condicao.aplicavel ? -1 : 1));
			const activeResult = orderedPossibleResults.find((r) => {
				const resultCondition = r.condicao;
				const conditional = resultCondition.aplicavel;
				// If there's no condition, then it is a general formula, so returning true
				if (!conditional) return true;

				// If there's a condition, extracting the conditionns comparators and the condition data to compare
				const conditionValidationResult = handleConditionValidation({ resultCondition, conditionData });
				return conditionValidationResult;
				const conditionVariable = r.condicao.variavel;
				const conditionValue = r.condicao.igual;
				const condition = conditionData[conditionVariable as keyof typeof conditionData];
				// If condition is matched, then returning true
				if (condition == conditionValue) return true;
				// If not, false
				return false;
			});
			// Theorically impossible
			if (!activeResult)
				return {
					descricao: "",
					custoCalculado: 0,
					custoFinal: 0,
					faturavel: false,
					margemLucro: 0,
					formulaArr: null,
					valorCalculado: 0,
					valorFinal: 0,
				};
			try {
				// Now, getting the pricing item based on the specified result
				const faturable = activeResult.faturavel;
				const profitMargin = activeResult.margemLucro;
				// Using the formulaArr and the variableData to populate the result's formula
				const formulaArr = activeResult.formulaArr;
				const populatedFormula = formulaArr
					.map((i) => {
						// Extracting the variable, which is determined by outer brackets
						const isVariable = i.includes("[") && i.includes("]");
						// If there is not variable, then returning the original value
						if (!isVariable) return i;
						// Else, exchanging the variable key by the variable value itself and returning it
						const strToReplace = i.replace("[", "").replace("]", "");
						const variableValue = variables[strToReplace as keyof typeof variables] || 0;
						// const fixedValue = strToReplace.replace(strToReplace, variableValue.toString())
						return variableValue;
					})
					.join("");
				// Evaluating the formula as a string now
				const evaluatedCostValue = eval(populatedFormula);
				// Creating and returning the pricing item

				const pricingItem: TPricingItem = {
					descricao: costName,
					custoCalculado: evaluatedCostValue,
					custoFinal: evaluatedCostValue,
					faturavel: faturable,
					margemLucro: profitMargin,
					formulaArr: formulaArr,
					valorCalculado: getCalculatedFinalValue({ value: evaluatedCostValue, margin: profitMargin / 100 }),
					valorFinal: getCalculatedFinalValue({ value: evaluatedCostValue, margin: profitMargin / 100 }),
				};
				return pricingItem;
			} catch (error) {
				console.log("ERROR", error);
				return {
					descricao: "",
					custoCalculado: 0,
					custoFinal: 0,
					faturavel: false,
					formulaArr: null,
					margemLucro: 0,
					valorCalculado: 0,
					valorFinal: 0,
				};
			}
		});
		const newTotal = pricingItems.reduce((acc, current) => acc + current.valorFinal, 0);
		const newFaturableFinalTotal = pricingItems.filter((c) => !!c.faturavel).reduce((acc, current) => acc + current.valorFinal, 0);
		const newNonFaturableFinalTotal = pricingItems.filter((c) => !c.faturavel).reduce((acc, current) => acc + current.valorFinal, 0);
		const newFaturableCostTotal = pricingItems.filter((c) => !!c.faturavel).reduce((acc, current) => acc + current.custoFinal, 0);
		const newNonFaturableCostTotal = pricingItems.filter((c) => !c.faturavel).reduce((acc, current) => acc + current.custoFinal, 0);
		if (Math.abs(newTotal - variables.total) < 0.001) {
			// Convergence reached, updating cumulative variables and exiting the loop
			variables.totalFaturavelCustos = newFaturableCostTotal;
			variables.totalNaoFaturavelCustos = newNonFaturableCostTotal;
			variables.totalFaturavelFinal = newFaturableFinalTotal;
			variables.totalNaoFaturavelFinal = newNonFaturableFinalTotal;
			variables.total = newTotal;
			break;
		}
		// Updating cumulative variables and exiting the loop
		variables.totalFaturavelCustos = newFaturableCostTotal;
		variables.totalNaoFaturavelCustos = newNonFaturableCostTotal;
		variables.totalFaturavelFinal = newFaturableFinalTotal;
		variables.totalNaoFaturavelFinal = newNonFaturableFinalTotal;
		variables.total = newTotal;
		iteration++;
	}
	// Using iteration method while calculating pricing items to allow for cumulative values, such as totals
	return pricingItems;
}
type HandlePartialPricingReCalculationParams = {
	variableData: TPricingVariableData;
	pricingItems: TPricingItem[];
	calculableItemsIndexes: number[];
	keepFinalValues: boolean;
};

export function handlePartialPricingReCalculation({
	variableData,
	pricingItems,
	calculableItemsIndexes,
	keepFinalValues,
}: HandlePartialPricingReCalculationParams) {
	var variables = {
		...variableData,
		total: 0,
		totalFaturavelFinal: 0,
		totalNaoFaturavelFinal: 0,
		totalFaturavelCustos: 0,
		totalNaoFaturavelCustos: 0,
	};
	let newPricingItems: TPricingItem[] = [...pricingItems];
	let iteration = 0;
	while (iteration < 100) {
		newPricingItems = newPricingItems.map((item, index) => {
			if (!calculableItemsIndexes.includes(index)) return pricingItems[index];
			try {
				// Now, getting the pricing item based on the specified result
				const faturable = item.faturavel;
				const profitMargin = item.margemLucro;

				// Using the formulaArr and the variableData to populate the result's formula
				const formulaArr = item.formulaArr;
				if (!formulaArr) return item;
				const populatedFormula = formulaArr
					.map((i) => {
						// Extracting the variable, which is determined by outer brackets
						const isVariable = i.includes("[") && i.includes("]");
						// If there is not variable, then returning the original value
						if (!isVariable) return i;
						// Else, exchanging the variable key by the variable value itself and returning it
						const strToReplace = i.replace("[", "").replace("]", "");
						const variableValue = variables[strToReplace as keyof typeof variables] || 0;
						// const fixedValue = strToReplace.replace(strToReplace, variableValue.toString())
						return variableValue;
					})
					.join("");
				// Evaluating the formula as a string now
				const evaluatedCostValue = eval(populatedFormula);
				// If there is no need to maintain the final values, returning the new pricing item
				if (!keepFinalValues) {
					const pricingItem: TPricingItem = {
						descricao: item.descricao,
						custoCalculado: evaluatedCostValue,
						custoFinal: evaluatedCostValue,
						faturavel: faturable,
						formulaArr: formulaArr,
						margemLucro: profitMargin,
						valorCalculado: getCalculatedFinalValue({ value: evaluatedCostValue, margin: profitMargin / 100 }),
						valorFinal: getCalculatedFinalValue({ value: evaluatedCostValue, margin: profitMargin / 100 }),
					};
					return pricingItem;
				}

				// If it is necessary to maintain the final values, calculating the new margin and returning the new pricing item
				const newProfitMargin = getProfitMargin(evaluatedCostValue, item.valorFinal);
				const pricingItem: TPricingItem = {
					descricao: item.descricao,
					custoCalculado: evaluatedCostValue,
					custoFinal: evaluatedCostValue,
					faturavel: faturable,
					formulaArr: formulaArr,
					margemLucro: newProfitMargin * 100,
					valorCalculado: getCalculatedFinalValue({ value: evaluatedCostValue, margin: newProfitMargin }),
					valorFinal: item.valorFinal,
				};
				return pricingItem;
			} catch (error) {
				return item;
			}
		});
		const newTotal = newPricingItems.reduce((acc, current) => acc + current.valorFinal, 0);
		const newFaturableFinalTotal = newPricingItems.filter((c) => !!c.faturavel).reduce((acc, current) => acc + current.valorFinal, 0);
		const newNonFaturableFinalTotal = newPricingItems.filter((c) => !c.faturavel).reduce((acc, current) => acc + current.valorFinal, 0);
		const newFaturableCostTotal = newPricingItems.filter((c) => !!c.faturavel).reduce((acc, current) => acc + current.custoFinal, 0);
		const newNonFaturableCostTotal = newPricingItems.filter((c) => !c.faturavel).reduce((acc, current) => acc + current.custoFinal, 0);
		if (Math.abs(newTotal - variables.total) < 0.001) {
			// Convergence reached, updating cumulative variables and exiting the loop
			variables.totalFaturavelCustos = newFaturableCostTotal;
			variables.totalNaoFaturavelCustos = newNonFaturableCostTotal;
			variables.totalFaturavelFinal = newFaturableFinalTotal;
			variables.totalNaoFaturavelFinal = newNonFaturableFinalTotal;
			variables.total = newTotal;
			break;
		}
		// Updating cumulative variables and exiting the loop
		variables.totalFaturavelCustos = newFaturableCostTotal;
		variables.totalNaoFaturavelCustos = newNonFaturableCostTotal;
		variables.totalFaturavelFinal = newFaturableFinalTotal;
		variables.totalNaoFaturavelFinal = newNonFaturableFinalTotal;
		variables.total = newTotal;
		iteration++;
	}
	return newPricingItems;
}

type HandleFinalPriceCorrectionProps = {
	pricing: TPricingItem[];
	diffPercentage: number;
};
export function handleFinalPriceCorrection({ diffPercentage, pricing }: HandleFinalPriceCorrectionProps) {
	const pricingCopy = [...pricing];
	const newPricing = pricingCopy.map((p) => {
		// Getting current pricing item suggested sale price
		const itemSuggestedValue = p.valorCalculado;
		// Using the percentage difference to update the item's sale price by that proportion
		const newSalePrice = itemSuggestedValue * (1 - diffPercentage);
		// Getting new margin based on the new sale price
		const newMargin = getProfitMargin(p.custoFinal, newSalePrice);
		return { ...p, margemLucro: newMargin * 100, valorFinal: newSalePrice };
	});
	return newPricing;
}
export function getPricingTotal({ pricing }: { pricing: TPricingItem[] }) {
	const total = pricing.reduce((acc, current) => {
		const finalSaleValue = current.valorFinal;
		return acc + finalSaleValue;
	}, 0);
	return total;
}
export function getPricingSuggestedTotal({ pricing }: { pricing: TPricingItem[] }) {
	const total = pricing.reduce((acc, current) => {
		const finalSaleValue = current.valorCalculado;
		return acc + finalSaleValue;
	}, 0);
	return total;
}
export function getPricingTotals(pricing: TPricingItem[]) {
	const totals = pricing.reduce(
		(acc, current) => {
			const { custoFinal, custoCalculado, margemLucro, valorFinal, valorCalculado } = current;
			const margemLucroCalculada = getProfitMargin(custoCalculado, valorCalculado);
			acc.cost += custoFinal;
			acc.costCalculated += custoCalculado;
			acc.profit += valorFinal * (margemLucro / 100);
			acc.profitCalculated += valorCalculado * margemLucroCalculada;
			acc.total += valorFinal;
			acc.totalCalculated += valorCalculado;
			return acc;
		},
		{
			cost: 0,
			costCalculated: 0,
			profit: 0,
			profitCalculated: 0,
			total: 0,
			totalCalculated: 0,
		},
	);
	return totals;
}

// PREVIOUS PRICING METHOD
// const individualCosts = methodology.itens
// pricingItems = individualCosts.map((cost) => {
//   const costName = cost.nome
//   // Ordering possible results so that general result formulas are find last
//   const orderedPossibleResults = cost.resultados.sort((a, b) => (a.condicao.aplicavel === b.condicao.aplicavel ? 0 : a.condicao.aplicavel ? -1 : 1))
//   const activeResult = orderedPossibleResults.find((r) => {
//     const conditional = r.condicao.aplicavel
//     // If there's no condition, then it is a general formula, so returning true
//     if (!conditional) return true
//     // If there's a condition, extracting the conditionns comparators and the condition data to compare
//     const conditionVariable = r.condicao.variavel
//     const conditionValue = r.condicao.igual
//     const condition = conditionData[conditionVariable as keyof typeof conditionData]
//     // If condition is matched, then returning true
//     if (condition == conditionValue) return true
//     // If not, false
//     return false
//   })
//   // Theorically impossible
//   if (!activeResult)
//     return {
//       descricao: '',
//       custo: 0,
//       taxaImposto: 0,
//       margemLucro: 0,
//       valorCalculado: 0,
//       valorFinal: 0,
//     }
//   try {
//     // Now, getting the pricing item based on the specified result
//     const taxValue = activeResult.taxaImposto
//     const profitMargin = activeResult.margemLucro
//     // Using the formulaArr and the variableData to populate the result's formula
//     const formulaArr = activeResult.formulaArr
//     const populatedFormula = formulaArr
//       .map((i) => {
//         // Extracting the variable, which is determined by outer brackets
//         const isVariable = i.includes('[') && i.includes(']')
//         // If there is not variable, then returning the original value
//         if (!isVariable) return i
//         // Else, exchanging the variable key by the variable value itself and returning it
//         const strToReplace = i.replace('[', '').replace(']', '')
//         const variableValue = variables[strToReplace as keyof typeof variableData] || 0
//         // const fixedValue = strToReplace.replace(strToReplace, variableValue.toString())
//         return variableValue
//       })
//       .join('')
//     // Evaluating the formula as a string now
//     const evaluatedCostValue = eval(populatedFormula)
//     // Creating and returning the pricing item
//     const pricingItem: TPricingItem = {
//       descricao: costName,
//       custo: evaluatedCostValue,
//       taxaImposto: taxValue,
//       margemLucro: profitMargin,
//       valorCalculado: getSalePrice({ cost: evaluatedCostValue, profitMargin: profitMargin, tax: taxValue }),
//       valorFinal: getSalePrice({ cost: evaluatedCostValue, profitMargin: profitMargin, tax: taxValue }),
//     }
//     return pricingItem
//   } catch (error) {
//     return {
//       descricao: '',
//       custo: 0,
//       taxaImposto: 0,
//       margemLucro: 0,
//       valorCalculado: 0,
//       valorFinal: 0,
//     }
//   }
// })
