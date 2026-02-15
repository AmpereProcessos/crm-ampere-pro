import createHttpError from "http-errors";
import { type Db, MongoClient } from "mongodb";

let cachedDb: Db | null = null;
export default async function connectToAmpereDatabase() {
	const uri = process.env.MONGODB_URI;
	if (!uri) throw createHttpError.InternalServerError("Wrong databse URI.");
	if (cachedDb) return cachedDb;
	const client = await MongoClient.connect(uri);
	const db = client.db("solicitacoes");
	cachedDb = db;
	return db;
}
