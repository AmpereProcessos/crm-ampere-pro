import axios from "axios";

import { TProduct } from "../schemas/products.schema";

export async function createProduct({ info }: { info: TProduct }) {
	try {
		const { data } = await axios.post("/api/products", info);
		if (typeof data.message != "string") return "Produto criado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}

export async function editProduct({ id, changes }: { id: string; changes: Partial<TProduct> }) {
	try {
		const { data } = await axios.put(`/api/products?id=${id}`, changes);
		if (typeof data.message != "string") return "Produto atualizado com sucesso !";
		return data.message as string;
	} catch (error) {
		throw error;
	}
}
