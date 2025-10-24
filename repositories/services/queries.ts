import { TProduct } from "@/utils/schemas/products.schema";
import { TService, TServiceWithPricingMethod } from "@/utils/schemas/service.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetServicesParams = {
	collection: Collection<TService>;
	query: Filter<TService>;
};
export async function getServices({ collection, query }: GetServicesParams) {
	try {
		const services = await collection.find({ ...query }).toArray();

		return services;
	} catch (error) {
		throw error;
	}
}

type GetServiceByIdParams = {
	collection: Collection<TService>;
	query: Filter<TService>;
	id: string;
};
export async function getServiceById({ collection, query, id }: GetServiceByIdParams) {
	try {
		const service = await collection.findOne({ _id: new ObjectId(id), ...query });
		return service;
	} catch (error) {
		throw error;
	}
}

type GetServicesWithPricingMethodParams = {
	collection: Collection<TService>;
	query: Filter<TService>;
};
export async function getServicesWithPricingMethod({ collection, query }: GetServicesWithPricingMethodParams) {
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
		const arrOfServices = await collection.aggregate(pipeline).toArray();
		const plans = arrOfServices.map((plan) => ({ ...plan, metodologia: plan.metodologia[0] })) as TServiceWithPricingMethod[];
		return plans;
	} catch (error) {
		throw error;
	}
}
