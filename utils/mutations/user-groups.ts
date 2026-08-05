import axios from "axios";
import { normalizePermissionScopes } from "@/lib/auth/scope";
import { TUserGroup } from "../schemas/user-groups.schema";
import { useQuery } from "@tanstack/react-query";

export async function createUserGroup({ info }: { info: TUserGroup }) {
	try {
		const normalizedInfo = { ...info, permissoes: normalizePermissionScopes(info.permissoes) };
		const { data } = await axios.post("/api/user-groups", normalizedInfo);
		if (typeof data.message != "string") return "Grupo de usuários criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editUserGroup({ id, changes }: { id: string; changes: Partial<TUserGroup> }) {
	try {
		const normalizedChanges = changes.permissoes
			? { ...changes, permissoes: normalizePermissionScopes(changes.permissoes) }
			: changes;
		const { data } = await axios.put(`/api/user-groups?id=${id}`, normalizedChanges);
		if (typeof data.message != "string") return "Grupo de usuários atualizado com sucesso.";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
