import type { TUpdateProfileInput } from "@/pages/api/users/profile";
import { type QueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { normalizePermissionScopes } from "@/lib/auth/scope";
import type { TUser } from "../schemas/user.schema";

export async function editUser({ userId, changes }: { userId: string; changes: any }) {
	try {
		const normalizedChanges = changes.permissoes
			? { ...changes, permissoes: normalizePermissionScopes(changes.permissoes) }
			: changes;
		const { data } = await axios.put(`/api/users?id=${userId}`, { changes: normalizedChanges });
		return data.message;
	} catch (error) {
		throw error;
	}
}

type UseEditUser = {
	userId: string;
	queryClient: QueryClient;
	invalidateKey: string[];
};
export function useEditUser({ userId, queryClient, invalidateKey }: UseEditUser) {
	return useMutation({
		mutationKey: ["editUser", userId],
		mutationFn: async (changes: any) => {
			console.log("PASSED CHANGES", changes);
			await editUser({ userId, changes });
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: invalidateKey });
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: invalidateKey });
		},
	});
}
type CreateUserParams = {
	info: TUser;
};
export async function createUser({ info }: CreateUserParams) {
	try {
		const normalizedInfo = { ...info, permissoes: normalizePermissionScopes(info.permissoes) };
		const { data } = await axios.post("/api/users", normalizedInfo);
		if (typeof data.data != "string") return "Usuário criado com sucesso !";
		return data.data as string;
	} catch (error) {
		throw error;
	}
}

export async function editProfile({ input }: { input: TUpdateProfileInput }) {
	const { data } = await axios.put("/api/users/profile", input);
	return data.message;
}
