import { TClient } from "@/utils/schemas/client.schema";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId, TopologyClosedEvent } from "mongodb";

type CreateOpportunityParams = {
	collection: Collection<TOpportunity>;
	info: TOpportunity;
	partnerId: string | null;
};

export async function insertOpportunity({ collection, info, partnerId }: CreateOpportunityParams) {
	try {
		const lastInsertedIdentificator = await collection
			.aggregate([
				{ $project: { identificador: 1 } },
				{
					$sort: {
						_id: -1,
					},
				},
				{
					$limit: 1,
				},
			])
			.toArray();
		const lastIdentifierNumber = lastInsertedIdentificator[0] ? Number(lastInsertedIdentificator[0].identificador.split("-")[1]) : 0;
		const newIdentifierNumber = lastIdentifierNumber + 1;
		const newIdentifier = `CRM-${newIdentifierNumber}`;

		const insertResponse = await collection.insertOne({
			...info,
			identificador: newIdentifier,
			idParceiro: partnerId || "",
			dataInsercao: new Date().toISOString(),
		});
		return {
			acknowledged: insertResponse.acknowledged,
			insertedId: insertResponse.insertedId?.toString(),
			identifier: newIdentifier,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
}

type InsertOpportunityWithExistingClientParams = {
	collection: Collection<TOpportunity>;
	info: TOpportunity;
	partnerId: string;
	clientId: string;
};
export async function insertOpportunityWithExistingClient({ collection, info, partnerId, clientId }: InsertOpportunityWithExistingClientParams) {
	try {
		const lastInsertedIdentificator = await collection
			.aggregate([
				{ $match: { idParceiro: partnerId } },
				{ $project: { identificador: 1 } },
				{
					$sort: {
						_id: -1,
					},
				},
				{
					$limit: 1,
				},
			])
			.toArray();
		const lastIdentifierNumber = lastInsertedIdentificator[0] ? Number(lastInsertedIdentificator[0].identificador.split("-")[1]) : 0;
		const newIdentifierNumber = lastIdentifierNumber + 1;
		const newIdentifier = `CRM-${newIdentifierNumber}`;

		const opportunity: TOpportunity = {
			...info,
			idCliente: clientId,
			identificador: newIdentifier,
			idParceiro: partnerId,
			dataInsercao: new Date().toISOString(),
		};
		const insertResponse = await collection.insertOne(opportunity);
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
type UpdateOpportunityParams = {
	id: string;
	collection: Collection<TOpportunity>;
	changes: Partial<TOpportunity>;
	query: Filter<TOpportunity>;
};

export async function updateOpportunity({ id, collection, changes, query }: UpdateOpportunityParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
