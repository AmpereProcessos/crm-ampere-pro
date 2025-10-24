import { apiHandler, validateAuthentication } from "@/utils/api";
import { NextApiHandler } from "next";
import query from "../kits/query";
import axios from "axios";
import { TDistance } from "@/utils/schemas/distances.schema";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { Collection } from "mongodb";
import createHttpError from "http-errors";
import { getDistance } from "@/repositories/distances/queries";
import { insertDistance } from "@/repositories/distances/mutations";

type GetResponse = {
	data: number;
};
const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const queryDistance: NextApiHandler<GetResponse> = async (req, res) => {
	await validateAuthentication(req, res);
	const { destination, origin } = req.query;

	if (typeof destination != "string" || typeof origin != "string")
		throw new createHttpError.BadRequest("Parâmetros de origem e/ou destino inválidos.");

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TDistance> = db.collection("distances");
	const distanceInDb = await getDistance({ collection, origin, destination });
	console.log(distanceInDb);
	// In case there is a saved distance for the same origin and destination in DB, returning that distance
	if (distanceInDb) return res.json({ data: distanceInDb.distancia });

	console.log("USED DISTANCE FROM GOOGLE API");
	// Else, fetching distance from google apis
	const fixedDestination = removeAccents(destination);
	const fixedOrigin = removeAccents(origin);
	const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fixedOrigin}&destinations=${fixedDestination}&departure_time=now&key=${process.env.DISTANCE_API}`;

	const { data: apiResponse } = await axios.post(url, {});
	const distance = apiResponse.rows[0]?.elements[0]?.distance?.value / 1000;
	await insertDistance({ collection, origin, destination, distance });
	res.json({ data: distance });
};

export default apiHandler({
	GET: queryDistance,
});
