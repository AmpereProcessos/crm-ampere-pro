import axios from "axios";
import { TProjectType } from "../schemas/project-types.schema";

export async function createProjectType({ info }: { info: TProjectType }) {
	try {
		const { data } = await axios.post("/api/project-types", info);
		if (typeof data.message != "string") return "Tipo de projeto criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editProjectType({ id, changes }: { id: string; changes: Partial<TProjectType> }) {
	try {
		const { data } = await axios.put(`/api/project-types?id=${id}`, changes);
		if (typeof data.message != "string") return "Tipo de projeto atualizado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
