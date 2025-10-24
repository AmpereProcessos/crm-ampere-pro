import { TProjectJourneyType } from "@/utils/schemas/project-journey-types";
import { Collection, Filter, ObjectId } from "mongodb";

type GetProjectJourneyTypeByIdParams = {
	id: string;
	collection: Collection<TProjectJourneyType>;
	query: Filter<TProjectJourneyType>;
};
export async function getProjectJourneyTypeById({ id, collection, query }: GetProjectJourneyTypeByIdParams) {
	try {
		const journeyType = await collection.findOne({ _id: new ObjectId(id), ...query });
		return journeyType;
	} catch (error) {
		throw error;
	}
}
type GetProjectJourneyTypesParams = {
	collection: Collection<TProjectJourneyType>;
	query: Filter<TProjectJourneyType>;
};
export async function getProjectJourneyTypes({ collection, query }: GetProjectJourneyTypesParams) {
	try {
		const journeyTypes = await collection.find({ ...query }).toArray();
		return journeyTypes;
	} catch (error) {
		throw error;
	}
}
