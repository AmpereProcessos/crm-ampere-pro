import { getExpenseAndEconomyProgression } from "../general";
import { formatToMoney, getEstimatedGen, getInverterStr, getModulesStr } from "@/utils/methods";
import dayjs from "dayjs";
import { formatDecimalPlaces } from "@/lib/methods/formatting";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalDTO } from "@/utils/schemas/proposal.schema";
import { getInvertersStrByProducts, getModulesStrByProducts } from "@/lib/methods/extracting";

type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
};
export function getComplexTemplate2024Data({ opportunity, proposal }: GetTemplateDataParams) {
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");
	// Getting the progression array of billing prices, payback, and other stuff
	const yearsQty = 12;
	const Table = getExpenseAndEconomyProgression({ proposal, opportunity, yearsQty });

	// Expense related
	const averageEnergyConsumption = proposal.premissas.consumoEnergiaMensal || 0;
	const monthlyEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0);
	const annualEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0) * 12;
	const twelveYearsEnergyExpense = Table.reduce((acc, current) => acc + current.ConventionalEnergyBill, 0);

	// Economy related
	const estimatedGeneration = getEstimatedGen(
		proposal.potenciaPico || 0,
		opportunity.localizacao.cidade,
		opportunity.localizacao.uf,
		proposal.premissas.orientacao || "NORTE",
	);
	const monthlySavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0) / Table.length;
	const annualSavedValue = (12 * Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0)) / Table.length;
	const twelveYearsSavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0);
	return {
		title: proposal.nome,
		fontSize: 10,
		textColor: "#333333",
		data: {
			clientName: opportunity.cliente.nome,
			clientCity: opportunity.localizacao.cidade,
			proposePower: `${formatDecimalPlaces(proposal.potenciaPico || 0)} kWp`,
			proposeDate: dayjs().format("DD/MM/YYYY"),
			projectIdentifier: opportunity.identificador,
			sellerName: seller?.nome || sdr?.nome || "",
			sellerPhone: seller?.telefone || sdr?.telefone || "",
			proposeId: `#${proposal._id}`,
			energyConsumption: formatDecimalPlaces(averageEnergyConsumption),
			energyExpense: formatToMoney(monthlyEnergyExpense),
			energyExpenseAnnually: formatToMoney(annualEnergyExpense),
			energyExpenseInScope: formatToMoney(twelveYearsEnergyExpense),
			modules: getModulesStrByProducts(proposal.produtos),
			modulesWarranty: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "MÓDULO").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			Inverters: getInvertersStrByProducts(proposal.produtos),
			invertersWarranty: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "INVERSOR").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			generationMonthly: formatDecimalPlaces(estimatedGeneration),
			economyMonthly: formatToMoney(monthlySavedValue),
			economyAnually: formatToMoney(annualSavedValue),
			economyInScope: formatToMoney(twelveYearsSavedValue),
			investment: formatToMoney(proposal.valor || 0),
			clientRegistry: opportunity.cliente.cpfCnpj,
		},
	};
}
