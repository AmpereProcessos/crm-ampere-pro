import { formatDecimalPlaces } from "@/lib/methods/formatting";
import { formatToMoney, getEstimatedGen } from "@/utils/methods";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal } from "@/utils/schemas/proposal.schema";
import dayjs from "dayjs";

type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposal;
};
export function getOeMTemplateData({ opportunity, proposal }: GetTemplateDataParams) {
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");
	const estimatedGeneration = getEstimatedGen(proposal.premissas.potenciaPico || 0, opportunity.localizacao.cidade, opportunity.localizacao.uf, "NORTE");
	const annualLoss = 12 * (1 - (proposal.premissas.eficienciaGeracao || 0) / 100) * estimatedGeneration * (proposal.premissas.tarifaEnergia || 0);
	function getPricing(plans: TProposal["planos"]) {
		const manutencaoSimples = plans.find((p) => p.nome == "MANUTENÇÃO SIMPLES")?.valor || 0;
		const planoSol = plans.find((p) => p.nome == "PLANO SOL")?.valor || 0;
		const planoSolPlus = plans.find((p) => p.nome == "PLANO SOL PLUS")?.valor || 0;

		return {
			manutencaoSimples,
			planoSol,
			planoSolPlus,
		};
	}
	const obj = {
		title: opportunity.nome,
		fontSize: 10,
		textColor: "#333333",
		data: {
			nomeCidade: opportunity.cliente.nome,
			cidade: opportunity.localizacao?.cidade,
			dataProposta: dayjs().format("DD/MM/YYYY"),
			vendedor: seller?.nome || sdr?.nome || "",
			telefoneVendedor: seller?.telefone || sdr?.telefone || "",
			qtdepotModulos: `${proposal.premissas.numModulos} MÓDULOS`,
			potPico: `${formatDecimalPlaces(proposal.premissas.potenciaPico || 0)} kWp`,
			eficienciaAtual: `${proposal.premissas.eficienciaGeracao}%`,
			perdaFinanceira: formatToMoney(annualLoss),
			precoManutencaoSimples: formatToMoney(getPricing(proposal.planos).manutencaoSimples),
			precoPlanoSol: formatToMoney(getPricing(proposal.planos).planoSol),
			precoPlanoSolMais: formatToMoney(getPricing(proposal.planos).planoSolPlus),
		},
	};
	return obj;
}
