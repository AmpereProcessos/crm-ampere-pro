import { TPricingMethod } from "@/utils/schemas/pricing-method.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetPricingMethodsParams = {
	collection: Collection<TPricingMethod>;
	query: Filter<TPricingMethod>;
};
export async function getPartnerPricingMethods({ collection, query }: GetPricingMethodsParams) {
	try {
		// @ts-ignore
		const pricingMethods = await collection.find({ ...query }, { sort: { dataInsercao: 1 } }).toArray();
		return pricingMethods;
	} catch (error) {
		throw error;
	}
}

type GetPricingMethodByIdParams = {
	id: string;
	collection: Collection<TPricingMethod>;
	query: Filter<TPricingMethod>;
};
export async function getPartnerPricingMethodById({ id, collection, query }: GetPricingMethodByIdParams) {
	try {
		const pricingMethod = await collection.findOne({ _id: new ObjectId(id), ...query });
		return pricingMethod;
	} catch (error) {
		throw error;
	}
}
