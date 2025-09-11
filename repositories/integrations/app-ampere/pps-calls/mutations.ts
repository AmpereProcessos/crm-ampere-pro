import type { TPPSCall } from "@/utils/schemas/pps-calls.schema";
import { type Collection, ObjectId } from "mongodb";

type InsertPPSCallParams = {
	collection: Collection<TPPSCall>;
	info: TPPSCall;
};
export async function insertPPSCall({ collection, info }: InsertPPSCallParams) {
	try {
		const insertResponse = await collection.insertOne({
			...info,
			dataInsercao: new Date().toISOString(),
		});
		return insertResponse;
	} catch (error) {
		console.log("Error running insertPPSCall", error);
		throw error;
	}
}

type UpdatePPSCallParams = {
	id: string;
	collection: Collection<TPPSCall>;
	info: Partial<TPPSCall>;
};
export async function updatePPSCall({
	collection,
	id,
	info,
}: UpdatePPSCallParams) {
	try {
		const updateResponse = await collection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: info },
		);
		return updateResponse;
	} catch (error) {
		console.log("Error running updatePPSCall", error);
		throw error;
	}
}
