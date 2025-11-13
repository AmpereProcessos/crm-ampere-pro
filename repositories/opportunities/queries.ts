import {
	SimplifiedOpportunityWithProposalProjection,
	TOpportunity,
	TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
	TOpportunitySimplified,
} from "@/utils/schemas/opportunity.schema";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

type GetOpportunityById = {
	collection: Collection<TOpportunity>;
	id: string;
	query: Filter<TOpportunity>;
};
export async function getOpportunityById({ collection, id, query }: GetOpportunityById) {
	try {
		// const opportunity = await collection.findOne({ _id: new ObjectId(id), idParceiro: partnerId || '' })

		const addFields = {
			clientAsObjectId: { $toObjectId: "$idCliente" },
			partnerAsObjectId: { $toObjectId: "$idParceiro" },
			idAsString: { $toString: "$_id" },
		};
		const clientLookup = { from: "clients", localField: "clientAsObjectId", foreignField: "_id", as: "cliente" };
		const partnerLookup = { from: "partners", localField: "partnerAsObjectId", foreignField: "_id", as: "parceiro" };
		const funnelReferencesLookup = { from: "funnel-references", localField: "idAsString", foreignField: "idOportunidade", as: "referenciasFunil" };
		const opportunityArr = await collection
			.aggregate([
				{
					$match: {
						_id: new ObjectId(id),
						...query,
					},
				},
				{
					$addFields: addFields,
				},
				{
					$lookup: clientLookup,
				},
				{
					$lookup: partnerLookup,
				},
				{
					$lookup: funnelReferencesLookup,
				},
			])
			.toArray();

		const opportunity = opportunityArr.map((op) => ({
			...op,
			_id: op._id.toString(),
			clientAsObjectId: undefined,
			partnerAsObjectId: undefined,
			cliente: op.cliente[0] ? { ...op.cliente[0], _id: op.cliente[0]._id.toString() } : null,
			parceiro: op.parceiro[0] ? { ...op.parceiro[0], _id: op.parceiro[0]._id.toString() } : null,
			referenciasFunil: op.referenciasFunil ? op.referenciasFunil.map((ref: any) => ({ ...ref, _id: ref._id.toString() })) : null,
		}));

		return opportunity[0] as TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	} catch (error) {
		throw error;
	}
}

type GetOpportunityByQueryParams = {
	collection: Collection<TOpportunity>;
	query: Filter<TOpportunity>;
};

type TOpportunityByQueryResult = TOpportunitySimplified;
export async function getOpportunitiesByQuery({ collection, query }: GetOpportunityByQueryParams) {
	try {
		const projection = SimplifiedOpportunityWithProposalProjection;
		const sort = { _id: -1 };
		// const opportunities = await collection.find({ ...query, idParceiro: partnerId || '' }).toArray()
		const opportunities = (await collection
			.aggregate([{ $match: { ...query, dataExclusao: null } }, { $project: projection }, { $sort: sort }])
			.toArray()) as WithId<TOpportunityByQueryResult>[];

		return opportunities;
	} catch (error) {
		throw error;
	}
}

type GetOpportunitiesSimplifiedParams = {
	collection: Collection<TOpportunity>;
	query: Filter<TOpportunity>;
};
export async function getOpportunitiesSimplified({ collection, query }: GetOpportunitiesSimplifiedParams) {
	try {
		const projects = await collection
			.find({ ...query, dataExclusao: null }, { projection: SimplifiedOpportunityWithProposalProjection, sort: { _id: -1 } })
			.toArray();

		return projects as TOpportunitySimplified[];
	} catch (error) {
		throw error;
	}
}
