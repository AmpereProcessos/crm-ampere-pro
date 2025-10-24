import { TProjectType } from "@/utils/schemas/project-types.schema";
import { TProject } from "@/utils/schemas/project.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertProjectTypeParams = {
	collection: Collection<TProjectType>;
	info: TProjectType;
	partnerId: string;
};
export async function insertProjectType({ collection, info, partnerId }: InsertProjectTypeParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateProjectTypeParams = {
	id: string;
	collection: Collection<TProjectType>;
	changes: Partial<TProjectType>;
	query: Filter<TProjectType>;
};

export async function updateProjectType({ id, collection, changes, query }: UpdateProjectTypeParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });

		return updateResponse;
	} catch (error) {
		throw error;
	}
}
