import type { Db } from "mongodb";
import clientPromise from "./mongo-client";

let cachedDb: Db | null = null;
export default async function connectToDatabase(
	_uri?: unknown,
	database = "crm",
) {
	if (cachedDb) {
		return cachedDb;
	}
	const client = await clientPromise;
	const db = client.db(database);
	cachedDb = db;
	return db;
}
