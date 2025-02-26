import type { THomologation } from "@/utils/schemas/homologation.schema";
import { type Collection, type Filter, ObjectId } from "mongodb";

type InsertHomologationParams = {
	collection: Collection<THomologation>;
	info: THomologation;
	partnerId: string;
};
export async function insertHomologation({
	collection,
	info,
	partnerId,
}: InsertHomologationParams) {
	try {
		const insertResponse = await collection.insertOne({
			...info,
			dataInsercao: new Date().toISOString(),
		});

		return insertResponse;
	} catch (error) {
		console.log("Error running insertHomologation", error);
		throw error;
	}
}
type UpdateHomologationParams = {
	id: string;
	collection: Collection<THomologation>;
	changes: Partial<THomologation>;
	query: Filter<THomologation>;
};
export async function updateHomologation({
	id,
	collection,
	changes,
	query,
}: UpdateHomologationParams) {
	try {
		const updateResponse = await collection.updateOne(
			{ _id: new ObjectId(id), ...query },
			{ $set: { ...changes } },
		);

		return updateResponse;
	} catch (error) {
		console.log("Error running updateHomologation", error);
		throw error;
	}
}
