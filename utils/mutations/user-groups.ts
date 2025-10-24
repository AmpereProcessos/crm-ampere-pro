import axios from "axios";
import { TUserGroup } from "../schemas/user-groups.schema";
import { useQuery } from "@tanstack/react-query";

export async function createUserGroup({ info }: { info: TUserGroup }) {
	try {
		const { data } = await axios.post("/api/user-groups", info);
		if (typeof data.message != "string") return "Grupo de usuários criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editUserGroup({ id, changes }: { id: string; changes: Partial<TUserGroup> }) {
	try {
		const { data } = await axios.put(`/api/user-groups?id=${id}`, changes);
		if (typeof data.message != "string") return "Grupo de usuários atualizado com sucesso.";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
