import axios from "axios";
import { TPartner } from "../schemas/partner.schema";
import { UploadResult, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/services/firebase/storage-config";

type CreatePartnerParams = {
	info: TPartner;
	logo?: File | null;
};
export async function createPartner({ info, logo }: CreatePartnerParams) {
	try {
		var logo_url = info.logo_url;
		if (logo) {
			var imageRef = ref(storage, `saas/logo-${info.nome}`);
			let firebaseResponse = await uploadBytes(imageRef, logo);
			let url = await getDownloadURL(ref(storage, firebaseResponse.metadata.fullPath));
			console.log("RESP URL", logo_url);
			logo_url = url;
		}
		const insertInfo = { ...info, logo_url: logo_url };
		console.log("INSERT INFO", insertInfo);
		const { data } = await axios.post("/api/partners", insertInfo);
		if (typeof data.data == "string") return data.data;
		else return "Parceiro criado com sucesso!";
	} catch (error) {
		throw error;
	}
}
type EditPartnerParams = {
	id: string;
	info: TPartner;
	logo?: File | null;
};
export async function editPartner({ id, info, logo }: EditPartnerParams) {
	try {
		var logo_url = info.logo_url;
		if (logo) {
			var imageRef = ref(storage, `saas/logo-${info.nome}`);
			let firebaseResponse = await uploadBytes(imageRef, logo);
			let url = await getDownloadURL(ref(storage, firebaseResponse.metadata.fullPath));
			console.log("RESP URL", logo_url);
			logo_url = url;
		}
		const insertInfo = { ...info, logo_url: logo_url };
		const { data } = await axios.put(`/api/partners?id=${id}`, insertInfo);
		if (typeof data.data == "string") return data.data;
		else return "Parceiro alterado com sucesso!";
	} catch (error) {
		throw error;
	}
}

export async function editOwnPartner({ id, info, logo }: EditPartnerParams) {
	try {
		var logo_url = info.logo_url;
		if (logo) {
			var imageRef = ref(storage, `saas/logo-${info.nome}`);
			let firebaseResponse = await uploadBytes(imageRef, logo);
			let url = await getDownloadURL(ref(storage, firebaseResponse.metadata.fullPath));
			console.log("RESP URL", logo_url);
			logo_url = url;
		}
		const updateInfo = { ...info, logo_url: logo_url };
		const { data } = await axios.put(`/api/partners/onboarding?id=${id}`, updateInfo);
		if (typeof data.data == "string") return data.data;
		else return "Parceiro alterado com sucesso!";
	} catch (error) {
		throw error;
	}
}
