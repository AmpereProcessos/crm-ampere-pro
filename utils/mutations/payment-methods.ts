import axios from "axios";
import { TPaymentMethod, TPaymentMethodDTO } from "../schemas/payment-methods";

type CreatePaymentMethodParams = {
	info: TPaymentMethod;
};
export async function createPaymentMethod({ info }: CreatePaymentMethodParams) {
	try {
		const { data } = await axios.post("/api/payment-methods", info);
		if (typeof data.message != "string") return "Método de pagamento criado com sucesso !";
		return data.message;
	} catch (error) {
		throw error;
	}
}

export async function editPaymentMethod({ id, changes }: { id: string; changes: Partial<TPaymentMethodDTO> }) {
	try {
		const { data } = await axios.put(`/api/payment-methods?id=${id}`, changes);
		if (typeof data.message != "string") return "Método de pagamento atualizado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
