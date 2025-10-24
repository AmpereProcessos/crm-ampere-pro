import axios from "axios";
import { TPurchase, TPurchaseDTO } from "../schemas/purchase.schema";

export async function createPurchase({ info }: { info: TPurchase }) {
	try {
		const { data } = await axios.post("/api/purchases", info);
		if (typeof data.message != "string") return "Registro de compra criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
export async function editPurchase({ id, changes }: { id: string; changes: Partial<TPurchaseDTO> }) {
	try {
		const { data } = await axios.put(`/api/purchases?id=${id}`, changes);
		if (typeof data.message != "string") return "Registro de compra atualizado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
