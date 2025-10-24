import { TFileReference } from "@/utils/schemas/file-reference.schema";
import { Collection } from "mongodb";

type InsertFileReferenceParams = {
	collection: Collection<TFileReference>;
	info: TFileReference;
	partnerId: string;
};

export async function insertFileReference({ collection, info, partnerId }: InsertFileReferenceParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString(), idParceiro: partnerId });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type InsertManyFileReferencesParams = {
	collection: Collection<TFileReference>;
	info: TFileReference[];
	partnerId: string;
};
export async function insertManyFileReferences({ collection, info, partnerId }: InsertManyFileReferencesParams) {
	try {
		const fileReferences = info.map((i) => ({ ...i, dataInsercao: new Date().toISOString(), idParceiro: partnerId }));
		const insertResponse = await collection.insertMany(fileReferences);
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
