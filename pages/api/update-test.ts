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

type Reduced = { [key: string]: string[] }
const migrate: NextApiHandler<PostResponse> = async (req, res) => {
  // const session = await validateAuthenticationWithSession(req, res)
  // const { id } = req.query

  const crmDb = await connectToCRMDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')
  const funnelReferencesCollection: Collection<TFunnelReference> = crmDb.collection('funnel-references')
  const proposalsCollection: Collection<TProposal> = crmDb.collection('proposals')
  const fileReferencesCollection: Collection<TFileReference> = crmDb.collection('file-references')
  const technicalAnalysisCollection: Collection<TTechnicalAnalysis> = crmDb.collection('technical-analysis')

  const opportunities = await opportunitiesCollection.find({ 'responsaveis.id': '65a581f1197d20ecdcba12a8' }, { projection: { responsaveis: 1 } }).toArray()
  const funnelReferences = await funnelReferencesCollection.find({}, { projection: { idOportunidade: 1 } }).toArray()
  const proposals = await proposalsCollection.find({}, { projection: { 'oportunidade.id': 1 } }).toArray()
  const fileReferences = await fileReferencesCollection.find({}, { projection: { idOportunidade: 1 } }).toArray()
  const analysis = await technicalAnalysisCollection.find({}, { projection: { 'oportunidade.id': 1 } }).toArray()

  const opportunitiesFiltered = opportunities.filter((opportunity) => {
    const responsibles = opportunity.responsaveis
    const userWasSeller = responsibles.find((r) => r.id == '65a581f1197d20ecdcba12a8')?.papel == 'VENDEDOR'
    return !!userWasSeller
  })
  const opportunitiesIds = opportunitiesFiltered.map((o) => o._id.toString())
  const bulkWriteOpportunities = opportunitiesFiltered.map((opportunity) => {
    return {
      updateOne: {
        filter: { _id: new ObjectId(opportunity._id) },
        update: {
          $set: {
            idParceiro: '668bfd75e7d15fe85e605827',
          },
        },
      },
    }
  })

  const bulkWriteFunnelReferences = funnelReferences
    .filter((f) => opportunitiesIds.includes(f.idOportunidade))
    .map((reference) => {
      return {
        updateOne: {
          filter: { _id: new ObjectId(reference._id) },
          update: {
            $set: {
              idParceiro: '668bfd75e7d15fe85e605827',
            },
          },
        },
      }
    })
  const bulkWriteProposals = proposals
    .filter((f) => opportunitiesIds.includes(f.oportunidade.id))
    .map((proposal) => {
      return {
        updateOne: {
          filter: { _id: new ObjectId(proposal._id) },
          update: {
            $set: {
              idParceiro: '668bfd75e7d15fe85e605827',
            },
          },
        },
      }
    })
  const bulkWriteFileReferences = fileReferences
    .filter((f) => opportunitiesIds.includes(f.idOportunidade || ''))
    .map((fileReference) => {
      return {
        updateOne: {
          filter: { _id: new ObjectId(fileReference._id) },
          update: {
            $set: {
              idParceiro: '668bfd75e7d15fe85e605827',
            },
          },
        },
      }
    })
  const bulkWriteAnalysis = analysis
    .filter((f) => opportunitiesIds.includes(f.oportunidade.id || ''))
    .map((analysis) => {
      return {
        updateOne: {
          filter: { _id: new ObjectId(analysis._id) },
          update: {
            $set: {
              idParceiro: '668bfd75e7d15fe85e605827',
            },
          },
        },
      }
    })
  const bulkwriteOpportunitiesResponse = bulkWriteOpportunities.length > 0 ? await opportunitiesCollection.bulkWrite(bulkWriteOpportunities) : null
  const bulkwriteFunnelReferencesResponse = bulkWriteFunnelReferences.length > 0 ? await funnelReferencesCollection.bulkWrite(bulkWriteFunnelReferences) : null
  const bulkwriteProposalsResponse = bulkWriteProposals.length > 0 ? await proposalsCollection.bulkWrite(bulkWriteProposals) : null
  const bulkwriteFileReferencesResponse = bulkWriteFileReferences.length > 0 ? await fileReferencesCollection.bulkWrite(bulkWriteFileReferences) : null
  const bulkwriteAnalysisResponse = bulkWriteAnalysis.length > 0 ? await technicalAnalysisCollection.bulkWrite(bulkWriteAnalysis) : null
  return res.json({
    bulkwriteOpportunitiesResponse,
    bulkwriteFunnelReferencesResponse,
    bulkwriteProposalsResponse,
    bulkwriteFileReferencesResponse,
    bulkwriteAnalysisResponse,
  })
  // const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')

  // const opportunities = await opportunitiesCollection.find({ idMarketing: { $ne: null }, dataInsercao: { $gte: '2024-01-01T00:00:00.000Z' } }).toArray()

  // const groupByCity = opportunities.reduce((acc: { [key: string]: { INSERIDOS: number; GANHOS: number; PERDAS: number } }, current) => {
  //   const currentCity = current.localizacao.cidade
  //   const insertDate = new Date(current.dataInsercao)
  //   const wonDate = current.ganho.data ? new Date(current.ganho.data) : null
  //   const lostDate = current.perda.data ? new Date(current.perda.data) : null
  //   const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate
  //   const wasSignedWithinCurrentPeriod = wonDate && wonDate >= afterDate && wonDate <= beforeDate
  //   const wasLostWithinCurrentPeriod = !!lostDate && lostDate >= afterDate && lostDate <= beforeDate

  //   console.log(insertDate, wasInsertedWithinCurrentPeriod)
  //   if (!acc[currentCity]) acc[currentCity] = { INSERIDOS: 0, GANHOS: 0, PERDAS: 0 }
  //   if (!!wasInsertedWithinCurrentPeriod) acc[currentCity].INSERIDOS += 1
  //   if (!!wasSignedWithinCurrentPeriod) acc[currentCity].GANHOS += 1
  //   if (!!wasLostWithinCurrentPeriod) acc[currentCity].PERDAS += 1
  //   return acc
  // }, {})
  // const group = Object.entries(groupByCity).map(([key, value]) => {
  //   return {
  //     CIDADE: key,
  //     ...value,
  //   }
  // })
  // const proposalsCollection: Collection<TProposal> = crmDb.collection('proposals')

  // const proposals = await proposalsCollection.find({ 'kits.0': { $exists: true } }).toArray()

  // const bulkWriteArr = proposals.map((proposal) => {
  //   const products = proposal.produtos
  //   const inverterQty = getInverterQty(products)
  //   const moduleQty = getModulesQty(products)
  //   const modulePeakPower = getModulesPeakPotByProducts(products)

  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(proposal._id) },
  //       update: {
  //         $set: {
  //           'premissas.numModulos': moduleQty,
  //           'premissas.numInversores': inverterQty,
  //           'premissas.potenciaPico': modulePeakPower,
  //         },
  //       },
  //     },
  //   }
  // })
  // const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')

  // const opportunities = await opportunitiesCollection.find({}, { projection: { nome: 1, responsaveis: 1, dataInsercao: 1 } }).toArray()

  // const bulkWriteArr = opportunities.map((opportunity) => {
  //   const insertDate = opportunity.dataInsercao
  //   const responsibles = opportunity.responsaveis.map((resp) => ({ ...resp, dataInsercao: insertDate }))
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(opportunity._id) },
  //       update: {
  //         $set: {
  //           responsaveis: responsibles,
  //         },
  //       },
  //     },
  //   }
  // })
  // const proposalsCollection: Collection<TProposal> = crmDb.collection('proposals')

  // const proposalsToFix = await proposalsCollection.find({ 'planos.id': '' }).toArray()

  // const bulkWriteArr = proposalsToFix.map((proposal) => {
  //   const plans = proposal.planos
  //   const plansFixed = plans.map((p) => {
  //     const equivalentId = PlansEquivalents[p.nome as keyof typeof PlansEquivalents]
  //     console.log(equivalentId, p.nome)
  //     return { ...p, id: equivalentId }
  //   })

  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(proposal._id) },
  //       update: {
  //         $set: {
  //           planos: plansFixed,
  //         },
  //       },
  //     },
  //   }
  // })
  // const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')

  // const opportunities = await opportunitiesCollection.find({}, { projection: { perda: 1 } }).toArray()

  // const bulkWriteArr = opportunities.map((opportunity) => {
  //   const lossReason = opportunity.perda.descricaoMotivo
  //     ? LossReasonsEquivalents[opportunity.perda.descricaoMotivo as keyof typeof LossReasonsEquivalents]
  //     : null
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(opportunity._id) },
  //       update: {
  //         $set: {
  //           'perda.descricaoMotivo': lossReason,
  //         },
  //       },
  //     },
  //   }
  // })
  // const funnelReferencesCollection: Collection<TFunnelReference> = crmDb.collection('funnel-references')

  // const references = await funnelReferencesCollection.find({}).toArray()

  // const bulkwriteArr = references.map((ref) => {
  //   const currentStageId = ref.idEstagioFunil

  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(ref._id) },
  //       update: {
  //         $set: {
  //           [`estagios.${currentStageId}.entrada`]: new Date().toISOString(),
  //         },
  //       },
  //     },
  //   }
  // })
  // const userGroupsCollection: Collection<TUserGroup> = crmDb.collection('user-groups')

  // const usersCollection: Collection<TUser> = crmDb.collection('users')

  // const users = await usersCollection.find({ _id: new ObjectId('6463ccaa8c5e3e227af54d89') })

  // await usersCollection.updateOne({ _id: new ObjectId('6463ccaa8c5e3e227af54d89') }, { $set: { 'teste.teste': 'AAAAA' } })

  // const bulkwriteArr = users.map((user) => {
  //   const newUserGroup = UserGroupEquivalents[user.idGrupo as keyof typeof UserGroupEquivalents]

  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(user._id) },
  //       update: {
  //         $set: {
  //           idGrupo: newUserGroup,
  //         },
  //       },
  //     },
  //   }
  // })
  // const requestsDb = await connectToRequestsDatabase(process.env.MONGODB_URI)

  // const requestsTechnicalAnalysisCollection = requestsDb.collection('analisesTecnicas')

  // // // const proposalsCollection: Collection<TProposal> = db.collection('proposals')
  // const crmAnalysis = await crmTechnicalAnalysisCollection.find({}).toArray()
  // // const requestsAnalysis = await requestsTechnicalAnalysisCollection.find({}).toArray()
  // const typeEquivalents = {
  //   'ALTERAÇÃO DE PROJETO': 'ANÁLISE TÉCNICA REMOTA URBANA',
  //   'VISITA TÉCNICA REMOTA - RURAL': 'ANÁLISE TÉCNICA REMOTA RURAL',
  //   'AUMENTO DE SISTEMA AMPÈRE': 'ANÁLISE TÉCNICA REMOTA URBANA',
  //   'VISITA TÉCNICA IN LOCO - RURAL': 'ANÁLISE TÉCNICA IN LOCO',
  //   'VISITA TÉCNICA REMOTA - URBANA': 'ANÁLISE TÉCNICA REMOTA URBANA',
  //   'AUMENTO DE SISTEMA': 'ANÁLISE TÉCNICA REMOTA RURAL',
  //   'VISITA TÉCNICA IN LOCO - URBANA': 'ANÁLISE TÉCNICA REMOTA URBANA',
  // }
  // const bulkWriteArr = crmAnalysis.map((analysis) => {
  //   const type = typeEquivalents[analysis.tipoSolicitacao]
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(analysis._id) },
  //       update: {
  //         $set: {
  //           tipoSolicitacao: type,
  //         },
  //       },
  //     },
  //   }
  // })
  // const bulkwriteResponse = await crmTechnicalAnalysisCollection.bulkWrite(bulkWriteArr)
  // const bulkWriteArr = opportunities.map((opportunity) => {
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(opportunity._id) },
  //       update: {
  //         $set: {
  //           tipo: {
  //             id: '661ec7e5e03128a48f94b4de',
  //             titulo: 'OPERAÇÃO E MANUTENÇÃO',
  //           },
  //         },
  //       },
  //     },
  //   }
  // })
  // const bulkwriteResponse = await opportunitiesCollection.bulkWrite(bulkWriteArr)
  // const usersCollection: Collection<TUser> = db.collection('users')

  // const opportunities = await opportunitiesCollection.find({}, { projection: { idCliente: 1 } }).toArray()
  // const proposals = await proposalsCollection.find({}).toArray()
  // const users = await usersCollection.find({}).toArray()
  // const bulkWriteArr = proposals.map((proposal) => {
  //   const equivalentOpportunity = opportunities.find((op) => op._id.toString() == proposal.oportunidade.id)
  //   const clientId = equivalentOpportunity?.idCliente || ''
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(proposal._id) },
  //       update: {
  //         $set: {
  //           idCliente: clientId,
  //         },
  //       },
  //     },
  //   }
  // })
  // const bulkwriteResponse = await proposalsCollection.bulkWrite(bulkWriteArr)
  // const usersCollection: Collection<TUser> = db.collection('users')
  // const users = await usersCollection.find({}).toArray()

  // const bulkwriteArr = users.map((user) => {
  //   return {
  //     updateOne: {
  //       filter: { _id: new ObjectId(user._id) },
  //       update: {
  //         $set: {
  //           'permissoes.integracoes.receberLeads': false,
  //         },
  //       },
  //     },
  //   }
  // })
  // const insertManyResponse = await userGroupsCollection.insertMany(insertUserGroups)
}
export default apiHandler({
  GET: migrate,
})
