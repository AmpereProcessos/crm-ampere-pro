import type { TCreateLeadOutput, TCreateManyLeadInput, TCreateOneLeadInput, TUpdateLeadInput, TUpdateLeadOutput } from "@/app/api/leads/route";
import { TUpgrateLeadInput, TUpgrateLeadOutput } from "@/app/api/leads/upgrade/route";
import axios from "axios";

export async function createLead(input: TCreateOneLeadInput) {
	const { data } = await axios.post<TCreateLeadOutput>("/api/leads", input);
	if (!data.data.insertedId) throw new Error("Oops, houve um erro desconhecido ao criar lead.");
	return data;
}

export async function createManyLeads(input: TCreateManyLeadInput) {
	const { data } = await axios.post<TCreateLeadOutput>("/api/leads", input);
	if (!data.data.insertedIds) throw new Error("Oops, houve um erro desconhecido ao criar leads.");
	return data;
}

export async function updateLead(input: TUpdateLeadInput) {
	const { data } = await axios.put<TUpdateLeadOutput>("/api/leads", input);
	return data;
}

export async function upgradeLead(input: TUpgrateLeadInput) {
	const { data } = await axios.post<TUpgrateLeadOutput>("/api/leads/upgrade", input);
	return data;
}
