import { formatDecimalPlaces, formatLocation } from "@/lib/methods/formatting";
import { formatToMoney, getEstimatedGen, getInverterStr, getModulesStr } from "@/utils/methods";

import dayjs from "dayjs";
import { getExpenseAndEconomyProgression } from "../general";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalDTO } from "@/utils/schemas/proposal.schema";
import { getInvertersStrByProducts, getModulesStrByProducts } from "@/lib/methods/extracting";

type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
};
export function getSimpleTemplate2023Data({ opportunity, proposal }: GetTemplateDataParams) {
	const paInformation = !!proposal.precificacao.find((p) => p.descricao.includes("PADRÃO") && p.valorFinal > 10) ? "ADEQUAÇÕES DE PADRÃO" : "";
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");
	// Getting the progression array of billing prices, payback, and other stuff
	const yearsQty = 25;
	const Table = getExpenseAndEconomyProgression({ proposal, opportunity, yearsQty });

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
			dataEmissao: dayjs().format("DD/MM/YYYY"),
			vendedor: seller?.nome || sdr?.nome || "",
			nomeCliente: opportunity.cliente.nome,
			cpfCnpj: opportunity.cliente.cpfCnpj,
			cidade: `${opportunity.localizacao?.cidade} - ${opportunity.localizacao?.uf}`,
			enderecoCliente: formatLocation({ location: opportunity.localizacao }),
			potPico: formatDecimalPlaces(proposal.potenciaPico || 0),
			consumoMedio: `${formatDecimalPlaces(averageEnergyConsumption)} kWh`,
			gastoMensalAtual: formatToMoney(monthlyEnergyExpense),
			gastoAnualAtual: formatToMoney(annualEnergyExpense),
			gasto25AnosAtual: formatToMoney(twentyFiveYearsEnergyExpense),
			geracaoEstimada: `${formatDecimalPlaces(estimatedGeneration)} kWh`,
			economiaEstimada: formatToMoney(monthlySavedValue),
			economiaEstimadaAnual: formatToMoney(annualSavedValue),
			economiaEstimada25anos: formatToMoney(twentyFiveYearsSavedValue),
			inversores: getInvertersStrByProducts(proposal.produtos),
			garantiaInversores: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "INVERSOR").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			garantiaModulos: `${Math.max(...proposal.produtos.filter((p) => p.categoria == "MÓDULO").map((x) => (x.garantia ? x.garantia : 0)))} anos`,
			modulos: getModulesStrByProducts(proposal.produtos),
			valorProposta: formatToMoney(proposal.valor || 0),
			adequacaoPadrao: paInformation,
		},
	};
	return obj;
}
