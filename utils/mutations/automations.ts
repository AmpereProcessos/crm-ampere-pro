import axios from "axios";
import type { TCreateAutomationInput, TCreateAutomationOutput, TUpdateAutomationInput, TUpdateAutomationOutput } from "@/app/api/automations/route";

export async function createAutomation({ info }: { info: TCreateAutomationInput }) {
	const { data } = await axios.post<TCreateAutomationOutput>("/api/automations", info);
	return data.message;
}

export async function updateAutomation({ id, changes }: { id: string; changes: TUpdateAutomationInput["changes"] }) {
	const { data } = await axios.put<TUpdateAutomationOutput>("/api/automations", { id, changes });
	return data.message;
}
