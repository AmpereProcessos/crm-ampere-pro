import { TOpportunityDTOWithClient } from "../schemas/opportunity.schema";
import { TProposal, TProposalPremisses } from "../schemas/proposal.schema";
import GenerationFactors from "../json-files/generationFactors.json";
import { getEstimatedGen } from "../methods";
import dayjs from "dayjs";
import { formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
type GetScenariosInfoParams = {
	proposal: TProposal;
	opportunity: TOpportunityDTOWithClient;
};
export function getScenariosInfo({ proposal, opportunity }: GetScenariosInfoParams) {
	// Getting the progression array of billing prices, payback, and other stuff
	const yearsQty = 25;
	const Table = getExpenseAndEconomyProgression({ proposal, opportunity, yearsQty });
	// console.log('MATRIZ GD1', Table)
	// Expense related
	const averageEnergyConsumption = proposal.premissas.consumoEnergiaMensal || 0;
	const monthlyEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0);
	const annualEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0) * 12;
	const twentyFiveYearsEnergyExpense = Table.reduce((acc, current) => acc + current.ConventionalEnergyBill, 0);

	// Economy related
	const estimatedGeneration = getEstimatedGen(
		proposal.potenciaPico || 0,
		opportunity.localizacao.cidade,
		opportunity.localizacao.uf,
		proposal.premissas.orientacao || "NORTE",
	);
	const monthlySavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0) / Table.length;
	const annualSavedValue = (12 * Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0)) / Table.length;
	const twentyFiveYearsSavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0);

	return {
		averageEnergyConsumption,
		monthlyEnergyExpense,
		annualEnergyExpense,
		twentyFiveYearsEnergyExpense,
		estimatedGeneration,
		monthlySavedValue,
		annualSavedValue,
		twentyFiveYearsSavedValue,
	};
}

function getExpenseAndEconomyProgression({
	proposal,
	opportunity,
	yearsQty = 25,
}: {
	proposal: TProposal;
	opportunity: TOpportunityDTOWithClient;
	yearsQty?: number;
}) {
	const peakPower = proposal.potenciaPico || 0;
	const city = opportunity.localizacao.cidade;
	const uf = opportunity.localizacao.uf;
	const orientation = proposal.premissas.orientacao;
	const simultaneity = proposal.premissas.fatorSimultaneidade || 30;
	const consumption = proposal.premissas.consumoEnergiaMensal || 0;
	const generation = getEstimatedGen(peakPower, city, uf, orientation || "NORTE");
	const StartEnergyTariff = proposal.premissas.tarifaEnergia || 0;
	const StartFioBEnergyTariff = proposal.premissas.tarifaFioB || 0;

	const DisponibilityByType = {
		MONOFÁSICO: 30,
		BIFÁSICO: 50,
		TRIFÁSICO: 100,
	} as const;
	const PublicIluminationCost = 20;

	const ConsumptionArray = Array.from({ length: 12 }, () => 1).map((x) => x * consumption);
	const GenerationArray = Array.from({ length: 12 }, () => 1).map((x) => x * generation);
	const InstantConsumptionArray = ConsumptionArray.map((c, index) => {
		const gen = GenerationArray[index];
		const simultaneousConsumption = c * (simultaneity / 100);
		// In case generation was bigger than the simultaneous consumption, then
		// instant consumption equals simultaneous consumption
		if (gen > simultaneousConsumption) return simultaneousConsumption;
		// In case it was smaller, instant consumption equals total generation
		return gen;
	});
	const NetMonthEnergyArray = GenerationArray.map((g, index) => g - ConsumptionArray[index]);

	const MonthQty = yearsQty * 12;

	const Table = [];

	const InitialYear = new Date().getFullYear();
	const InitialMonth = new Date().getMonth();

	// Considering GD2 rules
	var CumulatedBalance = 0;
	var Year = InitialYear;
	var Month = InitialMonth;
	var PastBalance = 0;
	var Payback = -proposal.valor;

	for (let i = 0; i <= MonthQty; i++) {
		PastBalance = CumulatedBalance;
		const IndexEnergyTariff = getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear: Year });
		const IndexFioBTariff = getIndexFioBTariff({ IndexYear: Year, InitialYear, StartEnergyTariff, StartFioBEnergyTariff });
		const IndexLiquidEnergy = NetMonthEnergyArray[Month];
		const IndexInjectedEnergy = GenerationArray[Month] - InstantConsumptionArray[Month];

		// Used energy from the grid, which is the total consumption minus the instantaneous consumption on gen
		const IndexUsedEnergy = ConsumptionArray[Month] - InstantConsumptionArray[Month];
		// New cumulated balance
		const WillUseAllCumulatedBalance = CumulatedBalance + IndexLiquidEnergy <= 0;
		CumulatedBalance = WillUseAllCumulatedBalance ? 0 : PastBalance + IndexLiquidEnergy;
		// Getting compensation
		const Compensation = getCompensationInBalanceUse({ IndexLiquidEnergy, PastBalance, IndexInjectedEnergy, IndexUsedEnergy });
		// Getting the FioB cost based on the evolution the tariff in the Index Year
		const FioBCost = Compensation * IndexFioBTariff;
		// Calculating the refence for Other Costs
		// In case Compensation matched the used energy from grid, then Other Costs will be the FioB cost only
		// Else, Other Cost will be the exceding used energy from grid (used - compensation) + FioB cost
		const OtherCosts = Compensation >= IndexUsedEnergy ? FioBCost : FioBCost + (IndexUsedEnergy - Compensation) * IndexEnergyTariff;

		// Getting the Disponibility cost based on the grid connection type and the index energy tariff
		const DisponibilityCost = DisponibilityByType["BIFÁSICO"] * IndexEnergyTariff;
		// Energy Bill with a energy generation system
		const EnergyBillValue = DisponibilityCost > OtherCosts ? DisponibilityCost + PublicIluminationCost : OtherCosts + PublicIluminationCost;
		// Energy Bill without a energy generation system
		const ConventionalEnergyBill = IndexEnergyTariff * consumption + PublicIluminationCost;
		// Getting the monetary value saved from being a energy generator for the grid (in GD1)
		const SavedValue = ConventionalEnergyBill - EnergyBillValue;

		// Updating payback based on the saved value
		Payback = Payback + SavedValue;
		if (DisponibilityCost > OtherCosts) CumulatedBalance = CumulatedBalance + DisponibilityByType["BIFÁSICO"];

		const IndexTableObject = {
			Year: Year,
			Month: Month + 1,
			Tag: Month + 1 >= 10 ? `${Month + 1}/${Year}` : `0${Month + 1}/${Year}`,
			CumulatedBalance: CumulatedBalance,
			EnergyBillValue: EnergyBillValue,
			ConventionalEnergyBill: ConventionalEnergyBill,
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

// FINALIZAR
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
	var BalanceCompensation = 0;
	// If there wasn't energy balance, then only inject would be compensated from balance
	if (PastBalance <= 0) BalanceCompensation = IndexInjectedEnergy;
	// If there was but previous energy balance plus injected energy
	// will surpass the used energy from grid, compensation from balance will the used energy from grid
	if (PastBalance + IndexInjectedEnergy > IndexUsedEnergy) BalanceCompensation = IndexUsedEnergy;
	// Else, balance compensation will be the previous balance plus the injected energy
	BalanceCompensation = PastBalance + IndexInjectedEnergy;
	// If there will be balance compensation, then, the total compensation is
	// the balance compensation
	if (BalanceCompensation > 0) return BalanceCompensation;
	// Else, there wouldn't be need for compensation
	return 0;
}
function getIndexFioBTariff({
	StartEnergyTariff,
	StartFioBEnergyTariff,
	InitialYear,
	IndexYear,
}: {
	StartEnergyTariff: number;
	StartFioBEnergyTariff: number;
	InitialYear: number;
	IndexYear: number;
}) {
	const Pace = 0.15;
	// Fixed initial year to 2023 due to the start of the new rule
	const InitialReferenceYear = 2023;
	const YearDiff = IndexYear - InitialReferenceYear;
	const Progress = Pace * YearDiff > 0.9 ? 0.9 : Pace * YearDiff;
	return (StartFioBEnergyTariff / StartEnergyTariff) * Progress * getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear });
}
function getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear }: { StartEnergyTariff: number; InitialYear: number; IndexYear: number }) {
	const YearDiff = IndexYear - InitialYear;
	const EnergyAnnualInflation = 0.05;
	const Increase = (1 + EnergyAnnualInflation) ** YearDiff;
	return StartEnergyTariff * Increase;
}

export const ProposalPremissesLabel: Record<keyof TProposalPremisses, string> = {
	consumoEnergiaMensal: "CONSUMO DE ENERGIA MENSAL",
	fatorSimultaneidade: "FATOR DE SIMULTANEIDADE",
	tarifaEnergia: "TARIFA DE ENERGIA",
	tarifaFioB: "TARIFA DE FIO B",
	tipoEstrutura: "TIPO DE ESTRUTURA",
	orientacao: "ORIENTAÇÃO",
	distancia: "DISTÂNCIA",
	cidade: "CIDADE",
	uf: "UF",
	topologia: "TOPOLOGIA",
	potenciaPico: "POTÊNCIA PICO",
	numModulos: "NÚMERO DE MÓDULOS",
	numInversores: "NÚMERO DE INVERSORES",
	eficienciaGeracao: "EFICIÊNCIA DE GERAÇÃO",
	grupoInstalacao: "GRUPO DE INSTALAÇÃO",
	valorReferencia: "VALOR DE REFERÊNCIA",
	ativacaoReferencia: "ATIVAÇÃO DE REFERÊNCIA",
	faseamentoEletrico: "FASEAMENTO ELÉTRICO",
	custosInstalacao: "CUSTO ESTIMADO DE INSTALAÇÃO",
	custosPadraoEnergia: "CUSTO ESTIMADO DE ADEQUAÇÃO DE PADRÃO",
	custosEstruturaInstalacao: "CUSTO ESTIMADO DE ESTRUTURA DE INSTALAÇÃO",
	custosOutros: "OUTROS CUSTOS ESTIMADOS",
};
export function formatProposalPremissesLabel(key: keyof TProposalPremisses) {
	return ProposalPremissesLabel[key] || "NÃO DEFINIDO";
}
export function formatProposalPremissesValue<K extends keyof TProposalPremisses>({ key, value }: { key: K; value: TProposalPremisses[K] }) {
	// Caso seja número, formatando as casas decimais
	if (!value) return null;
	switch (key) {
		case "consumoEnergiaMensal":
			return `${formatDecimalPlaces(value)} kWh`;
		case "fatorSimultaneidade":
			return `${formatDecimalPlaces(value)}%`;
		case "tarifaEnergia":
			return `${formatToMoney(value)}/kWh`;
		case "tarifaFioB":
			return `${formatToMoney(value)}/kWh`;
		case "distancia":
			return `${formatDecimalPlaces(value)} km`;
		case "potenciaPico":
			return `${formatDecimalPlaces(value)} kW`;
		case "numModulos":
			return `${formatDecimalPlaces(value)}`;
		case "numInversores":
			return `${formatDecimalPlaces(value)}`;
		case "valorReferencia":
			return `${formatDecimalPlaces(value)}`;
		case "custosInstalacao":
			return formatToMoney(value);
		case "custosPadraoEnergia":
			return formatToMoney(value);
		case "custosEstruturaInstalacao":
			return formatToMoney(value);
		case "custosOutros":
			return formatToMoney(value);

		default:
			return value;
	}
}
