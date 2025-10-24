import axios from "axios";
import { TSignaturePlan } from "../schemas/signature-plans.schema";

export async function createSignaturePlan({ info }: { info: TSignaturePlan }) {
	try {
		const { data } = await axios.post("/api/signature-plans", info);
		if (typeof data.message != "string") return "Plano comercial criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editSignaturePlan({ id, changes }: { id: string; changes: Partial<TSignaturePlan> }) {
	try {
		const { data } = await axios.put(`/api/signature-plans?id=${id}`, changes);
		if (typeof data.message != "string") return "Plano comercial alterado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
