import axios from "axios";
import type { TFileReference } from "../schemas/file-reference.schema";
import type {
	TCreateFileReferenceRouteInput,
	TCreateFileReferenceRouteOutput,
	TUpdateFileReferenceRouteInput,
	TUpdateFileReferenceRouteOutput,
	TDeleteFileReferenceRouteOutput,
} from "@/app/api/file-references/route";
import type { TCreateManyFileReferencesRouteInput, TCreateManyFileReferencesRouteOutput } from "@/app/api/file-references/many/route";

export async function createFileReference({ info }: { info: TCreateFileReferenceRouteInput }) {
	const { data }: { data: TCreateFileReferenceRouteOutput } = await axios.post("/api/file-references", info);
	return data.message;
}

export async function createManyFileReferences({ info }: { info: TCreateManyFileReferencesRouteInput }) {
	if (info.length === 0) return "Nenhum arquivo para anexar";

	const { data }: { data: TCreateManyFileReferencesRouteOutput } = await axios.post("/api/file-references/many", info);
	return data.message;
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
