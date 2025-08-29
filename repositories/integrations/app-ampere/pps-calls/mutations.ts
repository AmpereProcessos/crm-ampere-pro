import { TPPSCall } from '@/utils/schemas/pps-calls.schema';
import { Collection } from 'mongodb';

type InsertPPSCallParams = {
  collection: Collection<TPPSCall>;
  info: TPPSCall;
};
export default async function insertPPSCall({ collection, info }: InsertPPSCallParams) {
  try {
    const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
    return insertResponse;
  } catch (error) {
    throw error;
  }
}
