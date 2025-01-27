import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler } from '@/utils/api'
import { TClient } from '@/utils/schemas/client.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TUser } from '@/utils/schemas/user.schema'
import { Collection } from 'mongodb'
import { NextApiHandler } from 'next'

type TResults = {
  RECEBIMENTOS: {
    [seller: string]: {
      totalRecebido: number
      totalGanho: number
      totalPerdido: number
      porSDR: {
        [sdr: string]: {
          INBOUND: number
          OUTBOUND: number
        }
      }
    }
  }
  ENVIOS: {
    [sdr: string]: {
      totalEnviado: number
      totalGanho: number
      totalPerdido: number
      porVendedor: {
        [seller: string]: {
          INBOUND: number
          OUTBOUND: number
        }
      }
    }
  }
}

const interval = {
  start: '2024-01-01T00:00:00.000Z',
  end: '2024-12-31T23:59:59.999Z',
}
type GetResponse = any
const getManualExportDataRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const clientsCollection: Collection<TClient> = db.collection('clients')

  const clients = await clientsCollection.find({}).toArray()

  return res.status(200).json(clients.map((client) => ({ id: client._id.toString(), name: client.nome, email: client.email, phone: client.telefonePrimario })))
}

export default apiHandler({
  GET: getManualExportDataRoute,
})
