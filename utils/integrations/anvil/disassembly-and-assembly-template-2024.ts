import { formatDecimalPlaces, formatLocation } from "@/lib/methods/formatting";
import { formatToMoney } from "@/utils/methods";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalDTO } from "@/utils/schemas/proposal.schema";

import dayjs from "dayjs";
import ptBr from "dayjs/locale/pt-br";
dayjs.locale(ptBr);
type GetTemplateDataParams = {
	opportunity: TOpportunityDTOWithClient;
	proposal: TProposalDTO;
};
export function getDisassemblyAndAssemblyTemplateData({ opportunity, proposal }: GetTemplateDataParams) {
	const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
	const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");
	const obj = {
		title: proposal.nome || "PROPOSTA DESMONTAGEM E MONTAGEM",
		fontSize: 10,
		textColor: "#333333",
		data: {
			clientName: opportunity.cliente.nome,
			clientRegistry: opportunity.cliente.cpfCnpj,
			clientCity: `${opportunity.localizacao.cidade} - ${opportunity.localizacao.uf}`,
			proposePower: `${formatDecimalPlaces(proposal.premissas.potenciaPico || 0)} kWp`,
			sellerName: seller?.nome || sdr?.nome || "",
			sellerPhone: seller?.telefone || sdr?.telefone || "",
			proposeDate: dayjs().format("DD [de] MMMM [de] YYYY"),
			modules: `${proposal.premissas.numModulos || 0} módulos`,
			inverters: `${proposal.premissas.numInversores || 0} inversores`,
			assemblyAddress: formatLocation({ location: opportunity.localizacao }),
			investment: formatToMoney(proposal.valor || 0),
			proposeId: proposal._id,
		},
	};

	return obj;
}
