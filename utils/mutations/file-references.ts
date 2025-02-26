import axios from "axios";
import type { TFileReference } from "../schemas/file-reference.schema";

export async function createFileReference({ info }: { info: TFileReference }) {
	try {
		const { data } = await axios.post("/api/file-references", info);
		if (typeof data.data !== "string") return "Arquivo anexado com sucesso !";
		return data.data as string;
	} catch (error) {
		console.log("Error running 'createFileReference':", error);
		throw error;
	}
}

export async function createManyFileReferences({ info }: { info: TFileReference[] }) {
	try {
		if (info.length === 0) return;
		const { data } = await axios.post("/api/file-references/many", info);
		if (typeof data.data !== "string") return "Arquivos anexados com sucesso !";
		return data.data as string;
	} catch (error) {
		console.log("Error running 'createManyFileReferences':", error);
		throw error;
	}
}

export async function updateFileReference({ changes, id }: { changes: Partial<TFileReference>; id: string }) {
	try {
		const { data } = await axios.put(`/api/file-references?id=${id}`, changes);
		if (typeof data.data !== "string") return "Arquivo atualizado com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running 'updateFileReference':", error);
		throw error;
	}
}

export async function deleteFileReference({ id }: { id: string }) {
	try {
		const { data } = await axios.delete(`/api/file-references?id=${id}`);
		if (typeof data.data !== "string") return "Arquivo deletado com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running 'deleteFileReference':", error);
		throw error;
	}
}
