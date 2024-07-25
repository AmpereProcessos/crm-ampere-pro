import { getServiceOrderById } from '@/repositories/service-orders/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { TServiceOrder, TServiceOrderWithProjectAndAnalysisDTO } from '@/utils/schemas/service-order.schema'
import axios from 'axios'
import { Collection } from 'mongodb'

export async function fetchServiceOrderById({ id }: { id: string }) {
  try {
    const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
    const collection: Collection<TServiceOrder> = db.collection('service-orders')

    const order = await getServiceOrderById({ id, collection, query: {} })
    if (!order) throw new Error('Ordem de serviço não encontrada.')
    return JSON.parse(JSON.stringify(order)) as TServiceOrderWithProjectAndAnalysisDTO
  } catch (error) {
    throw error
  }
}
