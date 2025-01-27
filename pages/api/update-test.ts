import { NextApiHandler } from 'next'
import { apiHandler } from '@/utils/api'

import connectToCRMDatabase from '@/services/mongodb/crm-db-connection'

import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { Collection, ObjectId, WithId } from 'mongodb'

import { TFunnelReference } from '@/utils/schemas/funnel-reference.schema'
import { TKit } from '@/utils/schemas/kits.schema'
import { TSignaturePlan } from '@/utils/schemas/signature-plans.schema'
import { TProduct } from '@/utils/schemas/products.schema'
import { TService } from '@/utils/schemas/service.schema'
import { TSaleGoal } from '@/utils/schemas/sale-goal.schema'
import dayjs from 'dayjs'
import { TProposal, TProposalDTO } from '@/utils/schemas/proposal.schema'
import { TClient } from '@/utils/schemas/client.schema'

type PostResponse = any

const migrate: NextApiHandler<PostResponse> = async (req, res) => {
  // const dateWith30DaysInterval = dayjs().subtract(30, 'days').toDate()
  const crmDb = await connectToCRMDatabase(process.env.MONGODB_URI, 'crm')

  const opportunitiesCollection = crmDb.collection<TOpportunity>('opportunities')
  const clientsCollection = crmDb.collection<TClient>('clients')

  const clients = await clientsCollection.find({}).toArray()
  const opportunities = await opportunitiesCollection.find({}).toArray()

  const bulkwriteOpportunities = opportunities.map((opportunity, index, arr) => {
    console.log(`PROCESSANDO ${index + 1} DE ${arr.length}`)
    const client = clients.find((client) => client._id.toString() === opportunity.idCliente)
    // if (!client) console.log('OPPORTUNITY WITHOUT CLIENT', opportunity._id.toString(), opportunity.nome, opportunity.idCliente)
    return {
      updateOne: {
        filter: { _id: new ObjectId(opportunity._id) },
        update: {
          $set: {
            cliente: {
              nome: client?.nome || '',
              cpfCnpj: client?.cpfCnpj || '',
              telefonePrimario: client?.telefonePrimario || '',
              email: client?.email || '',
              canalAquisicao: client?.canalAquisicao || '',
            },
          },
        },
      },
    }
  })
  const bulkwriteResponse = await opportunitiesCollection.bulkWrite(bulkwriteOpportunities)
  // const addFields = { idAsString: { $toString: '$_id' } }
  // const lookup = { from: 'proposals', localField: 'idAsString', foreignField: 'oportunidade.id', as: 'proposta' }

  // const opportunities = await opportunitiesCollection
  //   .find({
  //     'perda.data': null,
  //     'ganho.data': null,
  //     'responsaveis.papel': 'SDR',
  //     'responsaveis.nome': { $ne: 'ARTUR MILANE' },
  //   })
  //   .toArray()
  // const opportunities = (await opportunitiesCollection
  //   .aggregate([{ $match: { 'perda.data': null, 'ganho.data': null } }, { $addFields: addFields }, { $lookup: lookup }])
  //   .toArray()) as (WithId<TOpportunity> & { propostas: WithId<TProposal>[] })[]

  // const bulkwrite = opportunities.map((opportunity) => {
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(opportunity._id) },
  //       update: {
  //         $set: {
  //           responsaveis: [
  //             {
  //               id: '649c80b49538973589a33caf',
  //               nome: 'ALESSANDER IDALECIO',
  //               papel: 'SDR',
  //               avatar_url:
  //                 'https://firebasestorage.googleapis.com/v0/b/sistemaampere.appspot.com/o/usuarios%2Fcrm%2Favatar-alessander_idalecio?alt=media&token=603f5592-c278-43c5-ac1a-6a23ab0e1b29',
  //               telefone: '(34) 98406-1388',
  //               dataInsercao: new Date().toISOString(),
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   }
  // })

  // const kitsCollection: Collection<TKit> = crmDb.collection('kits')
  // const plansCollection: Collection<TSignaturePlan> = crmDb.collection('signature-plans')
  // const productsCollection: Collection<TProduct> = crmDb.collection('products')
  // const servicesCollection: Collection<TService> = crmDb.collection('services')

  // await kitsCollection.updateMany({}, { $set: { idsMetodologiasPagamento: ['661ec619e03128a48f94b4db'] } })
  // await plansCollection.updateMany({}, { $set: { idsMetodologiasPagamento: ['661ec619e03128a48f94b4db'] } })
  // await productsCollection.updateMany({}, { $set: { idsMetodologiasPagamento: ['661ec619e03128a48f94b4db'] } })
  // await servicesCollection.updateMany({}, { $set: { idsMetodologiasPagamento: ['661ec619e03128a48f94b4db'] } })
  // const bkResponse = await opportunitiesCollection.bulkWrite(bulkwrite)
  // console.log(bulkwrite.length)
  // return res.json(bkResponse)

  return res.json(bulkwriteResponse)
}
export default apiHandler({
  GET: migrate,
})

/**
 *
 *
 *        ATUALIZAÇÃO DE ENTIDADES QUANDO HÁ ATUALIZAÇÃO DA REFERÊNCIA DE PARCEIRO DE UM USUÁRIO
 *
 */

// const crmDb = await connectToCRMDatabase(process.env.MONGODB_URI, 'crm')
// const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')
// const funnelReferencesCollection: Collection<TFunnelReference> = crmDb.collection('funnel-references')
// const proposalsCollection: Collection<TProposal> = crmDb.collection('proposals')
// const fileReferencesCollection: Collection<TFileReference> = crmDb.collection('file-references')
// const technicalAnalysisCollection: Collection<TTechnicalAnalysis> = crmDb.collection('technical-analysis')

// const opportunities = await opportunitiesCollection.find({ 'responsaveis.id': '65a581f1197d20ecdcba12a8' }, { projection: { responsaveis: 1 } }).toArray()
// const funnelReferences = await funnelReferencesCollection.find({}, { projection: { idOportunidade: 1 } }).toArray()
// const proposals = await proposalsCollection.find({}, { projection: { 'oportunidade.id': 1 } }).toArray()
// const fileReferences = await fileReferencesCollection.find({}, { projection: { idOportunidade: 1 } }).toArray()
// const analysis = await technicalAnalysisCollection.find({}, { projection: { 'oportunidade.id': 1 } }).toArray()

// const opportunitiesFiltered = opportunities.filter((opportunity) => {
//   const responsibles = opportunity.responsaveis
//   const userWasSeller = responsibles.find((r) => r.id == '65a581f1197d20ecdcba12a8')?.papel == 'VENDEDOR'
//   return !!userWasSeller
// })
// const opportunitiesIds = opportunitiesFiltered.map((o) => o._id.toString())
// const bulkWriteOpportunities = opportunitiesFiltered.map((opportunity) => {
//   return {
//     updateOne: {
//       filter: { _id: new ObjectId(opportunity._id) },
//       update: {
//         $set: {
//           idParceiro: '668bfd75e7d15fe85e605827',
//         },
//       },
//     },
//   }
// })

// const bulkWriteFunnelReferences = funnelReferences
//   .filter((f) => opportunitiesIds.includes(f.idOportunidade))
//   .map((reference) => {
//     return {
//       updateOne: {
//         filter: { _id: new ObjectId(reference._id) },
//         update: {
//           $set: {
//             idParceiro: '668bfd75e7d15fe85e605827',
//           },
//         },
//       },
//     }
//   })
// const bulkWriteProposals = proposals
//   .filter((f) => opportunitiesIds.includes(f.oportunidade.id))
//   .map((proposal) => {
//     return {
//       updateOne: {
//         filter: { _id: new ObjectId(proposal._id) },
//         update: {
//           $set: {
//             idParceiro: '668bfd75e7d15fe85e605827',
//           },
//         },
//       },
//     }
//   })
// const bulkWriteFileReferences = fileReferences
//   .filter((f) => opportunitiesIds.includes(f.idOportunidade || ''))
//   .map((fileReference) => {
//     return {
//       updateOne: {
//         filter: { _id: new ObjectId(fileReference._id) },
//         update: {
//           $set: {
//             idParceiro: '668bfd75e7d15fe85e605827',
//           },
//         },
//       },
//     }
//   })
// const bulkWriteAnalysis = analysis
//   .filter((f) => opportunitiesIds.includes(f.oportunidade.id || ''))
//   .map((analysis) => {
//     return {
//       updateOne: {
//         filter: { _id: new ObjectId(analysis._id) },
//         update: {
//           $set: {
//             idParceiro: '668bfd75e7d15fe85e605827',
//           },
//         },
//       },
//     }
//   })
// const bulkwriteOpportunitiesResponse = bulkWriteOpportunities.length > 0 ? await opportunitiesCollection.bulkWrite(bulkWriteOpportunities) : null
// const bulkwriteFunnelReferencesResponse = bulkWriteFunnelReferences.length > 0 ? await funnelReferencesCollection.bulkWrite(bulkWriteFunnelReferences) : null
// const bulkwriteProposalsResponse = bulkWriteProposals.length > 0 ? await proposalsCollection.bulkWrite(bulkWriteProposals) : null
// const bulkwriteFileReferencesResponse = bulkWriteFileReferences.length > 0 ? await fileReferencesCollection.bulkWrite(bulkWriteFileReferences) : null
// const bulkwriteAnalysisResponse = bulkWriteAnalysis.length > 0 ? await technicalAnalysisCollection.bulkWrite(bulkWriteAnalysis) : null
