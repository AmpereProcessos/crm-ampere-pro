import createHttpError from "http-errors";
import { Db, MongoClient } from "mongodb";

let cachedDb: Db | null = null;
export default async function connectToAmpereDatabase(uri: unknown) {
	if (typeof uri != "string") throw createHttpError.InternalServerError("Wrong databse URI.");
	if (cachedDb) {
		return cachedDb;
	}
	const client = await MongoClient.connect(uri);
	const db = client.db("solicitacoes");
	cachedDb = db;
	return db;
}
