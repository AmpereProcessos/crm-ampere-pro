import { TPaymentMethod } from "@/utils/schemas/payment-methods";
import { Collection, Filter, ObjectId } from "mongodb";

type CreatePaymentMethodParams = {
	collection: Collection<TPaymentMethod>;
	info: TPaymentMethod;
	partnerId: string;
};
export async function insertPaymentMethod({ collection, info, partnerId }: CreatePaymentMethodParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdatePaymentMethodParams = {
	id: string;
	collection: Collection<TPaymentMethod>;
	changes: Partial<TPaymentMethod>;
	query: Filter<TPaymentMethod>;
};

export async function updatePaymentMethod({ id, collection, changes, query }: UpdatePaymentMethodParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
