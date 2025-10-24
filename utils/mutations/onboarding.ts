import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { TPartner } from "../schemas/partner.schema";
import { storage } from "@/services/firebase/storage-config";
import axios from "axios";
import { TUser } from "../schemas/user.schema";
import { TFunnel } from "../schemas/funnel.schema";
import { TPricingMethod } from "../schemas/pricing-method.schema";
import { TPaymentMethod } from "../schemas/payment-methods";

type EditPartnerParams = {
	id: string;
	info: Partial<TPartner> | { [key: string]: any };
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
		const updateInfo = { ...info, logo_url: logo_url };
		const { data } = await axios.put(`/api/onboarding/partner?id=${id}`, updateInfo);
		if (typeof data.data == "string") return data.data;
		else return "Parceiro alterado com sucesso!";
	} catch (error) {
		throw error;
	}
}

export async function createUser({ info }: { info: TUser }) {
	try {
		const { data } = await axios.post("/api/onboarding/user", info);
		return data.data.insertedId as string;
	} catch (error) {
		throw error;
	}
}

export async function createFunnel({ info }: { info: TFunnel }) {
	try {
		const { data } = await axios.post("/api/onboarding/funnel", info);
		if (typeof data.message == "string") return data.message;
		return data.message;
	} catch (error) {
		throw error;
	}
}
export async function createPricingMethod({ info }: { info: TPricingMethod }) {
	try {
		const { data } = await axios.post("/api/onboarding/pricing-method", info);
		if (typeof data.message != "string") return "Metodologia de precificação criada com sucesso !";
		return data.message;
	} catch (error) {
		throw error;
	}
}
export async function createPaymentMethod({ info }: { info: TPaymentMethod }) {
	try {
		const { data } = await axios.post("/api/onboarding/payment-method", info);
		if (typeof data.message != "string") return "Método de pagamento criado com sucesso !";
		return data.message;
	} catch (error) {
		throw error;
	}
}
