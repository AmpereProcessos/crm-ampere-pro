import { TDistance } from "@/utils/schemas/distances.schema";
import { Collection } from "mongodb";

type GetDistanceParams = {
	collection: Collection<TDistance>;
	origin: string;
	destination: string;
};
export async function getDistance({ collection, origin, destination }: GetDistanceParams) {
	try {
		const distanceInformation = await collection.findOne({ origem: origin, destino: destination });
		return distanceInformation;
	} catch (error) {
		throw error;
	}
}
