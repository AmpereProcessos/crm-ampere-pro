import axios from "axios";
import { TProposalUpdateRecord } from "../schemas/proposal-update-records.schema";

export async function createProposalUpdateRecord({ info }: { info: TProposalUpdateRecord }) {
	try {
		const { data } = await axios.post("/api/proposals/update-records", info);
		if (typeof data.message != "string") return "Registro de alteração de proposta criado com sucesso!";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
