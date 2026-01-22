import axios from "axios";
import type { TBulkUpdateComissionsRouteInput, TBulkUpdateComissionsRouteOutput } from "@/app/api/opportunities/comissions/route";
import type { TEditOpportunitiesInput, TEditOpportunitiesOutput } from "@/app/api/opportunities/route";
import type { TUpdateOpportunityQueryDefinitionsInput, TUpdateOpportunityQueryDefinitionsOutput } from "@/pages/api/opportunities/query-definitions";
import type {
	TAddResponsibleToOpportunityInput,
	TRemoveResponsibleFromOpportunityInput,
	TUpdateOpportunityResponsibleInput,
} from "@/pages/api/opportunities/responsibles";
import type { TClient } from "../schemas/client.schema";
import type { TFunnelReference } from "../schemas/funnel-reference.schema";
import type { TOpportunity } from "../schemas/opportunity.schema";
import { updateAppProject } from "./app-projects";

type HandleProjectCreationParams = {
	info: TOpportunity;
};
export async function createOpportunity({ info }: HandleProjectCreationParams) {
	try {
		const { data } = await axios.post("/api/opportunities", info);
		if (data.data?.insertedId) return data.data.insertedId as string;
		return "Cliente criado com sucesso !";
	} catch (error) {
		console.log("Error running createOpportunity", error);
		throw error;
	}
}

type CreateClientOpportunityAndFunnelReferenceParams = {
	clientId: string | null | undefined;
	client: TClient;
	opportunity: TOpportunity;
	funnelReference: TFunnelReference;
	returnId: boolean;
};
export async function createClientOpportunityAndFunnelReference({
	clientId,
	client,
	opportunity,
	funnelReference,
	returnId = false,
}: CreateClientOpportunityAndFunnelReferenceParams) {
	try {
		const { data } = await axios.post("/api/opportunities/personalized", { clientId, client, opportunity, funnelReference });
		if (returnId) return data.data?.insertedOpportunityId as string;
		if (typeof data.message !== "string") return "Oportunidade criada com sucesso !";
		return data.data as string;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 409) {
			throw error;
		}
		throw error;
	}
}
export async function updateOpportunity({ id, changes }: TEditOpportunitiesInput) {
	const { data } = await axios.put<TEditOpportunitiesOutput>(`/api/opportunities?id=${id}`, { id, changes });
	return data.message;
}
export async function winOpportunity({ proposalId, opportunityId }: { proposalId: string; opportunityId: string }) {
	try {
		const { data } = await axios.put(`/api/opportunities?id=${opportunityId}`, {
			id: opportunityId,
			changes: {
				"ganho.data": new Date().toISOString(),
				"ganho.idProposta": proposalId,
				"perda.descricaoMotivo": null,
				"perda.data": null,
			},
		});
		if (typeof data.data !== "string") return "Oportunidade alterada com sucesso !";
		return data.message;
	} catch (error) {
		console.log("Error running winOpportunity", error);
		throw error;
	}
}
export async function setOpportunityActiveProposal({ proposalId, opportunityId }: { proposalId: string; opportunityId: string }) {
	try {
		const { data } = await axios.put(`/api/opportunities?id=${opportunityId}`, {
			id: opportunityId,
			changes: {
				idPropostaAtiva: proposalId,
			},
		});
		if (typeof data.data !== "string") return "Oportunidade alterada com sucesso !";
		return data.message;
	} catch (error) {
		console.log("Error running setOpportunityActiveProposal", error);
		throw error;
	}
}

export async function updateWinningProposal({ proposalId, opportunityId, appProjectId }: { proposalId: string; opportunityId: string; appProjectId?: string }) {
	try {
		const { data } = await axios.put(`/api/opportunities?id=${opportunityId}`, {
			id: opportunityId,
			changes: {
				"ganho.idProposta": proposalId,
			},
		});
		if (appProjectId) await updateAppProject(appProjectId, { idPropostaCRM: proposalId });
		return data.message as string;
	} catch (error) {
		console.log("Error running updateWinningProposal", error);
		throw error;
	}
}

export async function deleteOpportunity({ id }: { id: string }) {
	try {
		const { data } = await axios.delete(`/api/opportunities?id=${id}`);
		if (typeof data.message !== "string") return "Oportunidade deletada com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running deleteOpportunity", error);
		throw error;
	}
}

type AddResponsibleToOpportunityParams = TAddResponsibleToOpportunityInput;
export async function addResponsibleToOpportunity({ opportunityId, responsibleId, responsibleRole }: AddResponsibleToOpportunityParams) {
	try {
		const { data } = await axios.post("/api/opportunities/responsibles", { opportunityId, responsibleId, responsibleRole });
		if (typeof data.message !== "string") return "Responsável adicionado com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running addResponsibleToOpportunity", error);
		throw error;
	}
}

type RemoveResponsibleFromOpportunityParams = TRemoveResponsibleFromOpportunityInput;
export async function removeResponsibleFromOpportunity({ opportunityId, responsibleId }: RemoveResponsibleFromOpportunityParams) {
	try {
		const { data } = await axios.delete(`/api/opportunities/responsibles?opportunityId=${opportunityId}&responsibleId=${responsibleId}`);
		if (typeof data.message !== "string") return "Responsável removido com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running removeResponsibleFromOpportunity", error);
		throw error;
	}
}

export async function updateResponsibleInOpportunity(input: TUpdateOpportunityResponsibleInput) {
	const { data } = await axios.put("/api/opportunities/responsibles", input);
	if (typeof data.message !== "string") return "Responsável atualizado com sucesso !";
	return data.message as string;
}

export async function bulkUpdateComissions({ comissions }: { comissions: TBulkUpdateComissionsRouteInput }) {
	try {
		const { data }: { data: TBulkUpdateComissionsRouteOutput } = await axios.post("/api/opportunities/comissions", comissions);
		if (typeof data.message !== "string") return "Comissões atualizadas com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running bulkUpdateComissions", error);
		throw error;
	}
}

export async function updateOpportunitiesQueryDefinitions(input: TUpdateOpportunityQueryDefinitionsInput) {
	try {
		const { data } = await axios.put<TUpdateOpportunityQueryDefinitionsOutput>("/api/opportunities/query-definitions", input);
		return data;
	} catch (error) {
		console.log("Error running updateOpportunitiesQueryDefinitions", error);
		throw error;
	}
}

export async function createApprovalRequest(payload: any) {
	try {
		const { data } = await axios.post("/api/approval-requests", payload);
		return data;
	} catch (error) {
		throw error;
	}
}
