import { PartnerSimplifiedProject, TPartner, TPartnerSimplified } from "@/utils/schemas/partner.schema";
import { Collection, Filter, ObjectId, WithId } from "mongodb";

type GetPartnerOwnInformationParams = {
	collection: Collection<TPartner>;
	id: string;
};
export async function getPartnerOwnInformation({ collection, id }: GetPartnerOwnInformationParams) {
	try {
		const parter = await collection.findOne({ _id: new ObjectId(id) }, { projection: PartnerSimplifiedProject });
		return parter as TPartnerSimplified;
	} catch (error) {
		throw error;
	}
}
type GetPartnersSimplifiedParams = {
	collection: Collection<TPartner>;
	query: Filter<TPartner>;
};
export async function getPartnersSimplified({ collection, query }: GetPartnersSimplifiedParams) {
	try {
		const parters = await collection.find({ ...query }, { projection: PartnerSimplifiedProject }).toArray();
		return parters as WithId<TPartnerSimplified>[];
	} catch (error) {
		throw error;
	}
}
