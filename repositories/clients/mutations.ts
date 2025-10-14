import { formatPhoneAsBase } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import { type Collection, type Filter, ObjectId } from "mongodb";

type InsertClientParams = {
	collection: Collection<TClient>;
	info: TClient;
	partnerId: string;
};

export async function insertClient({
	collection,
	info,
	partnerId,
}: InsertClientParams) {
	const insertResponse = await collection.insertOne({
		...info,
		telefonePrimarioBase: formatPhoneAsBase(info.telefonePrimario ?? ""),
		idParceiro: partnerId,
		dataInsercao: new Date().toISOString(),
	});
	return insertResponse;
}
type UpdateClientParams = {
	id: string;
	collection: Collection<TClient>;
	changes: Partial<TClient>;
	query: Filter<TClient>;
};
export async function updateClient({
	id,
	collection,
	changes,
	query,
}: UpdateClientParams) {
	const updateResponse = await collection.updateOne(
		{ _id: new ObjectId(id), ...query },
		{ $set: { ...changes } },
	);
	return updateResponse;
}
