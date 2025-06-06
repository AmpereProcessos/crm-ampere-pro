import axios from "axios";
import type { TClient } from "../schemas/client.schema";
import type { TCreateClientRouteOutput, TUpdateClientRouteOutput } from "@/app/api/clients/route";

export async function createClient({ info }: { info: TClient }) {
	const { data }: { data: TCreateClientRouteOutput } = await axios.post("/api/clients", info);
	return data.message;
}
type UpdateClientParams = {
	id: string;
	changes: Partial<TClient>;
};

export async function updateClient({ id, changes }: UpdateClientParams) {
	const { data }: { data: TUpdateClientRouteOutput } = await axios.put(`/api/clients?id=${id}`, changes);
	return data.message;
}
