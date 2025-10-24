import { TComercialPlan } from "@/utils/schemas/comercial-plans.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetComercialPlanByIdParams = {
	collection: Collection<TComercialPlan>;
	partnerId: string;
	id: string;
};
export async function getComercialPlanById({ id, partnerId, collection }: GetComercialPlanByIdParams) {
	try {
		const plan = await collection.findOne({ _id: new ObjectId(id), idParceiro: partnerId });

		return plan;
	} catch (error) {
		throw error;
	}
}
type GetComercialPlansParams = {
	collection: Collection<TComercialPlan>;
	partnerId: string;
	query: Filter<TComercialPlan>;
};
export async function getComercialPlans({ partnerId, collection }: GetComercialPlansParams) {
	try {
		const plans = await collection.find({ idParceiro: partnerId }).toArray();

		return plans;
	} catch (error) {
		throw error;
	}
}
