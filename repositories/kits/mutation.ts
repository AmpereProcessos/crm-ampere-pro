import { TKit } from "@/utils/schemas/kits.schema";
import { Collection } from "mongodb";

type InsertKitParams = {
	collection: Collection<TKit>;
	info: TKit;
	partnerId: string;
};
export async function insertKit({ collection, info, partnerId }: InsertKitParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, idParceiro: partnerId, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
