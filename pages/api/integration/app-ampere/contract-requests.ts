import connectToRequestsDatabase from '@/services/mongodb/ampere/resquests-db-connection'
import connectoToCRMDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication, validateAuthenticationWithSession, validateAuthorization } from '@/utils/api'
import { calculateStringSimilarity } from '@/utils/methods'
import { NextApiHandler } from 'next'
import { Collection, ObjectId } from 'mongodb'

import createHttpError from 'http-errors'
import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { SellersInApp } from '@/utils/select-options'
import { TPartner } from '@/utils/schemas/partner.schema'

type PostResponse = {
  data: { insertedId: string }
  message: string
}

const createRequest: NextApiHandler<PostResponse> = async (req, res) => {
  // await validateAuthentication(req)
  const requestInfo = req.body as TContractRequest
  if (!requestInfo) return 'Ooops, solicitação inválida.'

  const opportunityId = requestInfo.idProjetoCRM
  if (!opportunityId || typeof opportunityId != 'string' || !ObjectId.isValid(opportunityId))
    throw new createHttpError.BadRequest('Referência da oportunidade não encontrada ou inválida, não é possível prosseguir com a solicitação.')

  const crmDb = await connectoToCRMDatabase(process.env.MONGODB_URI, 'crm')
  const crmOpportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities')

  const db = await connectToRequestsDatabase(process.env.OPERATIONAL_MONGODB_URI)
  const collection: Collection<TContractRequest> = db.collection('contrato')
  const partnersCollection: Collection<TPartner> = crmDb.collection('partners')
  // Getting CRM project informations
  const crmOpportunity = await crmOpportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) })

  if (!crmOpportunity) throw new createHttpError.BadRequest('Projeto não encontrado.')

  const partner = await partnersCollection.findOne({ _id: new ObjectId(crmOpportunity.idParceiro) })
  const { responsaveis, idMarketing } = crmOpportunity

  var sellerName = SellersInApp.find((x) => calculateStringSimilarity((requestInfo.nomeVendedor || 'NÃO DEFINIDO')?.toUpperCase(), x) > 80)
  var insiderName: string | undefined = undefined

  const sdr = responsaveis.find((r) => r.papel == 'SDR' || r.papel == 'ANALISTA TÉCNICO')
  // In case there is an insider for the opportunity
  if (sdr) {
    insiderName = SellersInApp.find((x) => calculateStringSimilarity((sdr.nome || 'NÃO DEFINIDO')?.toUpperCase(), x) > 80)
  }
  const insertContractRequestResponse = await collection.insertOne({
    ...requestInfo,
    nomeParceiro: partner?.nome,
    nomeVendedor: sellerName,
    idOportunidade: idMarketing,
    insider: insiderName,
    canalVenda: insiderName ? 'INSIDE SALES' : requestInfo.canalVenda,
    dataSolicitacao: new Date().toISOString(),
  })
  if (!insertContractRequestResponse.acknowledged) throw new createHttpError.BadRequest('Oops, houve um erro desconhecido ao solicitar o contrato')
  const insertedId = insertContractRequestResponse.insertedId.toString()
  // Updating the opportunity with the inserted contract request id
  await crmOpportunitiesCollection.updateOne(
    { _id: new ObjectId(opportunityId) },
    { $set: { 'ganho.idProposta': requestInfo.idPropostaCRM, 'ganho.idSolicitacao': insertedId, 'ganho.dataSolicitacao': new Date().toISOString() } }
  )
  return res.status(201).json({ data: { insertedId }, message: 'Solicitação de contrato criada com sucesso !' })
}

type GetResponse = {
  data: TContractRequest | TContractRequest[]
}

const projection = {
  _id: 1,
  nomeDoContrato: 1,
  codigoSVB: 1,
  nomeVendedor: 1,
  tipoDeServico: 1,
  cidade: 1,
  idVisitaTecnica: 1,
  idProjetoCRM: 1,
  idPropostaCRM: 1,
  confeccionado: 1,
  aprovacao: 1,
  dataSolicitacao: 1,
  dataAprovacao: 1,
}
// const getRequests: NextApiHandler<GetResponse> = async (req, res) => {
//   const session = await validateAuthenticationWithSession(req, res)
//   const visibility = session.user.visibilidade
//   const userName = session.user.name
//   const { id, sellerName, after, before } = req.query

//   if (!after || typeof after != 'string' || !before || typeof before != 'string') throw new createHttpError.BadRequest('Parâmetros de período não fornecidos.')

//   // Validating for invalid parameters for sellerName
//   if (typeof sellerName != 'string') throw new createHttpError.BadRequest('Parâmetro de vendedor inválido.')
//   // Getting the equivalents in APP for both the user and the requested sellerName
//   const equivalentUserName = sellersInApp.find((x) => calculateStringSimilarity(userName.toUpperCase(), x) > 80)
//   const equivalentSellerName = sellersInApp.find((x) => calculateStringSimilarity(sellerName.toUpperCase(), x) > 80)

//   const operationsDb = await connectToRequestsDatabase(process.env.OPERATIONAL_MONGODB_URI)
//   const contractRequestsCollection: Collection<TContractRequest> = operationsDb.collection('contrato')

//   if (sellerName != 'null') {
//     // Validating for unauthorized requests of sellerName
//     if (visibility != 'GERAL' && sellerName != userName)
//       throw new createHttpError.Unauthorized('Usuário não possui permissão para visualizar solicitações de outro usuário.')

//     const sellerRequests = await contractRequestsCollection
//       .find(
//         { nomeVendedor: equivalentSellerName, $and: [{ dataSolicitacao: { $gte: after } }, { dataSolicitacao: { $lte: before } }] },
//         { projection, sort: { _id: -1 } }
//       )
//       .toArray()
//     return res.status(200).json({ data: sellerRequests })
//   }
//   if (id) {
//     if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')
//     const request = await contractRequestsCollection.findOne({ _id: new ObjectId(id) })
//     if (!request) throw new createHttpError.NotFound('Formulário não encontrado.')

//     return res.status(200).json({ data: request })
//   }

//   const sellerQuery = sellerName == 'null' ? (visibility == 'GERAL' ? { $ne: undefined } : equivalentUserName) : equivalentSellerName

//   const requests = await contractRequestsCollection
//     .find({ nomeVendedor: sellerQuery, $and: [{ dataSolicitacao: { $gte: after } }, { dataSolicitacao: { $lte: before } }] }, { projection, sort: { _id: -1 } })
//     .toArray()

//   return res.status(200).json({ data: requests })
// }
export default apiHandler({
  // GET: getRequests,
  POST: createRequest,
})

function findEquivalentUser(user: string) {
  const equivalent = SellersInApp.find((x) => calculateStringSimilarity(user.toUpperCase(), x) > 80)
  return equivalent
}
