import createHttpError from "http-errors";
import type { Db, MongoClient } from "mongodb";
import clientPromise from "../mongo-client";

let cachedDb: Db | null = null;
export default async function connectToAmpereProjectsDatabase() {
	if (cachedDb) {
		return cachedDb;
	}
	const client = await clientPromise;
	const db = client.db("projetos");
	cachedDb = db;
	return db;
}
