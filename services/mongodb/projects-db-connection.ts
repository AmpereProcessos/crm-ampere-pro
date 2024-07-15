import createHttpError from 'http-errors'
import { Db, MongoClient } from 'mongodb'
import clientPromise from './mongo-client'

let cachedDb: Db | null = null
export default async function connectToDatabase(uri: unknown) {
  if (typeof uri != 'string') throw createHttpError.InternalServerError('Wrong databse URI.')
  if (cachedDb) {
    return cachedDb
  }
  const client = await clientPromise
  const db = client.db('projetos')
  cachedDb = db
  return db
}
