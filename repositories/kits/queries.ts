import { TKit } from "@/utils/schemas/kits.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetKitsParams = {
	collection: Collection<TKit>;
	query: Filter<TKit>;
};
export async function getPartnerKits({ collection, query }: GetKitsParams) {
	try {
		const kits = await collection.find({ ...query }, { sort: { _id: -1 } }).toArray();
		return kits;
	} catch (error) {
		throw error;
	}
}

export async function getPartnerActiveKits({ collection, query }: GetKitsParams) {
	try {
		const kits = await collection.find({ ...query, ativo: true }, { sort: { _id: -1 } }).toArray();
		return kits;
	} catch (error) {
		throw error;
	}
}

type GetKitByIdParams = {
	collection: Collection<TKit>;
	id: string;
	query: Filter<TKit>;
};
export async function getKitById({ collection, id, query }: GetKitByIdParams) {
	try {
		const kit = await collection.findOne({ _id: new ObjectId(id), ...query });
		return kit;
	} catch (error) {
		throw error;
	}
}
