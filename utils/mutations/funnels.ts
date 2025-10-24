import axios from "axios";
import { TFunnel } from "../schemas/funnel.schema";

export async function createFunnel({ info }: { info: TFunnel }) {
	try {
		const { data } = await axios.post("/api/funnels", info);
		if (typeof data.message == "string") return data.message;
		return data.message;
	} catch (error) {
		throw error;
	}
}

export async function editFunnel({ id, changes }: { id: string; changes: Partial<TFunnel> }) {
	try {
		const { data } = await axios.put(`/api/funnels?id=${id}`, changes);
		if (typeof data.message != "string") return "Funil alterado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
