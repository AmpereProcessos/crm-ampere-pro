import { TServiceOrder, TServiceOrderDTO, TServiceOrderWithProjectAndAnalysis } from "@/utils/schemas/service-order.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetServiceOrdersParams = {
	collection: Collection<TServiceOrder>;
	query: Filter<TServiceOrder>;
};

export async function getServiceOrders({ collection, query }: GetServiceOrdersParams) {
	try {
		const serviceOrders = await collection.find({ ...query }).toArray();

		return serviceOrders;
	} catch (error) {
		throw error;
	}
}

type GetServiceOrderByIdParams = {
	id: string;
	collection: Collection<TServiceOrder>;
	query: Filter<TServiceOrder>;
};
export async function getServiceOrderById({ id, collection, query }: GetServiceOrderByIdParams) {
	try {
		const addFields = { projectAsObjectId: { $toObjectId: "$projeto.id" }, technicalAnalysisAsObjectId: { $toObjectId: "$idAnaliseTecnica" } };
		const projectLookup = { from: "projects", localField: "projectAsObjectId", foreignField: "_id", as: "projetoDados" };
		const analysisLookup = { from: "technical-analysis", localField: "technicalAnalysisAsObjectId", foreignField: "_id", as: "analiseTecnicaDados" };
		const ordersArr = await collection
			.aggregate([{ $match: { _id: new ObjectId(id), ...query } }, { $addFields: addFields }, { $lookup: projectLookup }, { $lookup: analysisLookup }])
			.toArray();

		const order = ordersArr.map((order) => ({ ...order, projetoDados: order.projetoDados[0], analiseTecnicaDados: order.analiseTecnicaDados[0] }));
		return order[0] as TServiceOrderWithProjectAndAnalysis;
	} catch (error) {
		throw error;
	}
}

type GetServiceOrdersByProjectIdParams = {
	projectId: string;
	collection: Collection<TServiceOrder>;
	query: Filter<TServiceOrder>;
};

export async function getServiceOrdersByProjectId({ projectId, collection, query }: GetServiceOrdersByProjectIdParams) {
	try {
		const serviceOrders = await collection.find({ ...query, "projeto.id": projectId }).toArray();

		return serviceOrders;
	} catch (error) {
		throw error;
	}
}

type GetServiceOrdersByFiltersParams = {
	collection: Collection<TServiceOrder>;
	query: Filter<TServiceOrder>;
	skip: number;
	limit: number;
};
export async function getServiceOrdersByFilters({ collection, query, skip, limit }: GetServiceOrdersByFiltersParams) {
	try {
		const serviceOrdersMatched = await collection.countDocuments({ ...query });
		const sort = { _id: -1 };
		const match = { ...query };
		const serviceOrders = await collection.aggregate([{ $sort: sort }, { $match: match }, { $skip: skip }, { $limit: limit }]).toArray();

		return { serviceOrders, serviceOrdersMatched } as { serviceOrders: TServiceOrderDTO[]; serviceOrdersMatched: number };
	} catch (error) {
		throw error;
	}
}
