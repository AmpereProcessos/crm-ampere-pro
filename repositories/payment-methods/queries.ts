import { TPaymentMethod } from "@/utils/schemas/payment-methods";
import { Collection, Filter, ObjectId } from "mongodb";

type GetPaymentMethodsParams = {
	collection: Collection<TPaymentMethod>;
	query: Filter<TPaymentMethod>;
};
export async function getPaymentMethods({ collection, query }: GetPaymentMethodsParams) {
	try {
		const paymentMethods = await collection.find({ ...query }).toArray();
		return paymentMethods;
	} catch (error) {
		throw error;
	}
}

type GetPaymentMethodsByIdParams = {
	collection: Collection<TPaymentMethod>;
	id: string;
	query: Filter<TPaymentMethod>;
};
export async function getPaymentMethodsById({ collection, id, query }: GetPaymentMethodsByIdParams) {
	try {
		const paymentMethod = await collection.findOne({ _id: new ObjectId(id), ...query });
		return paymentMethod;
	} catch (error) {
		throw error;
	}
}
