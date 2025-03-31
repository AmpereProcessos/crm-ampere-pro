import { getEstimatedGen } from "../methods";

import type { TOpportunityDTOWithClient } from "../schemas/opportunity.schema";

import type { TProposal, TProposalDTO } from "../schemas/proposal.schema";

import { getBYDTemplateData } from "./anvil/byd-template";
import { getComplexTemplateData } from "./anvil/complex-template";
import { getComplexTemplate2024Data } from "./anvil/complex-template-2024";
import { getDisassemblyAndAssemblyTemplateData } from "./anvil/disassembly-and-assembly-template-2024";
import { getMonitoringTemplateData } from "./anvil/monitoring-template";

import { getOeMTemplateData } from "./anvil/oem-template";
import { getOeMTemplateData2024 } from "./anvil/oem-template-2024";
import { getSimpleTemplate2023Data } from "./anvil/simple-template-2023";
import { getSimpleTemplate2024Data } from "./anvil/simple-template-2024";
import { getInsuranceTemplateData } from "./anvil/ufv-insurance";

export const ProposalTemplates = [
	{
		active: true,
		label: "TEMPLATE SIMPLES 2024",
		value: "TEMPLATE SIMPLES 2024",
		idAnvil: "jNegIQ837v9VvQ5XBkOF",
		createProposeObj: getSimpleTemplate2024Data, //
	},
	{
		active: false,
		label: "TEMPLATE SIMPLES",
		value: "TEMPLATE SIMPLES",
		idAnvil: "LPHl6ETXfSmY3QsHJqAW",
		createProposeObj: getSimpleTemplate2023Data, //
	},
	{
		active: false,
		label: "TEMPLATE COMERCIAL 2023",
		value: "TEMPLATE COMERCIAL 2023",
		idAnvil: "atY9ZFVb7eVbAKuXVJuS",
		createProposeObj: getComplexTemplateData,
	},
	{
		active: true,
		label: "TEMPLATE COMPLEXO 2024",
		value: "TEMPLATE COMPLEXO 2024",
		idAnvil: "7q9aUSkD67g9q3jqQjq0",
		createProposeObj: getComplexTemplate2024Data,
	},
	{
		active: true,
		label: "TEMPLATE PARCEIRA BYD",
		value: "TEMPLATE PARCEIRA BYD",
		idAnvil: "QMIYo5Aw51DGlb1n8dUp",
		createProposeObj: getBYDTemplateData, //
	},
	{
		active: false,
		label: "TEMPLATE O&M",
		value: "TEMPLATE O&M",
		idAnvil: "Cf2vPPIkSi7XEpuXV8Xv",
		createProposeObj: getOeMTemplateData,
	},
	{
		active: true,
		label: "TEMPLATE O&M 2024",
		value: "TEMPLATE O&M 2024",
		idAnvil: "JQlMZkYEhfso06KQylBl",
		createProposeObj: getOeMTemplateData2024,
	},
	{
		active: true,
		label: "TEMPLATE SEGURO FOTOVOLTAICO",
		value: "TEMPLATE SEGURO FOTOVOLTAICO",
		idAnvil: "TjjatEmTwEK6jx7uj5WU",
		createProposeObj: getOeMTemplateData2024,
	},
	{
		active: true,
		label: "TEMPLATE DESMONTAGEM E MONTAGEM",
		value: "TEMPLATE DESMONTAGEM E MONTAGEM",
		idAnvil: "QiAjovgEpAt2RCJx5Am7",
		createProposeObj: getDisassemblyAndAssemblyTemplateData,
	},
	{
		active: true,
		label: "TEMPLATE MONITORAMENTO",
		value: "TEMPLATE MONITORAMENTO",
		idAnvil: "Z1L7XqJE2GpnjiVS0Jf6",
		createProposeObj: getMonitoringTemplateData,
	},
];
export const ProposeTemplateOptions = [
	"TEMPLATE SIMPLES 2024",
	"TEMPLATE SIMPLES",
	"TEMPLATE COMERCIAL 2023",
	"TEMPLATE COMPLEXO 2024",
	"TEMPLATE PARCEIRA BYD",
	"TEMPLATE O&M",
	"TEMPLATE O&M 2024",
	"TEMPLATE DESMONTAGEM E MONTAGEM",
	"TEMPLATE SEGURO FOTOVOLTAICO",
	"TEMPLATE MONITORAMENTO",
] as const;

type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
	template: (typeof ProposeTemplateOptions)[number];
};
export function getTemplateData({
	opportunity,
	proposal,
	template,
}: GetTemplateDataParams) {
	if (template === "TEMPLATE SIMPLES 2024")
		return getSimpleTemplate2024Data({ opportunity, proposal });

	if (template === "TEMPLATE SIMPLES")
		return getSimpleTemplate2023Data({ opportunity, proposal });

	if (template === "TEMPLATE COMERCIAL 2023")
		return getComplexTemplateData({ opportunity, proposal });

	if (template === "TEMPLATE COMPLEXO 2024")
		return getComplexTemplate2024Data({ opportunity, proposal });

	if (template === "TEMPLATE PARCEIRA BYD")
		return getBYDTemplateData({ opportunity, proposal });

	if (template === "TEMPLATE O&M")
		return getOeMTemplateData({ opportunity, proposal });

	if (template === "TEMPLATE DESMONTAGEM E MONTAGEM")
		return getDisassemblyAndAssemblyTemplateData({ opportunity, proposal });

	if (template === "TEMPLATE O&M 2024")
		return getOeMTemplateData2024({ opportunity, proposal });

	if (template === "TEMPLATE SEGURO FOTOVOLTAICO")
		return getInsuranceTemplateData({ opportunity, proposal });

	if (template === "TEMPLATE MONITORAMENTO")
		return getMonitoringTemplateData({ opportunity, proposal });

	return getSimpleTemplate2024Data({ opportunity, proposal });
}
export function getExpenseAndEconomyProgression({
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
	const generation = getEstimatedGen(
		peakPower,
		city,
		uf,
		orientation || "NORTE",
	);
	const StartEnergyTariff = proposal.premissas.tarifaEnergia || 0;
	const StartFioBEnergyTariff = proposal.premissas.tarifaFioB || 0;

	const DisponibilityByType = {
		MONOFÁSICO: 30,
		BIFÁSICO: 50,
		TRIFÁSICO: 100,
	} as const;
	const PublicIluminationCost = 20;

	const ConsumptionArray = Array.from({ length: 12 }, () => 1).map(
		(x) => x * consumption,
	);
	const GenerationArray = Array.from({ length: 12 }, () => 1).map(
		(x) => x * generation,
	);
	const InstantConsumptionArray = ConsumptionArray.map((c, index) => {
		const gen = GenerationArray[index];
		const simultaneousConsumption = c * (simultaneity / 100);
		// In case generation was bigger than the simultaneous consumption, then
		// instant consumption equals simultaneous consumption
		if (gen > simultaneousConsumption) return simultaneousConsumption;
		// In case it was smaller, instant consumption equals total generation
		return gen;
	});
	const NetMonthEnergyArray = GenerationArray.map(
		(g, index) => g - ConsumptionArray[index],
	);

	const MonthQty = yearsQty * 12;

	const Table = [];

	const InitialYear = new Date().getFullYear();
	const InitialMonth = new Date().getMonth();

	// Considering GD2 rules
	let CumulatedBalance = 0;
	let Year = InitialYear;
	let Month = InitialMonth;
	let PastBalance = 0;
	let Payback = -(proposal.valor || 0);

	for (let i = 0; i <= MonthQty; i++) {
		PastBalance = CumulatedBalance;
		const IndexEnergyTariff = getIndexEnergyTariff({
			StartEnergyTariff,
			InitialYear,
			IndexYear: Year,
		});
		const IndexFioBTariff = getIndexFioBTariff({
			IndexYear: Year,
			InitialYear,
			StartEnergyTariff,
			StartFioBEnergyTariff,
		});
		const IndexLiquidEnergy = NetMonthEnergyArray[Month];
		const IndexInjectedEnergy =
			GenerationArray[Month] - InstantConsumptionArray[Month];

		// Used energy from the grid, which is the total consumption minus the instantaneous consumption on gen
		const IndexUsedEnergy =
			ConsumptionArray[Month] - InstantConsumptionArray[Month];
		// New cumulated balance
		const WillUseAllCumulatedBalance =
			CumulatedBalance + IndexLiquidEnergy <= 0;
		CumulatedBalance = WillUseAllCumulatedBalance
			? 0
			: PastBalance + IndexLiquidEnergy;
		// Getting compensation
		const Compensation = getCompensationInBalanceUse({
			IndexLiquidEnergy,
			PastBalance,
			IndexInjectedEnergy,
			IndexUsedEnergy,
		});
		// Getting the FioB cost based on the evolution the tariff in the Index Year
		const FioBCost = Compensation * IndexFioBTariff;
		// Calculating the refence for Other Costs
		// In case Compensation matched the used energy from grid, then Other Costs will be the FioB cost only
		// Else, Other Cost will be the exceding used energy from grid (used - compensation) + FioB cost
		const OtherCosts =
			Compensation >= IndexUsedEnergy
				? FioBCost
				: FioBCost + (IndexUsedEnergy - Compensation) * IndexEnergyTariff;

		// Getting the Disponibility cost based on the grid connection type and the index energy tariff
		const DisponibilityCost = DisponibilityByType.BIFÁSICO * IndexEnergyTariff;
		// Energy Bill with a energy generation system
		const EnergyBillValue =
			DisponibilityCost > OtherCosts
				? DisponibilityCost + PublicIluminationCost
				: OtherCosts + PublicIluminationCost;
		// Energy Bill without a energy generation system
		const ConventionalEnergyBill =
			IndexEnergyTariff * consumption + PublicIluminationCost;
		// Getting the monetary value saved from being a energy generator for the grid (in GD1)
		const SavedValue = ConventionalEnergyBill - EnergyBillValue;

		// Updating payback based on the saved value
		Payback = Payback + SavedValue;
		if (DisponibilityCost > OtherCosts)
			CumulatedBalance = CumulatedBalance + DisponibilityByType.BIFÁSICO;

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
	// If there was but previous energy balance plus injected energy
	// will surpass the used energy from grid, compensation from balance will the used energy from grid
	if (PastBalance + IndexInjectedEnergy > IndexUsedEnergy)
		BalanceCompensation = IndexUsedEnergy;
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
	return (
		(StartFioBEnergyTariff / StartEnergyTariff) *
		Progress *
		getIndexEnergyTariff({ StartEnergyTariff, InitialYear, IndexYear })
	);
}
function getIndexEnergyTariff({
	StartEnergyTariff,
	InitialYear,
	IndexYear,
}: { StartEnergyTariff: number; InitialYear: number; IndexYear: number }) {
	const YearDiff = IndexYear - InitialYear;
	const EnergyAnnualInflation = 0.05;
	const Increase = (1 + EnergyAnnualInflation) ** YearDiff;
	return StartEnergyTariff * Increase;
}
