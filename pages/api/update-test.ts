import { NextApiHandler } from 'next'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'

import connectToCRMDatabase from '@/services/mongodb/crm-db-connection'
import connectToProjectsDatabase from '@/services/mongodb/projects-db-connection'
import connectToRequestsDatabase from '@/services/mongodb/ampere/resquests-db-connection'
import AmpereProjects from '@/ampere-migration/main.projects.json'
import AmpereProposes from '@/ampere-migration/main.proposes.json'
import { TClient } from '@/utils/schemas/client.schema'
import { z } from 'zod'
import { TOpportunity, TOpportunityDTO } from '@/utils/schemas/opportunity.schema'
import { Collection, ObjectId } from 'mongodb'
import { TSolarSystemPropose } from '@/ampere-migration/proposes-schemas/solar-system.schema'
import { THomologationPropose } from '@/ampere-migration/proposes-schemas/homologation.schema'
import { TOeMPropose } from '@/ampere-migration/proposes-schemas/oem.schema'
import { TMonitoringPropose } from '@/ampere-migration/proposes-schemas/monitoring.schema'
import { TPricingItem, TProposal } from '@/utils/schemas/proposal.schema'
import { TKit, TProductItem } from '@/utils/schemas/kits.schema'
import { TUser } from '@/utils/schemas/user.schema'
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema'
import { TFunnelReference } from '@/utils/schemas/funnel-reference.schema'
import { TUserGroup } from '@/utils/schemas/user-groups.schema'
import UserGroup from '@/components/Cards/UserGroup'
import { UserGroups } from '@/utils/select-options'
import { getInverterQty, getModulesPeakPotByProducts, getModulesQty } from '@/lib/methods/extracting'
import { formatDateQuery } from '@/lib/methods/formatting'
import { TFileReference } from '@/utils/schemas/file-reference.schema'
type PostResponse = any

const UserGroupEquivalents = {
  '1': '66562a2a812707dbf9f04830',
  '2': '66562a2a812707dbf9f04831',
  '3': '66562a2a812707dbf9f04832',
  '4': '66562a2a812707dbf9f04833',
}

const LossReasonsEquivalents = {
  'NÃO QUER O PRODUTO/SERVIÇO': 'NÃO QUER O PRODUTO/SERVIÇO',
  'RESCISÃO CONTRATUAL': 'RESCISÃO CONTRATUAL',
  'COMPROU COM OUTRA EMPRESA': 'FECHOU COM OUTRA EMPRESA (GERAL)',
  'CLIENTE NÃO RESPONDE': 'CLIENTE NÃO RESPONDE',
  'OPTOU POR NÃO REALIZAR O PROJETO': 'NÃO QUER O PRODUTO/SERVIÇO',
  'DEMORA NO ATENDIMENTO': 'DEMORA NO ATENDIMENTO',
  'FECHOU COM OUTRA EMPRESA (GERAL)': 'FECHOU COM OUTRA EMPRESA (GERAL)',
  'NÃO GOSTOU DO PORTIFÓLIO (PRODUTOS/SERVIÇOS)': 'NÃO GOSTOU DO PORTIFÓLIO (PRODUTOS/SERVIÇOS)',
  'ACHOU O PREÇO ALTO': 'ACHOU O PREÇO ALTO',
  'PROBLEMAS COM LIBERAÇÃO DE CRÉDITO': 'PROBLEMAS COM LIBERAÇÃO DE CRÉDITO',
}

const PlansEquivalents = {
  'MANUTENÇÃO SIMPLES': '661d828de3446bbfeff1bcf4',
  'PLANO SOL': '660efd7cb535065ae08d459f',
  'PLANO SOL PLUS': '660ff9f61285da49d6dc201e',
}

const migrate: NextApiHandler<PostResponse> = async (req, res) => {
  const crmDb = await connectToCRMDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')
  const funnelReferencesCollection: Collection<TFunnelReference> = crmDb.collection('funnel-references')

  const opportunities = await opportunitiesCollection.find({ 'responsaveis.id': '64c7fbc0cd53f13e52fb534c' }).toArray()
  const funnelReferences = await funnelReferencesCollection.find({ idFunil: '661eaeb6c387dfeddd9a23c9' }).toArray()

  const toUpdate = funnelReferences
    .map((p) => {
      const opportunity = opportunities.find((o) => o._id.toString() == p.idOportunidade)
      if (!opportunity) return null

      const opportunityIsWon = !!opportunity.ganho.data

      const stageMap = {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 5,
        '5': 5,
        '6': 5,
        '7': 5,
        '8': 6,
      }
      return {
        updateOne: {
          filter: { _id: new ObjectId(p._id) },
          update: {
            $set: {
              idFunil: '6682aa86b99e34b5f3581c36',
              idEstagioFunil: opportunityIsWon ? 7 : stageMap[p.idEstagioFunil.toString()] || 5,
            },
          },
        },
      }
    })
    .filter((f) => !!f)

  const bulkwriteResponse = await funnelReferencesCollection.bulkWrite(toUpdate)
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
