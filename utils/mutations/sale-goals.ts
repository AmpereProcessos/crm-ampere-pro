import { QueryClient, useMutation } from "@tanstack/react-query";
import { ISaleGoal } from "../models";
import axios from "axios";
import { getErrorMessage } from "@/lib/methods/errors";
import toast from "react-hot-toast";
import { TSaleGoal, TSaleGoalDTO } from "../schemas/sale-goal.schema";

export async function createSaleGoal(info: TSaleGoal) {
	try {
		const { data } = await axios.post("/api/sale-goals", info);
		if (typeof data.message != "string") return "Meta de vendas criada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editSaleGoal({ id, changes }: { id: string; changes: Partial<TSaleGoalDTO> }) {
	try {
		const { data } = await axios.put(`/api/sale-goals?id=${id}`, changes);
		if (!data.message) return "Meta de vendas atualizada com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function deleteSaleGoal({ id }: { id: string }) {
	try {
		const { data } = await axios.delete(`/api/sale-goals?id=${id}`);
		if (!data.message) return "Meta de vendas excluída com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
