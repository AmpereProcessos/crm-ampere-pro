import { TProduct, TProductWithPricingMethod } from "@/utils/schemas/products.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetProductsParams = {
	collection: Collection<TProduct>;
	query: Filter<TProduct>;
};
export async function getProducts({ collection, query }: GetProductsParams) {
	try {
		const products = await collection.find({ ...query }).toArray();

		return products;
	} catch (error) {
		throw error;
	}
}

type GetProductByIdParams = {
	collection: Collection<TProduct>;
	id: string;
	query: Filter<TProduct>;
};
export async function getProductById({ collection, id, query }: GetProductByIdParams) {
	try {
		const product = await collection.findOne({ _id: new ObjectId(id), ...query });
		return product;
	} catch (error) {
		throw error;
	}
}

type GetProductsWithPricingMethodParams = {
	collection: Collection<TProduct>;
	query: Filter<TProduct>;
};
export async function getProductsWithPricingMethod({ collection, query }: GetProductsWithPricingMethodParams) {
	const pipeline = [
		{
			$match: {
				...query,
			},
		},
		{
			$addFields: {
				methodologyObjectId: { $toObjectId: "$idMetodologiaPrecificacao" },
			},
		},
		{
			$lookup: {
				from: "pricing-methods",
				localField: "methodologyObjectId",
				foreignField: "_id",
				as: "metodologia",
			},
		},
		{
			$sort: {
				dataInsercao: -1,
			},
		},
	];
	try {
		const arrOfProducts = await collection.aggregate(pipeline).toArray();
		const plans = arrOfProducts.map((plan) => ({ ...plan, metodologia: plan.metodologia[0] })) as TProductWithPricingMethod[];
		return plans;
	} catch (error) {
		throw error;
	}
}
