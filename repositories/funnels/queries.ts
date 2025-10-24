import { TFunnel } from "@/utils/schemas/funnel.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";

type GetFunnelByIdParams = {
	collection: Collection<TFunnel>;
	id: string;
	query: Filter<TFunnel>;
};
export async function getFunnelById({ collection, id, query }: GetFunnelByIdParams) {
	try {
		const funnel = await collection.findOne({ _id: new ObjectId(id), ...query });
		if (!funnel) throw new createHttpError.NotFound("Nenhum funil encontrado com o ID fornecido.");
		return funnel;
	} catch (error) {
		throw error;
	}
}

type GetPartnerFunnelsParams = {
	collection: Collection<TFunnel>;
	query: Filter<TFunnel>;
};
export async function getPartnerFunnels({ collection, query }: GetPartnerFunnelsParams) {
	try {
		const funnels = await collection.find({ ...query }).toArray();
		return funnels;
	} catch (error) {
		throw error;
	}
}
