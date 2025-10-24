import SolarGenerationFactors from "@/utils/json-files/solar-generation-factors-formatted.json";
import type { TProposal } from "../schemas/proposal.schema";

export function getEquivalentSolarFactors({ city, state }: { city: string; state: string }) {
	const equivalentFactors = (SolarGenerationFactors as TSolarGenerationFactor[]).find((f) => f.CIDADE === city && f.UF === state);
	return (
		equivalentFactors || {
			ESTADO: "N/A",
			CIDADE: "N/A",
			LONGITUDE: 0,
			LATITUDE: 0,
			ANUAL: 120,
			POR_ORIENTACAO: {
				LESTE: 120,
				NORDESTE: 120,
				NORTE: 120,
				NOROESTE: 120,
				OESTE: 120,
				SUDOESTE: 120,
				SUL: 120,
				SUDESTE: 120,
			},
			POR_MES: {
				JAN: 120,
				FEV: 120,
				MAR: 120,
				ABR: 120,
				MAI: 120,
				JUN: 120,
				JUL: 120,
				AGO: 120,
				SET: 120,
				OUT: 120,
				NOV: 120,
				DEZ: 120,
			},
		}
	);
}

type TSolarGenerationFactor = {
	CIDADE: string;
	ESTADO: string;
	UF: string;
	LONGITUDE: number;
	LATITUDE: number;
	ANUAL: number;
	POR_ORIENTACAO: {
		LESTE: number;
		NORDESTE: number;
		NORTE: number;
		NOROESTE: number;
		OESTE: number;
		SUDOESTE: number;
		SUL: number;
		SUDESTE: number;
	};
	POR_MES: {
		JAN: number;
		FEV: number;
		MAR: number;
		ABR: number;
		MAI: number;
		JUN: number;
		JUL: number;
		AGO: number;
		SET: number;
		OUT: number;
		NOV: number;
		DEZ: number;
	};
};

type getIdealTotalModulesPowerFromConsumptionProps = {
	energyConsumption: number;
	orientation: string;
	locationUf?: string;
	locationCity?: string;
};
export function getIdealTotalModulesPowerFromConsumption({
	energyConsumption,
	orientation,
	locationUf,
	locationCity,
}: getIdealTotalModulesPowerFromConsumptionProps): number {
	const DEFAULT_GENERATION_FACTOR = 127; // kWh/m²/year
	if (!locationCity || !locationUf) {
		return energyConsumption / DEFAULT_GENERATION_FACTOR;
	}
	const locationGenerationFactors = (SolarGenerationFactors as TSolarGenerationFactor[]).find((f) => f.CIDADE === locationCity && f.UF === locationUf);
	if (!locationGenerationFactors) {
		return energyConsumption / DEFAULT_GENERATION_FACTOR;
	}
	const locationGenerationFactorForOrientation =
		locationGenerationFactors.POR_ORIENTACAO[orientation as keyof typeof locationGenerationFactors.POR_ORIENTACAO];
	if (!locationGenerationFactorForOrientation) {
		return energyConsumption / locationGenerationFactors.POR_ORIENTACAO.NORTE; // using the default orientation (NORTE)
	}
	if (typeof locationGenerationFactorForOrientation !== "number") {
		console.error(`Invalid generation factor for orientation: ${orientation} in ${locationCity}, ${locationUf}`);
		return energyConsumption / DEFAULT_GENERATION_FACTOR; // fallback to default generation factor
	}
	return energyConsumption / locationGenerationFactorForOrientation; // return the calculated power based on the orientation
}
export function getEstimatedEnergyGenerationFromTotalModulesPower({
	totalModulesPower,
	locationCity,
	locationUf,
	orientation,
}: {
	totalModulesPower: number;
	locationCity: string | undefined | null;
	locationUf: string | undefined | null;
	orientation: string;
}): number {
	const DEFAULT_GENERATION_FACTOR = 127; // kWh/m²/year
	if (!locationCity || !locationUf) {
		return totalModulesPower * DEFAULT_GENERATION_FACTOR;
	}
	const locationGenerationFactors = (SolarGenerationFactors as TSolarGenerationFactor[]).find((f) => f.CIDADE === locationCity && f.UF === locationUf);
	if (!locationGenerationFactors) {
		return totalModulesPower * DEFAULT_GENERATION_FACTOR;
	}
	const locationGenerationFactorForOrientation =
		locationGenerationFactors.POR_ORIENTACAO[orientation as keyof typeof locationGenerationFactors.POR_ORIENTACAO];
	if (!locationGenerationFactorForOrientation) {
		return totalModulesPower * locationGenerationFactors.POR_ORIENTACAO.NORTE; // using the default orientation (NORTE)
	}
	if (typeof locationGenerationFactorForOrientation !== "number") {
		console.error(`Invalid generation factor for orientation: ${orientation} in ${locationCity}, ${locationUf}`);
		return totalModulesPower * DEFAULT_GENERATION_FACTOR; // fallback to default generation factor
	}
	return totalModulesPower * locationGenerationFactorForOrientation; // return the calculated power based on the orientation
}
type GetSalesProposalScenariosProps = {
	salesProposal: TProposal;
	locationUf: string;
	locationCity: string;
	salesProposalProducts: TProposal["produtos"];
	yearsQty?: number;
	publicIluminationCost?: number;
	yearlyConsumptionScaling?: number;
};
export function getSalesProposalScenarios({
	salesProposal,
	salesProposalProducts,
	locationUf,
	locationCity,
	yearsQty = 25,
	publicIluminationCost = 20,
	yearlyConsumptionScaling = 0,
}: GetSalesProposalScenariosProps) {
	// Getting the progression array of billing prices, payback, and other stuff

	// Expense related
	const orientation = salesProposal.premissas.orientacao || "NORTE";
	const monthlyEnergyConsumption = salesProposal.premissas.consumoEnergiaMensal || 0;
	const energyConsumptonTariff = salesProposal.premissas.tarifaEnergia || 0;
	const totalModulesPower =
		salesProposalProducts.reduce(
			(acc, product) => (product.categoria === "MÓDULO" && product.potencia ? acc + product.qtde * (product.potencia || 0) : acc),
			0,
		) / 1000;
	const totalModulesArea = salesProposalProducts.reduce(
		(acc, product) =>
			product.categoria === "MÓDULO"
				? acc + product.qtde * 2.4 // average area of a module
				: acc,
		0,
	);
	const simultaneity = salesProposal.premissas.fatorSimultaneidade || 30;
	const energyAvailabilityType = "BIFÁSICO"; // fixing at bifásico for now

	const Table = getExpenseAndEconomyProgression({
		data: {
			investimento: salesProposal.valor,
			potencia_total_modulos: totalModulesPower,
			localizacao_uf: locationUf,
			localizacao_cidade: locationCity,
			"orientacao-de-instalacao": orientation,
			"consumo-de-energia-medio-mensal": monthlyEnergyConsumption,
			"tarifa-de-energia": energyConsumptonTariff,
			"tipo-de-disponibilidade-de-energia": energyAvailabilityType,
			"fator-simultaneidade": simultaneity,
			"custo-iluminacao-publica": publicIluminationCost,
		},
		yearsQty: yearsQty,
		yearlyConsumptionScaling: yearlyConsumptionScaling,
	});
	// console.log('MATRIZ GD1', Table)

	const monthlyEnergyExpense = (monthlyEnergyConsumption || 0) * (energyConsumptonTariff || 0);
	const annualEnergyExpense = (monthlyEnergyConsumption || 0) * (energyConsumptonTariff || 0) * 12;
	const twentyFiveYearsEnergyExpense = Table.reduce((acc, current) => acc + current.ConventionalEnergyBill, 0);

	// Economy related
	const estimatedGeneration = getEstimatedEnergyGenerationFromTotalModulesPower({
		totalModulesPower: totalModulesPower,
		locationCity: locationCity,
		locationUf: locationUf,
		orientation: orientation,
	});

	const monthlySavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0) / Table.length;
	const annualSavedValue = (12 * Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0)) / Table.length;
	const twentyFiveYearsSavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0);

	return {
		totalModulesPower,
		totalModulesArea,
		monthlyEnergyConsumption,
		monthlyEnergyExpense,
		annualEnergyExpense,
		twentyFiveYearsEnergyExpense,
		estimatedGeneration,
		monthlySavedValue,
		annualSavedValue,
		twentyFiveYearsSavedValue,
		progression: Table,
	};
}
export type TSalesProposalScenarios = ReturnType<typeof getSalesProposalScenarios>;

function getExpenseAndEconomyProgression({
	data,
	yearsQty = 25,
	yearlyConsumptionScaling = 0,
	yearlyGenerationDecrease = 0.008,
}: {
	data: {
		investimento: number;
		potencia_total_modulos: number;
		localizacao_uf: string;
		localizacao_cidade: string;
		"fator-simultaneidade": number;
		"orientacao-de-instalacao": string;
		"consumo-de-energia-medio-mensal": number;
		"tarifa-de-energia": number;
		"tipo-de-disponibilidade-de-energia": string;
		"custo-iluminacao-publica": number;
	};
	yearsQty?: number;
	yearlyConsumptionScaling?: number;
	yearlyGenerationDecrease?: number;
}) {
	const totalModulesPower = data.potencia_total_modulos || 0;
	const locationCity = data.localizacao_cidade;
	const locationUf = data.localizacao_uf;
	const orientation = data["orientacao-de-instalacao"];
	const simultaneity = data["fator-simultaneidade"] || 30; // [TODO] get actual factor via premisses
	const consumption = (data["consumo-de-energia-medio-mensal"] || 0) as number;
	const energyAvailabilityType = data["tipo-de-disponibilidade-de-energia"] as "MONOFÁSICO" | "BIFÁSICO" | "TRIFÁSICO";
	const generation = getEstimatedEnergyGenerationFromTotalModulesPower({
		totalModulesPower: totalModulesPower,
		locationCity: locationCity,
		locationUf: locationUf,
		orientation: orientation,
	});
	const StartEnergyTariff = (data["tarifa-de-energia"] || 0) as number;
	const StartFioBEnergyTariff = 0.23 as number; // [TODO] get actual tariff via premisse

	// Separação das componentes tarifárias
	const TEPercentage = 0.35; // Porcentagem aproximada da Tarifa de Energia
	const TUSDPercentage = 0.65; // Porcentagem aproximada da Tarifa de Uso do Sistema

	const DisponibilityByType = {
		MONOFÁSICO: 30,
		BIFÁSICO: 50,
		TRIFÁSICO: 100,
	} as const;
	const PublicIluminationCost = data["custo-iluminacao-publica"] || 20;

	const ConsumptionArray = Array.from({ length: 12 }, () => 1).map((x) => x * consumption);
	const GenerationArray = Array.from({ length: 12 }, () => 1).map((x) => x * generation);

	const MonthQty = yearsQty * 12;

	const Table = [];

	const InitialYear = new Date().getFullYear();
	const InitialMonth = new Date().getMonth();

	// Considering GD2 rules
	let CumulatedBalance = 0;
	let Year = InitialYear;
	let Month = InitialMonth;
	let PastBalance = 0;
	let Payback = -data.investimento;

	for (let i = 0; i <= MonthQty; i++) {
		PastBalance = CumulatedBalance;
		const IndexEnergyTariff = getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear: Year });
		const IndexFioBTariff = getIndexFioBTariff({ IndexYear: Year, InitialYear, StartEnergyTariff, StartFioBEnergyTariff });

		const { NetGeneration, InjectedEnergy, UsedEnergyFromGrid, Consumption, Generation, InstantConsumption } = getIndexConsumptionGenerationValues({
			ReferenceConsumption: ConsumptionArray[Month],
			ReferenceGeneration: GenerationArray[Month],
			InitialYear,
			IndexYear: Year,
			YearlyConsumptionScaling: yearlyConsumptionScaling,
			YearGenerationDecrease: yearlyGenerationDecrease,
			Simultaneity: simultaneity,
		});

		const IndexLiquidEnergy = NetGeneration;
		const IndexInjectedEnergy = InjectedEnergy;

		// Used energy from the grid, which is the total consumption minus the instantaneous consumption on gen
		// (PT-BR) Energia utilizada da rede, que é o consumo total menos a consumação instantânea na geração
		const IndexUsedEnergy = UsedEnergyFromGrid;
		// New cumulated balance
		// (PT-BR) Novo saldo acumulado, que é o saldo acumulado atual mais a energia líquida do mês
		const WillUseAllCumulatedBalance = CumulatedBalance + IndexLiquidEnergy <= 0;
		CumulatedBalance = WillUseAllCumulatedBalance ? 0 : PastBalance + IndexLiquidEnergy;

		// Getting energy compensated
		// (PT-BR) Obtendo a energia compensada, levará em consideração o saldo acumulado, a energia injetada e a energia utilizada da rede
		const CompensationEnergy = getCompensationInBalanceUse({ IndexLiquidEnergy, PastBalance, IndexInjectedEnergy, IndexUsedEnergy });

		// Getting the compensation value based on the Lei 14.300
		// (PT-BR) Obtendo o valor da compensação baseado na Lei 14.300, no custo do fio B, etc.
		const CompensationValue = getValuedCompensation({
			compensationEnergy: CompensationEnergy,
			indexEnergyTariff: IndexEnergyTariff,
			indexFioBTariff: IndexFioBTariff,
			teTariff: IndexEnergyTariff * TEPercentage,
			tusdTariff: IndexEnergyTariff * TUSDPercentage,
		});

		// Getting the non compensated energy and its cost
		// (PT-BR) Obtendo o custo da energia não compensada
		const NonCompensatedEnergy = IndexUsedEnergy - CompensationEnergy;
		const NonCompensatedEnergyCost = NonCompensatedEnergy > 0 ? NonCompensatedEnergy * IndexEnergyTariff : 0;

		// Getting the overall energy cost
		// Uses the cost of the non compensated energy + the infrastructure cost of compensated energy
		// (PT-BR) Obtendo o custo final, que é o custo da energia não compensada + o custo da infraestrutura pelo que foi compensado
		const OverallEnergyCost = NonCompensatedEnergyCost + CompensationValue.networkCost;

		// Getting the Disponibility cost based on the grid connection type and the index energy tariff
		// (PT-BR) Obtendo o custo da disponibilidade baseado no tipo de conexão da rede e a tarifa de energia
		const DisponibilityCost = DisponibilityByType[energyAvailabilityType] * IndexEnergyTariff;
		// Energy Bill with a energy generation system (o maior entre o custo calculado e o custo de disponibilidade)
		// (PT-BR) Fatura de energia com um sistema de geração de energia (o maior entre o custo calculado e o custo de disponibilidade)
		const EnergyBillValue = Math.max(DisponibilityCost, OverallEnergyCost) + PublicIluminationCost;
		// Energy Bill without a energy generation system
		// (PT-BR) Fatura de energia sem um sistema de geração de energia
		const ConventionalEnergyBill = IndexEnergyTariff * Consumption + PublicIluminationCost;
		// Getting the monetary value saved from being a energy generator
		// (PT-BR) Obtendo o valor monetário salvo de ser um gerador de energia
		const SavedValue = ConventionalEnergyBill - EnergyBillValue;

		console.log({
			"A - Year": Year,
			"B - Month": Month + 1,
			"C - Consumption": Consumption,
			"D - Generation": Generation,
			"E - NetGeneration": NetGeneration,
			"F - InstantConsumption": InstantConsumption,
			"G - InjectedEnergy": InjectedEnergy,
			"H - UsedEnergyFromGrid": UsedEnergyFromGrid,
			"I - CompensationEnergy": CompensationEnergy,
			"J - CompensatedEnergyCost": CompensationValue.networkCost,
			"K - NonCompensatedEnergyCost": NonCompensatedEnergyCost,
			"L - OverallEnergyCost": OverallEnergyCost,
			"M - EnergyBillValue": EnergyBillValue,
		});
		// Updating payback based on the saved value
		// (PT-BR) Atualizando o payback com o valor salvo
		Payback = Payback + SavedValue;

		const IndexTableObject = {
			Year: Year,
			Month: Month + 1,
			Tag: Month + 1 >= 10 ? `${Month + 1}/${Year}` : `0${Month + 1}/${Year}`,
			Consumption: Consumption,
			Generation: Generation,
			NonCompensatedEnergyCost,
			CompensatedEnergyCost: CompensationValue.networkCost,
			CumulatedBalance: CumulatedBalance,
			EnergyBillValue: EnergyBillValue,
			ConventionalEnergyBill: ConventionalEnergyBill,
			SavedValue: SavedValue,
			Payback: Payback,
		};
		Table.push(IndexTableObject);

		// Handling iterating Year and Month Progress
		if (Month + 1 > 11) {
			Month = 0;
			Year = Year + 1;
		} else Month = Month + 1;
	}
	return Table;
}
function getCompensationInBalanceUse({
	IndexLiquidEnergy,
	PastBalance,
	IndexInjectedEnergy,
	IndexUsedEnergy,
}: {
	IndexLiquidEnergy: number;
	PastBalance: number;
	IndexInjectedEnergy: number;
	IndexUsedEnergy: number;
}) {
	// If generation was bigger than consumption in Index Month, then compensation will be
	// the used energy from the grid in the Index Month
	if (IndexLiquidEnergy >= 0) return IndexUsedEnergy;

	// Getting compensation using balance / injetion
	let BalanceCompensation = 0;
	// If there wasn't energy balance, then only inject would be compensated from balance
	if (PastBalance <= 0) BalanceCompensation = IndexInjectedEnergy;
	// If there was energy balance but previous energy balance plus injected energy
	// will surpass the used energy from grid, compensation from balance will the used energy from grid
	else if (PastBalance + IndexInjectedEnergy > IndexUsedEnergy) BalanceCompensation = IndexUsedEnergy;
	// Else, balance compensation will be the previous balance plus the injected energy
	else BalanceCompensation = PastBalance + IndexInjectedEnergy;
	// If there will be balance compensation, then, the total compensation is
	// the balance compensation
	if (BalanceCompensation > 0) return BalanceCompensation;
	// Else, there wouldn't be need for compensation
	return 0;
}

function getValuedCompensation({
	compensationEnergy,
	indexEnergyTariff,
	indexFioBTariff,
	teTariff,
	tusdTariff,
}: {
	compensationEnergy: number;
	indexEnergyTariff: number;
	indexFioBTariff: number;
	teTariff: number;
	tusdTariff: number;
}) {
	// TE (Tarifa de Energia) - compensada integralmente
	const energyComponentCost = compensationEnergy * teTariff;

	// TUSD (Tarifa de Uso do Sistema de Distribuição) - Fio B é cobrado parcialmente
	// O valor do Fio B representa uma parte da TUSD que não é compensada
	const networkCost = compensationEnergy * indexFioBTariff;

	// Valor total compensado (componente de energia 100% + componente de rede parcial)
	const totalCompensated = compensationEnergy * indexEnergyTariff - networkCost;

	return {
		compensationEnergy: compensationEnergy,
		energyComponentCost: energyComponentCost,
		networkCost: networkCost,
		totalCompensated: totalCompensated,
		effectiveRate: (totalCompensated / (compensationEnergy * indexEnergyTariff)) * 100, // % efetiva de compensação
	};
}

function getIndexFioBTariff({
	StartEnergyTariff, // Tarifa total inicial
	StartFioBEnergyTariff, // Valor absoluto inicial do Fio B (R$/kWh)
	InitialYear, // Ano inicial da simulação
	IndexYear, // Ano corrente da simulação
}: {
	StartEnergyTariff: number;
	StartFioBEnergyTariff: number; // Este é o valor que você quer encontrar
	InitialYear: number;
	IndexYear: number;
}) {
	const Pace = 0.15;
	// A referência é o início da regra (2023)
	const InitialReferenceYear = 2023;
	const YearDiff = Math.max(0, IndexYear - InitialReferenceYear); // Garante que não seja negativo
	// A regra vai até 100% (Fio B totalmente cobrado) a partir de 2029.
	// Ano 2023 (YearDiff=0) -> 15%
	// Ano 2024 (YearDiff=1) -> 30%
	// ...
	// Ano 2028 (YearDiff=5) -> 90%
	// Ano 2029 (YearDiff=6) -> 100% (Pace * 6 = 0.9, mas deveria ser 1.0)

	// Correção da progressão para atingir 100%
	let Progress = 0;
	if (IndexYear < 2023) {
		Progress = 0; // Antes da lei, não havia cobrança do Fio B sobre energia injetada
	} else if (IndexYear <= 2028) {
		// De 2023 a 2028, aumenta 15% ao ano
		Progress = Pace * (YearDiff + 1); // (0+1)*0.15=0.15, (1+1)*0.15=0.30 ... (5+1)*0.15=0.90
	} else {
		// A partir de 2029, é 100%
		Progress = 1.0;
	}

	// Calcula a tarifa de energia indexada para o ano atual
	const IndexEnergyTariff = getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear });

	// Calcula o valor do Fio B indexado para o ano atual (assumindo que ele cresce na mesma proporção que a tarifa total)
	// Isso é uma aproximação, o ideal seria indexar TUSD e TE separadamente se possível
	const IndexFioBValue = StartFioBEnergyTariff * (IndexEnergyTariff / StartEnergyTariff);

	// Retorna o valor do Fio B que será efetivamente cobrado naquele ano
	return IndexFioBValue * Progress;
}

function getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear }: { StartEnergyTariff: number; InitialYear: number; IndexYear: number }) {
	const YearDiff = IndexYear - InitialYear;
	const EnergyAnnualInflation = 0.05;
	const Increase = (1 + EnergyAnnualInflation) ** YearDiff;
	return StartEnergyTariff * Increase;
}

function getIndexConsumptionGenerationValues({
	ReferenceConsumption,
	ReferenceGeneration,
	Simultaneity,
	InitialYear,
	IndexYear,
	YearlyConsumptionScaling,
	YearGenerationDecrease,
}: {
	ReferenceConsumption: number;
	ReferenceGeneration: number;
	Simultaneity: number;
	InitialYear: number;
	IndexYear: number;
	YearlyConsumptionScaling: number;
	YearGenerationDecrease: number;
}) {
	const YearDiff = IndexYear - InitialYear;
	const ConsumptionMultiplier = (1 + YearlyConsumptionScaling) ** YearDiff;
	const GenerationMultiplier = (1 - YearGenerationDecrease) ** YearDiff;

	const UpdatedConsumption = ReferenceConsumption * ConsumptionMultiplier;
	const UpdatedGeneration = ReferenceGeneration * GenerationMultiplier;
	const NetGeneration = UpdatedGeneration - UpdatedConsumption;

	const SimultaneousConsumption = UpdatedConsumption * (Simultaneity / 100);
	const InstantConsumption = UpdatedGeneration > SimultaneousConsumption ? SimultaneousConsumption : UpdatedGeneration;

	const UsedEnergyFromGrid = UpdatedConsumption - InstantConsumption;
	const InjectedEnergy = UpdatedGeneration - InstantConsumption;

	return {
		Consumption: UpdatedConsumption,
		Generation: UpdatedGeneration,
		NetGeneration: NetGeneration,
		InstantConsumption: InstantConsumption,
		SimultaneousConsumption: SimultaneousConsumption,
		UsedEnergyFromGrid: UsedEnergyFromGrid,
		InjectedEnergy: InjectedEnergy,
	};
}
