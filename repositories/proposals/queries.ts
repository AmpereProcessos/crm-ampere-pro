import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TPartner } from "@/utils/schemas/partner.schema";
import type { TProposal, TProposalDTOWithOpportunity, TProposalDTOWithOpportunityAndClient } from "@/utils/schemas/proposal.schema";
import { type Collection, type Filter, ObjectId } from "mongodb";
import { getPartnerOwnInformation } from "../partner-simplified/query";
import { getOpportunityById } from "../opportunities/queries";

type GetOpportunityProposalsParams = {
	opportunityId: string;
	collection: Collection<TProposal>;
	query: Filter<TProposal>;
};
export async function getOpportunityProposals({ opportunityId, collection, query }: GetOpportunityProposalsParams) {
	try {
		const proposals = await collection
			.find({ "oportunidade.id": opportunityId, ...query })
			.sort({ _id: -1 })
			.toArray();
		return proposals;
	} catch (error) {
		console.log("Error running getOpportunityProposals query", error);
		throw error;
	}
}
type GetProposalByIdParams = {
	id: string;
	collection: Collection<TProposal>;
	query: Filter<TProposal>;
};
export async function getProposalById({ id, collection, query }: GetProposalByIdParams) {
	try {
		const proposals = await collection
			.aggregate([
				{ $match: { _id: new ObjectId(id), ...query } },
				{
					$addFields: {
						opportunityObjectId: { $toObjectId: "$oportunidade.id" },
						clientObjectId: { $toObjectId: "$idCliente" },
					},
				},
				{
					$lookup: {
						from: "opportunities",
						localField: "opportunityObjectId",
						foreignField: "_id",
						as: "oportunidadeDados",
					},
				},
				{
					$lookup: {
						from: "clients",
						localField: "clientObjectId",
						foreignField: "_id",
						as: "clienteDados",
					},
				},
			])
			.toArray();
		// console.log('propostas', proposals)
		const proposal = proposals.map((p) => {
			return { ...p, oportunidadeDados: p.oportunidadeDados[0], clienteDados: p.clienteDados[0] };
		});
		return proposal[0] as TProposalDTOWithOpportunityAndClient;
	} catch (error) {
		console.log("Error running getProposalById query", error);
		throw error;
	}
}

type GetProposalDocumentByIdParams = {
	id: string;
};
export async function getProposalDocumentById({ id }: GetProposalDocumentByIdParams) {
	const db = await connectToDatabase();
	const proposalsCollection: Collection<TProposal> = db.collection("proposals");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	const proposal = await proposalsCollection.findOne({ _id: new ObjectId(id) });

	if (!proposal)
		return {
			props: {
				error: "PROPOSTA NÃO ENCONTRADA",
			},
		};

	const partnerId = proposal.idParceiro;
	const opportunityId = proposal.oportunidade.id;

	const partner = await getPartnerOwnInformation({ collection: partnersCollection, id: partnerId });
	if (!partner)
		return {
			props: {
				error: "PARCEIRO NÃO ENCONTRADO",
			},
		};
	const opportunity = await getOpportunityById({ collection: opportunitiesCollection, id: opportunityId, query: {} });
	if (!opportunity)
		return {
			props: {
				error: "OPORTUNIDADE NÃO ENCONTRADA",
			},
		};

	return {
		proposal: { ...proposal, id: proposal._id.toString() },
		partner: { ...partner },
		opportunity: { ...opportunity, id: opportunity._id.toString() },
	};
}
