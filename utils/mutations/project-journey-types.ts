import axios from "axios";
import { TProjectJourneyType } from "../schemas/project-journey-types";

export async function createProjectJourneyType({ info }: { info: TProjectJourneyType }) {
	try {
		const { data } = await axios.post("/api/project-journey-types", info);
		if (typeof data.message != "string") return "Tipo de jornada de projeto criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editProjectJourneyType({ id, changes }: { id: string; changes: Partial<TProjectJourneyType> }) {
	try {
		const { data } = await axios.put(`/api/project-journey-types?id=${id}`, changes);
		if (typeof data.message != "string") return "Tipo de jornada atualizao com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
