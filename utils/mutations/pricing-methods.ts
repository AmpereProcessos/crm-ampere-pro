import axios from "axios";
import { TPricingMethod } from "../schemas/pricing-method.schema";

type CreatePricingMethod = {
	info: TPricingMethod;
};

export async function createPricingMethod({ info }: CreatePricingMethod) {
	try {
		const { data } = await axios.post("/api/pricing-methods", info);
		if (typeof data.message != "string") return "Metodologia de precificação criada com sucesso !";
		return data.message;
	} catch (error) {
		throw error;
	}
}

export async function editPricingMethod({ id, changes }: { id: string; changes: Partial<TPricingMethod> }) {
	try {
		const { data } = await axios.put(`/api/pricing-methods?id=${id}`, changes);
		if (typeof data.message != "string") return "Metodologia de precificação atualizada com sucesso !";
		return data.message;
	} catch (error) {
		throw error;
	}
}
