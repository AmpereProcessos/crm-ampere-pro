import { storage } from "@/services/firebase/storage-config";
import { fileTypes } from "@/utils/constants";
import { FirebaseError } from "firebase/app";
import {
	type UploadResult,
	getDownloadURL,
	ref,
	uploadBytes,
} from "firebase/storage";
type HandleProposalUploadParams = {
	file: File;
	storageRef: string;
};
export async function handleProposalUpload({
	file,
	storageRef,
}: HandleProposalUploadParams) {
	try {
		const fileRef = ref(storage, storageRef);
		const res = await uploadBytes(fileRef, file).catch((err) => {
			if (err instanceof FirebaseError)
				switch (err.code) {
					case "storage/unauthorized":
						throw "Usuário não autorizado para upload de arquivos.";
					case "storage/canceled":
						throw "O upload de arquivos foi cancelado pelo usuário.";

					case "storage/retry-limit-exceeded":
						throw "Tempo de envio de arquivo excedido, tente novamente.";

					case "storage/invalid-checksum":
						throw "Ocorreu um erro na checagem do arquivo enviado, tente novamente.";

					case "storage/unknown":
						throw "Erro de origem desconhecida no upload de arquivos.";
				}
		});
		const uploadResult = res as UploadResult;
		if ("metadata" in uploadResult) {
			const url = await getDownloadURL(
				ref(storage, uploadResult.metadata.fullPath),
			);
			return url;
		}
	} catch (error) {
		console.log("Error running handleProposalUpload", error);
		throw error;
	}
}
type UploadFileParams = {
	file: File;
	fileName: string;
	vinculationId: string;
};
export async function uploadFile({
	file,
	fileName,
	vinculationId,
}: UploadFileParams) {
	try {
		if (!file) throw new Error("Arquivo não fornecido.");
		const datetime = new Date().toISOString();
		const fileRef = ref(
			storage,
			`saas/(${vinculationId}) ${fileName} - ${datetime}`,
		);
		const uploadResponse = await uploadBytes(fileRef, file);

		const url = await getDownloadURL(
			ref(storage, uploadResponse.metadata.fullPath),
		);
		const format =
			uploadResponse.metadata.contentType &&
			fileTypes[uploadResponse.metadata.contentType]
				? fileTypes[uploadResponse.metadata.contentType].title
				: "INDEFINIDO";
		const size = uploadResponse.metadata.size;
		return { url, format, size };
	} catch (error) {
		console.log("Error running uploadFile", error);
		throw error;
	}
}
export async function uploadFileAsPDF({
	file,
	fileName,
	vinculationId,
}: UploadFileParams) {
	try {
		if (!file) throw new Error("Arquivo não fornecido.");
		const datetime = new Date().toISOString();
		const fileRef = ref(
			storage,
			`saas/(${vinculationId}) ${fileName} - ${datetime}`,
		);
		const uploadResponse = await uploadBytes(fileRef, file, {
			contentType: "application/pdf",
		});

		const url = await getDownloadURL(
			ref(storage, uploadResponse.metadata.fullPath),
		);
		const format =
			uploadResponse.metadata.contentType &&
			fileTypes[uploadResponse.metadata.contentType]
				? fileTypes[uploadResponse.metadata.contentType].title
				: "INDEFINIDO";
		const size = uploadResponse.metadata.size;
		return { url, format, size };
	} catch (error) {
		console.log("Error running uploadFileAsPDF", error);
		throw error;
	}
}

export function getFileTypeTitle(type: string) {
	return fileTypes[type]?.title || "NÃO DEFINIDO";
}
export function getTitleFileType(title: string) {
	const equivalent = Object.entries(fileTypes).find(
		([key, value]) => title === value.title,
	);
	const type = equivalent ? equivalent[0] : "";
	return type;
}
export function isFileFormatImage(format: string) {
	return [
		"IMAGEM (.PNG)",
		"IMAGEM(.JPEG)",
		"IMAGEM(.TIFF)",
		"IMAGEM(.JPG)",
	].includes(format);
}

export function isFileImage(type: string) {
	return ["png", "jpeg", "tiff", "jpg"].some((x) => type.includes(x));
}
