import axios from "axios";
import { TUtil } from "../schemas/utils";

export async function createUtil({ info }: { info: TUtil }) {
	try {
		const { data } = await axios.post("/api/utils", info);
		if (typeof data.message != "string") return "Personalização criada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
