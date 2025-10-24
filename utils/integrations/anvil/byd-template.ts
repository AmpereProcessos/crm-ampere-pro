import { getExpenseAndEconomyProgression } from "../general";
import { formatToMoney, getAverageValue, getEstimatedGen, getInverterStr, getModulesStr } from "@/utils/methods";
import { formatDecimalPlaces, formatLocation } from "@/lib/methods/formatting";
import dayjs from "dayjs";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalDTO } from "@/utils/schemas/proposal.schema";
import { getInvertersStrByProducts, getModulesStrByProducts } from "@/lib/methods/extracting";

type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
};
export function getBYDTemplateData({ opportunity, proposal }: GetTemplateDataParams) {
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");
	// Getting the progression array of billing prices, payback, and other stuff
	const yearsQty = 25;
	const Table = getExpenseAndEconomyProgression({ proposal, opportunity, yearsQty });

	const MonthsTillPositivePayback = Table.filter((obj) => obj["Payback"] < 0).length;
	const YearsTillPositivePayback = Math.floor(MonthsTillPositivePayback / 12);
	const MonthsFixedTillPositivePayback = MonthsTillPositivePayback % 12;
	const PaybackText =
		MonthsFixedTillPositivePayback > 0
			? `${YearsTillPositivePayback} anos e ${MonthsFixedTillPositivePayback} meses`
			: `${YearsTillPositivePayback} anos`;
	const ArrOfNewBillProgression = Table.map((obj) => obj["EnergyBillValue"]);

	const NewBillAvgValue = getAverageValue(ArrOfNewBillProgression);
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

	const obj = {
		title: opportunity.nome,
		fontSize: 10,
		textColor: "#333333",
		data: {
			idProposta: `#${proposal._id}`,
			vendedor: seller?.nome || sdr?.nome || "",
			telefoneVendedor: seller?.telefone || sdr?.telefone || "",
			dataEmissao: dayjs().format("DD/MM/YYYY"),
			nomeCliente: opportunity.cliente.nome,
			cpfCnpj: opportunity.cliente.cpfCnpj,
			cidade: `${opportunity.localizacao?.cidade} / ${opportunity.localizacao?.uf}`,
			enderecoCliente: formatLocation({ location: opportunity.localizacao }),
			potPico: `${formatDecimalPlaces(proposal.potenciaPico || 0)} kWp`,
			consumoMedio: `${proposal.premissas.consumoEnergiaMensal} kWh/mês`,
			gastoMensalAtual: formatToMoney(monthlyEnergyExpense),
			gastoAnualAtual: formatToMoney(annualEnergyExpense),
			gasto25AnosAtual: formatToMoney(twentyFiveYearsEnergyExpense),
			geracaoEstimada: `${formatDecimalPlaces(estimatedGeneration)} kWh/mês`,
			novoGastoMensal: formatToMoney(NewBillAvgValue),
			payback: PaybackText,
			economiaEstimada: formatToMoney(monthlySavedValue),
			economiaEstimada25anos: formatToMoney(twentyFiveYearsSavedValue),
			inversores: getInvertersStrByProducts(proposal.produtos),
			garantiaInversores: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "INVERSOR").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			garantiaModulos: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "MÓDULO").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			modulos: getModulesStrByProducts(proposal.produtos),
			valorProposta: formatToMoney(proposal.valor || 0),
		},
	};
	return obj;
}
