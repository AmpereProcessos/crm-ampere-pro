import { formatToMoney, getEstimatedGen } from "@/utils/methods";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalDTO } from "@/utils/schemas/proposal.schema";
import dayjs from "dayjs";
import ptBr from "dayjs/locale/pt-br";
dayjs.locale(ptBr);
type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
};
export function getOeMTemplateData2024({ opportunity, proposal }: GetTemplateDataParams) {
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");

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
	const clientCity = `${opportunity.localizacao.cidade}${opportunity.localizacao.uf ? `(${opportunity.localizacao.uf})` : ""}`;
	return {
		title: opportunity.nome,
		fontSize: 10,
		textColor: "#333333",
		data: {
			clientName: opportunity.cliente.nome,
			clientRegistry: opportunity.cliente.cpfCnpj || "",
			clientCity: clientCity,
			opportunityIdentifier: opportunity.identificador,
			sellerName: seller?.nome || sdr?.nome || "",
			sellerPhone: seller?.telefone || sdr?.telefone || "",
			proposalId: `#${proposal._id}`,
			proposalDate: dayjs().format("DD [de] MMMM [de] YYYY"),
			proposalValue: formatToMoney(getPricing(proposal.planos).manutencaoSimples),
			modules: `${proposal.premissas.numModulos || 0} MÓDULOS`,
			efficiency: proposal.premissas.eficienciaGeracao ? `${proposal.premissas.eficienciaGeracao}%` : "-",
		},
	};
}
