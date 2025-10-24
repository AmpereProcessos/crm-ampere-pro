import { TPricingMethod } from "@/utils/schemas/pricing-method.schema";
import { Collection } from "mongodb";

type CreatePricingMethodParams = {
	collection: Collection<TPricingMethod>;
	info: TPricingMethod;
	partnerId: string;
};
export async function insertPricingMethod({ collection, info, partnerId }: CreatePricingMethodParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
