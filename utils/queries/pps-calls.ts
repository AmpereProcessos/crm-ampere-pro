import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { TPPSCallDTO } from "../schemas/integrations/app-ampere/pps-calls.schema";

async function fetchAllPPSCalls({ openOnly }: { openOnly: boolean }) {
	try {
		const { data } = await axios.get(`/api/integration/app-ampere/pps-calls?openOnly=${openOnly}`);
		return data.data as TPPSCallDTO[];
	} catch (error) {
		throw error;
	}
}
export function useAllPPSCalls({ openOnly }: { openOnly: boolean }) {
	return useQuery({
		queryKey: ["all-pps-calls"],
		queryFn: async () => await fetchAllPPSCalls({ openOnly }),
	});
}
async function fetchPPSCallsByOpportunityId({ opportunityId, openOnly }: { opportunityId: string; openOnly: boolean }) {
	try {
		const { data } = await axios.get(`/api/integration/app-ampere/pps-calls?openOnly=${openOnly}&opportunityId=${opportunityId}`);
		return data.data as TPPSCallDTO[];
	} catch (error) {
		throw error;
	}
}
export function usePPSCallsByOpportunityId({ opportunityId, openOnly }: { opportunityId: string; openOnly: boolean }) {
	return {
		...useQuery({
			queryKey: ["pps-calls-by-opportunity-id", opportunityId],
			queryFn: async () => await fetchPPSCallsByOpportunityId({ opportunityId, openOnly }),
		}),
		queryKey: ["pps-calls-by-opportunity-id", opportunityId],
	};
}
async function fetchPPSCallsByApplicantId({ applicantId, openOnly }: { applicantId: string; openOnly: boolean }) {
	try {
		const { data } = await axios.get(`/api/integration/app-ampere/pps-calls?openOnly=${openOnly}&applicantId=${applicantId}`);
		return data.data as TPPSCallDTO[];
	} catch (error) {
		throw error;
	}
}
export function usePPSCallsByApplicantId({ applicantId, openOnly }: { applicantId: string; openOnly: boolean }) {
	return useQuery({
		queryKey: ["pps-calls-by-applicant-id", applicantId],
		queryFn: async () => await fetchPPSCallsByApplicantId({ applicantId, openOnly }),
	});
}
async function fetchPPSCallById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/integration/app-ampere/pps-calls?id=${id}`);
		return data.data as TPPSCallDTO;
	} catch (error) {
		throw error;
	}
}
export function usePPSCallById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["pps-call-by-id", id],
		queryFn: async () => await fetchPPSCallById({ id }),
	});
}

async function fetchPPSCalls({ applicantId, openOnly }: { applicantId: string | null; openOnly: boolean }) {
	try {
		var url = `/api/integration/app-ampere/pps-calls?`;
		if (openOnly) url = url + `openOnly=${openOnly}&`;
		if (applicantId) url = url + `applicantId=${applicantId}`;
		const { data } = await axios.get(url);
		return data.data as TPPSCallDTO[];
	} catch (error) {
		throw error;
	}
}

export function usePPSCalls({ applicantId, openOnly }: { applicantId: string | null; openOnly: boolean }) {
	return useQuery({
		queryKey: ["pps-calls", applicantId, openOnly],
		queryFn: async () => await fetchPPSCalls({ applicantId, openOnly }),
	});
}
