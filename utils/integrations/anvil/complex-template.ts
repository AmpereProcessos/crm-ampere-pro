import { getExpenseAndEconomyProgression } from "../general";
import { formatToMoney, getAverageValue, getEstimatedGen, getInverterStr, getModulesStr } from "@/utils/methods";
import { formatDecimalPlaces } from "@/lib/methods/formatting";
import dayjs from "dayjs";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalDTO } from "@/utils/schemas/proposal.schema";
import { getInvertersStrByProducts, getModulesStrByProducts } from "@/lib/methods/extracting";

type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
};
export function getComplexTemplateData({ opportunity, proposal }: GetTemplateDataParams) {
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");
	// General information
	const proposePeakPower = proposal.potenciaPico || 0;
	const city = opportunity.localizacao.cidade;
	const uf = opportunity.localizacao.uf;
	const orientation = proposal.premissas.orientacao || "NORTE";
	// Getting the progression array of billing prices, payback, and other stuff
	const yearsQty = 10;
	const Table = getExpenseAndEconomyProgression({ proposal, opportunity, yearsQty });

	// Getting payback text
	const MonthsTillPositivePayback = Table.filter((obj) => obj["Payback"] < 0).length;
	const YearsTillPositivePayback = Math.floor(MonthsTillPositivePayback / 12);
	const MonthsFixedTillPositivePayback = MonthsTillPositivePayback % 12;
	const PaybackText =
		MonthsFixedTillPositivePayback > 0 ? `${YearsTillPositivePayback} anos e ${MonthsFixedTillPositivePayback} meses` : `${YearsTillPositivePayback} anos`;
	const ArrOfNewBillProgression = Table.map((obj) => obj["EnergyBillValue"]);
	const NewBillAvgValue = getAverageValue(ArrOfNewBillProgression);

	// Economy related
	const estimatedGeneration = getEstimatedGen(proposePeakPower, city, uf, orientation);
	const tenYearsSavedValue = Table.reduce((acc, current) => acc + (current.ConventionalEnergyBill - current.EnergyBillValue), 0);

	// Expense related
	const averageEnergyConsumption = proposal.premissas.consumoEnergiaMensal || 0;
	const monthlyEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0);
	const annualEnergyExpense = (proposal.premissas.consumoEnergiaMensal || 0) * (proposal.premissas.tarifaEnergia || 0) * 12;
	const tenYearsEnergyExpense = Table.reduce((acc, current) => acc + current.ConventionalEnergyBill, 0);

	const obj = {
		title: `PROPOSTA ${opportunity.nome}`,
		fontSize: 10,
		textColor: "#333333",
		data: {
			nomeCliente: opportunity.cliente.nome,
			cidade: opportunity.localizacao?.cidade,
			potPico: `${formatDecimalPlaces(proposal.potenciaPico || 0)} kWp`,
			dataEmissao: dayjs().format("DD/MM/YYYY"),
			nomeVendedor: seller?.nome || sdr?.nome || "",
			identificador: opportunity.identificador,
			telefoneVendedor: seller?.telefone || sdr?.telefone || "",
			idProposta: `#${opportunity._id}`,
			consumoMedio: formatDecimalPlaces(averageEnergyConsumption),
			gastoMensalAtual: formatToMoney(monthlyEnergyExpense),
			gasto10anos: formatToMoney(tenYearsEnergyExpense),
			gastoAnualAtual: formatToMoney(annualEnergyExpense),
			novoGastoMensal: formatToMoney(NewBillAvgValue),
			geracaoEstimada: formatDecimalPlaces(estimatedGeneration),
			payback: PaybackText,
			economiaEstimada10anos: formatToMoney(tenYearsSavedValue),
			modulos: getModulesStrByProducts(proposal.produtos),
			garantiaModulos: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "MÓDULO").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			garantiaGeracaoModulos: "25 anos de geração",
			inversores: getInvertersStrByProducts(proposal.produtos),
			garantiaInversores: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "INVERSOR").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			valorProposta: formatToMoney(proposal.valor || 0),
			cpfCnpj: opportunity.cliente?.cpfCnpj || "N/A",
		},
	};
	return obj;
}
