import axios from "axios";
import { TTechnicalAnalysis, TTechnicalAnalysisDTO } from "../schemas/technical-analysis.schema";

export async function createTechnicalAnalysis({ info, returnId }: { info: TTechnicalAnalysis; returnId?: boolean }) {
	try {
		const { data } = await axios.post("/api/technical-analysis", info);
		if (returnId) return data.data?.insertedId as string;
		if (typeof data.message != "string") return "Análise criada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editTechnicalAnalysis({ id, changes }: { id: string; changes: Partial<TTechnicalAnalysisDTO> }) {
	try {
		const { data } = await axios.put(`/api/technical-analysis?id=${id}`, changes);
		if (typeof data.message != "string") return "Análise técnica atualizada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
