import axios from "axios";
import { TService } from "../schemas/service.schema";

export async function createService({ info }: { info: TService }) {
	try {
		const { data } = await axios.post("/api/services", info);
		if (typeof data.message != "string") return "Serviço criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editService({ id, changes }: { id: string; changes: Partial<TService> }) {
	try {
		const { data } = await axios.put(`/api/services?id=${id}`, changes);
		if (typeof data.message != "string") return "Serviço atualizado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
