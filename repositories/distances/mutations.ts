import { TDistance } from "@/utils/schemas/distances.schema";
import { Collection } from "mongodb";

type InsertDistanceParams = {
	collection: Collection<TDistance>;
	origin: string;
	destination: string;
	distance: number;
};
export async function insertDistance({ collection, origin, destination, distance }: InsertDistanceParams) {
	try {
		const newDistance: TDistance = {
			origem: origin,
			destino: destination,
			distancia: distance,
			dataInsercao: new Date().toISOString(),
		};
		const insertResponse = await collection.insertOne(newDistance);
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
