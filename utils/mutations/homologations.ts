import axios from "axios";
import { THomologation, THomologationDTO } from "../schemas/homologation.schema";

export async function createHomologation({ info, returnId }: { info: THomologation; returnId: boolean }) {
	try {
		const { data } = await axios.post("/api/homologations", info);

		if (returnId) return data.data?.insertedId as string;
		if (typeof data.message != "string") return "Homologação criada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editHomologation({ id, changes }: { id: string; changes: Partial<THomologationDTO> }) {
	try {
		const { data } = await axios.put(`/api/homologations?id=${id}`, changes);
		if (typeof data.message != "string") return "Homologação atualizada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
