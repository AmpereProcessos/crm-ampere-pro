import { uploadFile, uploadFileAsPDF } from '@/lib/methods/firebase'
import { getPDFByAnvil } from '@/repositories/integrations/anvil'
import { updateOpportunity } from '@/repositories/opportunities/mutations'
import { insertProposal, updateProposal } from '@/repositories/proposals/mutations'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { ProposalTemplates, ProposeTemplateOptions, getTemplateData } from '@/utils/integrations/general'
import { InsertClientSchema, UpdateClientSchema } from '@/utils/schemas/client.schema'
import { InsertOpportunitySchema, OpportunityWithClientSchema, TOpportunity, UpdateOpportunitySchema } from '@/utils/schemas/opportunity.schema'
import { InsertProposalSchema, TProposal, UpdateProposalSchema } from '@/utils/schemas/proposal.schema'
import axios from 'axios'
import createHttpError from 'http-errors'
import { Collection, Filter, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import toast from 'react-hot-toast'
import { z } from 'zod'

export type TPersonalizedProposalCreationResponse = {
  data: { insertedId: string; fileUrl: string | null | undefined }
  message: string
}

type PostResponse = TPersonalizedProposalCreationResponse

const PersonalizedProposalCreationSchema = z.object({
  proposal: InsertProposalSchema,
  opportunityWithClient: OpportunityWithClientSchema,
  saveAsActive: z.boolean({
    required_error: 'Necessidade de salvamento como proposta ativa não informada.',
    invalid_type_error: 'Tipo não válido para a necessidade de salvamento como proposta ativa.',
  }),
  idAnvil: z
    .string({
      required_error: 'ID de referência do template não informado.',
      invalid_type_error: 'Tipo não válido para o ID de referência do template.',
    })
    .optional()
    .nullable(),
})

const createProposalPersonalized: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'criar', true)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TProposal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const { proposal, opportunityWithClient, saveAsActive, idAnvil } = PersonalizedProposalCreationSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const proposalsCollection: Collection<TProposal> = db.collection('proposals')
  const opportunityCollection: Collection<TOpportunity> = db.collection('opportunities')

  const insertResponse = await insertProposal({ collection: proposalsCollection, info: proposal, partnerId: partnerId || '' })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na criação da proposta.')
  const insertedId = insertResponse.insertedId.toString()
  // In case there is a specified anvil ID
  if (idAnvil) {
    const tag = opportunityWithClient?.nome.replaceAll('/', '').replaceAll('?', '').replaceAll('&', '')
    const template = ProposalTemplates.find((t) => t.idAnvil == idAnvil) || ProposalTemplates[0]
    const anvilTemplateData = getTemplateData({
      opportunity: opportunityWithClient,
      proposal: { _id: insertedId, ...proposal },
      template: template.value as (typeof ProposeTemplateOptions)[number],
    })
    console.log(anvilTemplateData, idAnvil)
    const anvilFileResponse = await getPDFByAnvil({ info: anvilTemplateData, idAnvil: idAnvil })
    console.log(anvilFileResponse)
    const { format, size, url } = await uploadFileAsPDF({ file: anvilFileResponse, fileName: proposal.nome, vinculationId: opportunityWithClient._id })

    await updateProposal({ id: insertedId, collection: proposalsCollection, changes: { urlArquivo: url }, query: partnerQuery })

    if (saveAsActive)
      await updateOpportunity({
        id: opportunityWithClient._id,
        collection: opportunityCollection,
        changes: { idPropostaAtiva: insertedId },
        query: {},
      })

    return res.status(201).json({ data: { insertedId, fileUrl: url }, message: 'Proposta criada com sucesso !' })
  }

  if (saveAsActive)
    await updateOpportunity({
      id: opportunityWithClient._id,
      collection: opportunityCollection,
      changes: { idPropostaAtiva: insertedId },
      query: {},
    })
  return res.status(201).json({ data: { insertedId, fileUrl: undefined }, message: 'Proposta criada com sucesso !' })
}

export type TPersonalizedProposalUpdateResponse = {
  data: { fileUrl: string | null | undefined }
  message: string
}
type PutResponse = TPersonalizedProposalUpdateResponse

const PersonalizedProposalUpdateSchema = z.object({
  proposal: InsertProposalSchema,
  client: UpdateClientSchema,
  opportunity: UpdateOpportunitySchema,
  regenerateFile: z.boolean({
    required_error: 'Necessidade de geração de novo arquivo não informada.',
    invalid_type_error: 'Tipo não válido para a necessidade de geração de novo arquivo.',
  }),
  idAnvil: z
    .string({
      required_error: 'ID de referência do template não informado.',
      invalid_type_error: 'Tipo não válido para o ID de referência do template.',
    })
    .optional()
    .nullable(),
})

const updateProposalPersonalized: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'editar', true)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TProposal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const { id } = req.query
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.')

  const { proposal, client, opportunity, regenerateFile, idAnvil } = PersonalizedProposalUpdateSchema.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const proposalsCollection: Collection<TProposal> = db.collection('proposals')

  if (regenerateFile) {
    if (idAnvil) {
      const tag = opportunity?.nome.replaceAll('/', '').replaceAll('?', '').replaceAll('&', '')
      const template = ProposalTemplates.find((t) => t.idAnvil == idAnvil) || ProposalTemplates[0]
      const anvilTemplateData = getTemplateData({
        opportunity: { ...opportunity, cliente: client },
        proposal: { _id: id, ...proposal },
        template: template.value as (typeof ProposeTemplateOptions)[number],
      })
      console.log(anvilTemplateData)
      const anvilFileResponse = await getPDFByAnvil({ info: anvilTemplateData, idAnvil: idAnvil })

      const { format, size, url } = await uploadFileAsPDF({ file: anvilFileResponse, fileName: proposal.nome, vinculationId: opportunity._id })

      const updateResponse = await updateProposal({
        id: id,
        collection: proposalsCollection,
        changes: { ...proposal, urlArquivo: url },
        query: partnerQuery,
      })
      if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar proposta.')
      if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Nenhum proposta foi encontrada para atualização.')

      return res.status(201).json({ data: { fileUrl: url }, message: 'Proposta atualizada com sucesso !' })
    }
  }

  const updateResponse = await updateProposal({
    id: id,
    collection: proposalsCollection,
    changes: { ...proposal },
    query: partnerQuery,
  })
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar proposta.')
  if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound('Nenhum proposta foi encontrada para atualização.')
  return res.status(201).json({ data: { fileUrl: undefined }, message: 'Proposta atualizada com sucesso !' })
}

export default apiHandler({ POST: createProposalPersonalized, PUT: updateProposalPersonalized })
