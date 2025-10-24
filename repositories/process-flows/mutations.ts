import { TProcessFlow } from "@/utils/schemas/process-flow.schema";
import { Collection } from "mongodb";

type InsertProcessFlowParams = {
	collection: Collection<TProcessFlow>;
	info: TProcessFlow;
};
export async function insertProcessFlow({ collection, info }: InsertProcessFlowParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
