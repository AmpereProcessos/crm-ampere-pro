import axios from "axios";
import { TUserGroupDTOWithUsers } from "../schemas/user-groups.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchUserGroups() {
	try {
		const { data } = await axios.get("/api/user-groups");
		return data.data as TUserGroupDTOWithUsers[];
	} catch (error) {
		throw error;
	}
}

export function useUserGroups() {
	return useQuery({
		queryKey: ["user-groups"],
		queryFn: fetchUserGroups,
	});
}

async function fetchUserGroupById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/user-groups?id=${id}`);
		return data.data as TUserGroupDTOWithUsers;
	} catch (error) {
		throw error;
	}
}

export function useUserGroupById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["user-group-by-id", id],
		queryFn: async () => await fetchUserGroupById({ id }),
	});
}
