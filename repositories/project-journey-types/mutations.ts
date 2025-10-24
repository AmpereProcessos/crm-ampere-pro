import { TProjectJourneyType } from "@/utils/schemas/project-journey-types";
import { Collection, ObjectId } from "mongodb";

type InsertProjectJourneyTypeParams = {
	info: TProjectJourneyType;
	collection: Collection<TProjectJourneyType>;
};
export async function insertProjectJourneyType({ info, collection }: InsertProjectJourneyTypeParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateProjectJourneyTypeParams = {
	id: string;
	collection: Collection<TProjectJourneyType>;
	changes: Partial<TProjectJourneyType>;
};

export async function updateProjectJourneyType({ id, collection, changes }: UpdateProjectJourneyTypeParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
