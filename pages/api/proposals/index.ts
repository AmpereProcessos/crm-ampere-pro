import { insertProposal, updateProposal } from '@/repositories/proposals/mutations'
import { getOpportunityProposals, getProposalById } from '@/repositories/proposals/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication, validateAuthorization } from '@/utils/api'
import { InsertProposalSchema, TProposal, TProposalDTOWithOpportunity, TProposalEntity } from '@/utils/schemas/proposal.schema'
import createHttpError from 'http-errors'
import { Collection, Filter, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import { getSession } from 'next-auth/react'
import { string, z } from 'zod'

type PostResponse = {
  data: {
    insertedId: string
  }
  message: string
}

const createProposal: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'criar', true)
  const partnerId = session.user.idParceiro

  const proposal = InsertProposalSchema.parse(req.body)
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const proposalsCollection: Collection<TProposal> = db.collection('proposals')
  const insertResponse = await insertProposal({ collection: proposalsCollection, info: proposal, partnerId: partnerId || '' })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na criação da proposta.')
  const insertedId = insertResponse.insertedId.toString()
  res.status(201).json({ data: { insertedId: insertedId }, message: 'Proposta criada com sucesso !' })
}
type GetResponse = {
  data: TProposalDTOWithOpportunity | TProposal[]
}
const getProposals: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'visualizar', true)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TProposal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const { opportunityId, id } = req.query
  if (!opportunityId && !id) throw new createHttpError.BadRequest('ID de referência não fornecido.')
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const proposalsCollection: Collection<TProposal> = db.collection('proposals')
  console.log('ID', id)
  // Query for opportunity proposals
  if (opportunityId) {
    if (typeof opportunityId != 'string' || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest('ID de oportunidade inválido.')
    const proposals = await getOpportunityProposals({ collection: proposalsCollection, opportunityId: opportunityId, query: partnerQuery })
    return res.status(200).json({ data: proposals })
  }
  // Query for specific proposal based on ID
  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID de oportunidade inválido.')
    const proposal = await getProposalById({ collection: proposalsCollection, id: id, query: partnerQuery })
    if (!proposal) throw new createHttpError.NotFound('Proposta não encontrada.')
    return res.status(200).json({ data: proposal })
  }
}
type PutResponse = {
  data: string
  message: string
}

const editProposal: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'editar', true)
  const partnerId = session.user.idParceiro
  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')
  const changes = InsertProposalSchema.partial().parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProposal> = db.collection('proposals')

  const updateResponse = await updateProposal({ id: id, collection: collection, changes: changes, partnerId: partnerId || '' })
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar proposta.')
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Nenhum proposta foi encontrada para atualização.')

  return res.status(200).json({ data: 'Proposta atualizada com sucesso !', message: 'Proposta atualizada com sucesso !' })
}
export default apiHandler({
  GET: getProposals,
  POST: createProposal,
  PUT: editProposal,
  // PUT: updateProposal,
})
