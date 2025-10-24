import { Optional } from "@/utils/models";
import { TSaleGoal } from "@/utils/schemas/sale-goal.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type UpdateSaleGoalParams = {
	collection: Collection<TSaleGoal>;
	id: string;
	query: Filter<TSaleGoal>;
	changes: Partial<TSaleGoal>;
};
export async function updateSaleGoal({ collection, id, query, changes }: UpdateSaleGoalParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
