import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler } from '@/utils/api'
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
  const usersCollection: Collection<TUser> = db.collection('users')
  const collection: Collection<TOpportunity> = db.collection('opportunities')

  const users = await usersCollection.find({}).toArray()
  const opportunities = await collection
    .find(
      { dataInsercao: { $gte: interval.start, $lte: interval.end } },
      {
        projection: {
          _id: 1,
          responsaveis: 1,
          dataInsercao: 1,
          idMarketing: 1,
          ganho: 1,
          perda: 1,
        },
      }
    )
    .toArray()

  console.log(opportunities.length)
  const reduced = opportunities.reduce(
    (acc: TResults, curr) => {
      const { responsaveis, dataInsercao, idMarketing, ganho, perda } = curr

      const isWon = !!ganho.data
      const isLost = !!perda.data

      const seller = responsaveis.find((r) => r.papel === 'VENDEDOR')
      const sdr = responsaveis.find((r) => r.papel === 'SDR')

      if (!seller || !sdr) return acc

      const sellerKey = seller.nome
      const sdrKey = sdr.nome

      const sellerUser = users.find((u) => u.nome === sellerKey)
      const sdrUser = users.find((u) => u.nome === sdrKey)

      if (sdrUser?.idGrupo != '66562a2a812707dbf9f04833') return acc
      if (!acc.RECEBIMENTOS[sellerKey]) acc.RECEBIMENTOS[sellerKey] = { totalRecebido: 0, totalGanho: 0, totalPerdido: 0, porSDR: {} }
      if (!acc.RECEBIMENTOS[sellerKey].porSDR[sdrKey]) acc.RECEBIMENTOS[sellerKey].porSDR[sdrKey] = { INBOUND: 0, OUTBOUND: 0 }

      if (!acc.ENVIOS[sdrKey]) acc.ENVIOS[sdrKey] = { totalEnviado: 0, totalGanho: 0, totalPerdido: 0, porVendedor: {} }
      if (!acc.ENVIOS[sdrKey].porVendedor[sellerKey]) acc.ENVIOS[sdrKey].porVendedor[sellerKey] = { INBOUND: 0, OUTBOUND: 0 }

      const isTransfer = !!sdr && !!seller
      if (!isTransfer) return acc

      const transferDate = seller.dataInsercao ? new Date(seller.dataInsercao) : null
      const wasTransferedWithinPeriod = transferDate && transferDate >= new Date(interval.start) && transferDate <= new Date(interval.end)

      console.log(transferDate, new Date(interval.start), new Date(interval.end), wasTransferedWithinPeriod)
      if (!wasTransferedWithinPeriod) return acc

      console.log('GOT HERE')
      const isInbound = !!idMarketing

      if (isInbound) {
        acc.RECEBIMENTOS[sellerKey].totalRecebido += 1
        acc.RECEBIMENTOS[sellerKey].porSDR[sdrKey].INBOUND += 1
        acc.ENVIOS[sdrKey].totalEnviado += 1
        acc.ENVIOS[sdrKey].porVendedor[sellerKey].INBOUND += 1
      } else {
        acc.RECEBIMENTOS[sellerKey].totalRecebido += 1
        acc.RECEBIMENTOS[sellerKey].porSDR[sdrKey].OUTBOUND += 1
        acc.ENVIOS[sdrKey].totalEnviado += 1
        acc.ENVIOS[sdrKey].porVendedor[sellerKey].OUTBOUND += 1
      }

      return acc
    },
    { RECEBIMENTOS: {}, ENVIOS: {} }
  )

  return res.status(200).json(reduced)
}

export default apiHandler({
  GET: getManualExportDataRoute,
})
