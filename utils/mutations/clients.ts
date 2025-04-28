import axios from "axios";
import type { TClient } from "../schemas/client.schema";

export async function createClient({ info }: { info: TClient }) {
	try {
		const { data } = await axios.post("/api/clients", info);
		if (typeof data.message !== "string") return "Cliente criado com sucesso !";
		return data.message;
	} catch (error) {
		console.log("Error creating client");
		throw error;
	}
}
type UpdateClientParams = {
	id: string;
	changes: any;
};
export async function updateClient({ id, changes }: UpdateClientParams) {
	try {
		const { data } = await axios.put(`/api/clients?id=${id}`, changes);
		if (typeof data.data !== "string") return "Cliente alterado com sucesso !";
		return;
	} catch (error) {
		console.log("Error updating client");
		throw error;
	}
}
