import { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type CreateFunnelReferenceParams = {
	collection: Collection<TFunnelReference>;
	info: TFunnelReference;
	partnerId?: string | null;
};

export async function insertFunnelReference({ collection, info, partnerId }: CreateFunnelReferenceParams) {
	try {
		const insertResponse = await collection.insertOne({
			...info,
			estagios: {
				[`${info.idEstagioFunil}`]: { entrada: new Date().toISOString() },
			},
			idParceiro: partnerId || "",
			dataInsercao: new Date().toISOString(),
		});
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateFunnelReferenceParams = {
	collection: Collection<TFunnelReference>;
	funnelReferenceId: string;
	newStageId: string | number;
	additionalUpdates: { [key: string]: any };
	// query: Filter<TFunnelReference>
};

export async function updateFunnelReference({ collection, funnelReferenceId, newStageId, additionalUpdates }: UpdateFunnelReferenceParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(funnelReferenceId) }, { $set: { idEstagioFunil: newStageId, ...additionalUpdates } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}

type DeleteFunnelReferenceParams = {
	collection: Collection<TFunnelReference>;
	id: string;
	query: Filter<TFunnelReference>;
};

export async function deleteFunnelReference({ collection, id, query }: DeleteFunnelReferenceParams) {
	try {
		const deleteResponse = await collection.deleteOne({ _id: new ObjectId(id), ...query });
		return deleteResponse;
	} catch (error) {
		throw error;
	}
}
