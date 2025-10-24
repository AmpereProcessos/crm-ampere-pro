import type { TCreatePPSCallOutput, TUpdatePPSCallOutput } from "@/pages/api/integration/app-ampere/pps-calls";
import axios from "axios";
import type { TPPSCall } from "../schemas/pps-calls.schema";

export async function createPPSCall(info: TPPSCall) {
	try {
		const { data } = await axios.post<TCreatePPSCallOutput>("/api/integration/app-ampere/pps-calls", info);
		return data;
	} catch (error) {
		console.log("Error running createPPSCall", error);
		throw error;
	}
}

export async function updatePPSCall(id: string, info: Partial<TPPSCall>) {
	try {
		const { data } = await axios.put<TUpdatePPSCallOutput>(`/api/integration/app-ampere/pps-calls?id=${id}`, info);

		return data;
	} catch (error) {
		console.log("Error running updatePPSCall", error);
		throw error;
	}
}
