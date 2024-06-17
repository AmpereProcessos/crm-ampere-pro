import { TProcessFlow } from '@/utils/schemas/process-flow.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetProcessFlowByIdParams = {
  collection: Collection<TProcessFlow>
  id: string
  query: Filter<TProcessFlow>
}
export async function getProcessFlowById({ collection, id, query }: GetProcessFlowByIdParams) {
  try {
    const flow = await collection.findOne({ _id: new ObjectId(id), ...query })

    return flow
  } catch (error) {
    throw error
  }
}

type GetProcessFlowsParams = {
  collection: Collection<TProcessFlow>
  query: Filter<TProcessFlow>
}
export async function getProcessFlows({ collection, query }: GetProcessFlowsParams) {
  try {
    const flows = await collection.find({ ...query }).toArray()

    return flows
  } catch (error) {
    throw error
  }
}
