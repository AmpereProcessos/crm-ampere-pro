import { NextApiHandler } from 'next'
import connectToCRMDatabase from '@/services/mongodb/crm-db-connection'
import { Collection, ObjectId } from 'mongodb'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { apiHandler } from '@/utils/api'

type PostResponse = any
const fixOpportunityIdentificatorsFirstStep: NextApiHandler<PostResponse> = async (req, res) => {
  // FIRST STEP
  // Envolve a atualização de todas as oportunidades para identificadores corridos.
  // Primeiro, buscamos todas as oportunidades da coleção ordenadas pelo _id
  // Depois, criamos um bulkwrite mapeando as oportunidades e utilizando do index para definir
  // o número do identificador.

  //   const crmDb = await connectToCRMDatabase(process.env.MONGODB_URI, 'crm')
  //   const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')
  //   const opportunities = await crmDb
  //     .collection('opportunities')
  //     .find({}, { projection: { nome: 1, identificador: 1 }, sort: { _id: 1 } })
  //     .toArray()
  //   const bulkwriteArr = opportunities.map((opportunity, index) => {
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(opportunity._id) },
  //         update: {
  //           $set: {
  //             identificador: `CRM-${index + 1}`,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const opportunitiesBulkwriteResponse = await opportunitiesCollection.bulkWrite(bulkwriteArr)

  return res.json('DESATIVADA')
}

export default apiHandler({ GET: fixOpportunityIdentificatorsFirstStep })
