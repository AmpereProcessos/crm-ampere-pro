import { TPPSCall } from "@/utils/schemas/pps-calls.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetPPSCallsByIdParams = {
	collection: Collection<TPPSCall>;
	id: string;
};
export async function getPPSCallsById({ collection, id }: GetPPSCallsByIdParams) {
	try {
		const call = await collection.findOne({ _id: new ObjectId(id) });
		return call;
	} catch (error) {
		throw error;
	}
}
type GetPPSCallsByOpportunityIdParams = {
	collection: Collection<TPPSCall>;
	opportunityId: string;
	query: Filter<TPPSCall>;
};
export async function getPPSCallsByOpportunityId({ collection, opportunityId, query }: GetPPSCallsByOpportunityIdParams) {
	try {
		const calls = await collection.find({ "projeto.id": opportunityId, ...query }).toArray();
		return calls;
	} catch (error) {
		throw error;
	}
}
type GetPPSCallsByApplicantIdParams = {
	collection: Collection<TPPSCall>;
	applicantId: string;
	query: Filter<TPPSCall>;
};
export async function getPPSCallsByApplicantId({ collection, applicantId, query }: GetPPSCallsByApplicantIdParams) {
	try {
		const calls = await collection.find({ "requerente.idCRM": applicantId, ...query }).toArray();
		return calls;
	} catch (error) {
		throw error;
	}
}

type GetAllPPSCalls = {
	collection: Collection<TPPSCall>;
	query: Filter<TPPSCall>;
};
export async function getAllPPSCalls({ collection, query }: GetAllPPSCalls) {
	try {
		const calls = await collection.find({ ...query }, { sort: { _id: -1 } }).toArray();
		return calls;
	} catch (error) {
		throw error;
	}
}
