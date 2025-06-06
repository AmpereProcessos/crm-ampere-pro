import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { TFileReferenceDTO, TFileReferencesQueryParams } from "../schemas/file-reference.schema";
import type { TGetFileReferencesRouteOutput } from "@/app/api/file-references/route";
import type { TGetMultipleSourcesFileReferencesRouteOutput } from "@/app/api/file-references/many/route";

async function fetchFileReferenceById({ id }: { id: string }) {
	const { data }: { data: TGetFileReferencesRouteOutput } = await axios.get(`/api/file-references?id=${id}`);
	return data.data.byId;
}
export function useFileReferenceById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["file-reference-by-id", id],
		queryFn: async () => await fetchFileReferenceById({ id }),
	});
}

type UseFileReferencesByOpportunityIdParams = {
	opportunityId: string;
};
async function fetchFileReferencesByOpportunityId({ opportunityId }: UseFileReferencesByOpportunityIdParams) {
	const { data }: { data: TGetFileReferencesRouteOutput } = await axios.get(`/api/file-references?opportunityId=${opportunityId}`);
	return data.data.byOpportunityId;
}

export function useFileReferencesByOpportunityId({ opportunityId }: UseFileReferencesByOpportunityIdParams) {
	return useQuery({
		queryKey: ["file-references-by-opportunity", opportunityId],
		queryFn: async () => await fetchFileReferencesByOpportunityId({ opportunityId }),
	});
}

async function fetchFileReferencesByAnalysisId({ analysisId }: { analysisId: string }) {
	const { data }: { data: TGetFileReferencesRouteOutput } = await axios.get(`/api/file-references?analysisId=${analysisId}`);
	return data.data.byAnalysisId;
}

export function useFileReferencesByAnalysisId({ analysisId }: { analysisId: string }) {
	return useQuery({
		queryKey: ["file-references-by-analysis", analysisId],
		queryFn: async () => await fetchFileReferencesByAnalysisId({ analysisId }),
	});
}

async function fetchFileReferencesByClientId({ clientId }: { clientId: string }) {
	const { data }: { data: TGetFileReferencesRouteOutput } = await axios.get(`/api/file-references?clientId=${clientId}`);
	return data.data.byClientId;
}

export function useFileReferencesByClientId({ clientId }: { clientId: string }) {
	return useQuery({
		queryKey: ["file-references-by-client", clientId],
		queryFn: async () => await fetchFileReferencesByClientId({ clientId }),
	});
}

async function fetchFileReferencesByHomologationId({ homologationId }: { homologationId: string }) {
	const { data }: { data: TGetFileReferencesRouteOutput } = await axios.get(`/api/file-references?homologationId=${homologationId}`);
	return data.data.byHomologationId;
}

export function useFileReferencesByHomologationId({ homologationId }: { homologationId: string }) {
	return useQuery({
		queryKey: ["file-references-by-homologation", homologationId],
		queryFn: async () => await fetchFileReferencesByHomologationId({ homologationId }),
	});
}

async function fetchFileReferencesByQuery({
	clientId,
	opportunityId,
	analysisId,
	homologationId,
	projectId,
	purchaseId,
	revenueId,
	expenseId,
	serviceOrderId,
}: TFileReferencesQueryParams) {
	const clientParam = clientId ? `clientId=${clientId}` : null;
	const opportunityParam = opportunityId ? `opportunityId=${opportunityId}` : null;
	const analysisParam = analysisId ? `analysisId=${analysisId}` : null;
	const homologationParam = homologationId ? `homologationId=${homologationId}` : null;
	const projectParam = projectId ? `projectId=${projectId}` : null;
	const purchaseParam = purchaseId ? `purchaseId=${purchaseId}` : null;
	const revenueParam = revenueId ? `revenueId=${revenueId}` : null;
	const expenseParam = expenseId ? `expenseId=${expenseId}` : null;
	const serviceOrderParam = serviceOrderId ? `serviceOrderId=${serviceOrderId}` : null;
	const param = [clientParam, opportunityParam, analysisParam, homologationParam, projectParam, purchaseParam, revenueParam, expenseParam, serviceOrderParam]
		.filter((q) => !!q)
		.join("&");

	if (!param) return [];

	const { data }: { data: TGetMultipleSourcesFileReferencesRouteOutput } = await axios.get(`/api/file-references/many?${param}`);
	return data.data.fileReferences;
}

export function useFileReferences({ clientId, opportunityId, analysisId, homologationId, projectId, purchaseId, revenueId, serviceOrderId }: TFileReferencesQueryParams) {
	return useQuery({
		queryKey: ["file-references-by-query", clientId, opportunityId, analysisId, homologationId, projectId, purchaseId, revenueId, serviceOrderId],
		queryFn: async () => await fetchFileReferencesByQuery({ clientId, opportunityId, analysisId, homologationId, projectId, purchaseId, revenueId, serviceOrderId }),
	});
}
