import axios from "axios";
import { IKit } from "../models";
import { TKit, TKitDTO } from "../schemas/kits.schema";

type CreateKitParams = {
	info: TKit;
};
export async function createKit({ info }: CreateKitParams) {
	try {
		const { data } = await axios.post("/api/kits", info);
		if (typeof data.message != "string") return "Kit criado com sucesso !.";
		return data.message;
	} catch (error) {
		throw error;
	}
}

type HandleKitEditParams = {
	id: string;
	info: TKit;
};

export async function updateKit({ id, info }: HandleKitEditParams) {
	try {
		const { data } = await axios.put(`/api/kits?id=${id}`, info);
		if (typeof data.message != "string") return "Kit atualizado com sucesso !";
		else return data.message;
	} catch (error) {
		throw error;
	}
}

export async function createManyKits({ info }: { info: TKit[] }) {
	try {
		const { data } = await axios.post("/api/kits/many", info);
		console.log("RESPONSE", data);
		if (typeof data.message != "string") return "Kits criados com sucesso !.";
		return data.message;
	} catch (error) {
		throw error;
	}
}
export async function updateManyKits({ info }: { info: TKitDTO[] }) {
	try {
		const { data } = await axios.put("/api/kits/many", info);
		console.log("RESPONSE", data);
		if (typeof data.message != "string") return "Kits atualizados com sucesso !.";
		return data.message;
	} catch (error) {
		throw error;
	}
}
export async function deleteManyKits({ ids }: { ids: string[] }) {
	try {
		const { data } = await axios.delete(`/api/kits/many?ids=${ids}`);
		if (typeof data.message != "string") return "Kit excluídos com sucesso !";
		return data.message;
	} catch (error) {
		throw error;
	}
}
