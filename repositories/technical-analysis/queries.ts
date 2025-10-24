import {
	TechnicalAnalysisSimplifiedProjection,
	TTechnicalAnalysis,
	TTechnicalAnalysisDTOSimplified,
} from "@/utils/schemas/technical-analysis.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetTechnicalAnalysisParams = {
	collection: Collection<TTechnicalAnalysis>;
	query: Filter<TTechnicalAnalysis>;
};
export async function getTechnicalAnalysis({ collection, query }: GetTechnicalAnalysisParams) {
	try {
		const allAnalysis = await collection.find({ ...query }, { sort: { _id: -1 } }).toArray();
		return allAnalysis;
	} catch (error) {
		throw error;
	}
}

type GetTechnicalAnalysisByIdParams = {
	collection: Collection<TTechnicalAnalysis>;
	analysisId: string;
	query: Filter<TTechnicalAnalysis>;
};
export async function getTechnicalAnalysisById({ collection, query, analysisId }: GetTechnicalAnalysisByIdParams) {
	try {
		const analysis = await collection.findOne({ _id: new ObjectId(analysisId), ...query });
		return analysis;
	} catch (error) {
		throw error;
	}
}

type GetTechnicalAnalysisByOpportunityIdParams = {
	collection: Collection<TTechnicalAnalysis>;
	query: Filter<TTechnicalAnalysis>;
	opportunityId: string;
};
export async function getTechnicalAnalysisByOpportunityId({ collection, query, opportunityId }: GetTechnicalAnalysisByOpportunityIdParams) {
	try {
		const analysis = await collection.find({ "oportunidade.id": opportunityId, ...query }, { sort: { _id: -1 } }).toArray();
		return analysis;
	} catch (error) {
		throw error;
	}
}

type GetTechnicalAnalysisByFilterParams = {
	collection: Collection<TTechnicalAnalysis>;
	query: Filter<TTechnicalAnalysis>;
	skip: number;
	limit: number;
};
export async function getTechnicalAnalysisByFilter({ collection, query, skip, limit }: GetTechnicalAnalysisByFilterParams) {
	// Getting the total analysis matched by the query
	const analysisMatched = await collection.countDocuments({ ...query });
	const sort = { _id: -1 };
	const match = { ...query };
	const analysis = await collection
		.aggregate([{ $sort: sort }, { $match: match }, { $skip: skip }, { $project: TechnicalAnalysisSimplifiedProjection }, { $limit: limit }])
		.toArray();

	return { analysis, analysisMatched } as { analysis: TTechnicalAnalysisDTOSimplified[]; analysisMatched: number };
}
