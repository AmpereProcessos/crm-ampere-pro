import { NextApiHandler } from 'next'
import { apiHandler, validateAuthorization } from '@/utils/api'

import { Collection, Filter, ObjectId } from 'mongodb'

import dayjs from 'dayjs'

import { formatDateAsLocale, formatProductStr } from '@/lib/methods/formatting'
import createHttpError from 'http-errors'

import { TUser } from '@/utils/schemas/user.schema'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { z } from 'zod'
import { GeneralStatsFiltersSchema, ResponsiblesBodySchema } from '@/utils/schemas/stats.schema'
import { TClient } from '@/utils/schemas/client.schema'
import { getProductQtyByCategory, getProductsStr, getServicesStr } from '@/lib/methods/extracting'

export type TResultsExportsItem = {
  'NOME DO PROJETO': string
  IDENTIFICADOR: string
  TIPO: string
  VENDEDOR: string
  SDR: string
  TELEFONE: string
  'DATA DE GANHO': string
  'VALOR VENDA': number
  'POTÊNCIA VENDIDA': number
  'QTDE MÓDULOS VENDIDOS': number
  'QTDE INVERSORES VENDIDOS': number
  'QTDE INSUMOS VENDIDOS': number
  'QTDE ESTRUTURAS VENDIDOS': number
  'QTDE PADRÕES VENDIDOS': number
  'PRODUTOS VENDIDOS': string
  'QTDE SERVIÇOS VENDIDOS': number
  'SERVIÇOS VENDIDOS': string
  'CANAL DE AQUISIÇÃO': string
  UF: string
  CIDADE: string
  CLASSIFICAÇÃO: string
  'DATA DE PERDA': string
  'MOTIVO DA PERDA': string
  'DATA DE CRIAÇÃO': string
}
const QueryDatesSchema = z.object({
  after: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
  before: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
})
type PostResponse = {
  data: TResultsExportsItem[]
}
const exportData: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarComercial', true)
  const partnerId = session.user.idParceiro
  const partnerScope = session.user.permissoes.parceiros.escopo

  const userId = session.user.id
  const userScope = session.user.permissoes.resultados.escopo
  const { after, before } = QueryDatesSchema.parse(req.query)
  const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(req.body)

  // If user has a scope defined and in the request there isnt a responsible arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!userScope && !responsibles) throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
  // to access a overall visualiation, which he/she isnt allowed
  if (!!partnerScope && !partners) throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the responsible arr request there is a single responsible that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!userScope && responsibles?.some((r) => !userScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  // If user has a scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
  // then user is trying to access a visualization he/she isnt allowed
  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.')

  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {}
  const partnerQuery = partners ? { idParceiro: { $in: [...partners, null] } } : {}
  const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {}

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')

  const opportunities = await getOpportunities({ opportunitiesCollection, responsiblesQuery, partnerQuery, projectTypesQuery, afterDate, beforeDate })

  const exportation = opportunities.map((project) => {
    const wonDate = project.ganho?.data
    const uf = project.uf
    const city = project.cidade

    const aquisitionOrigin = project.canalAquisicao

    const proposeValue = project.valorProposta
    const proposePower = project.potenciaPicoProposta
    const proposeProducts = project.produtosProposta
    const proposeServices = project.servicosProposta

    const seller = project.responsaveis.find((r) => r.papel == 'VENDEDOR')
    const sdr = project.responsaveis.find((r) => r.papel == 'SDR')

    // Sale channel related information
    const isInbound = !!project.idMarketing
    const isTransfer = project.responsaveis.length > 1
    const isFromInsider = !!sdr
    const isLead = isTransfer && isFromInsider
    const isSDROwn = !isTransfer && isFromInsider

    const transferDate = isTransfer && seller?.dataInsercao ? new Date(seller.dataInsercao).toISOString() : null

    const isOutboundSDR = !isInbound && (isLead || isSDROwn)
    const isOutboundSeller = !isInbound && !isOutboundSDR

    var classification
    if (isInbound) classification = 'INBOUND'
    if (isOutboundSDR) classification = 'OUTBOUND SDR'
    if (isOutboundSeller) classification = 'OUTBOUND VENDEDOR'
    return {
      'NOME DO PROJETO': project.nome,
      IDENTIFICADOR: project.identificador || '',
      TIPO: project.tipo,
      TELEFONE: project?.telefone,
      VENDEDOR: seller?.nome || 'NÃO DEFINIDO',
      SDR: sdr?.nome || 'NÃO DEFINIDO',
      'DATA DE GANHO': formatDateAsLocale(wonDate || undefined) || 'NÃO ASSINADO',
      'POTÊNCIA VENDIDA': proposePower,
      'QTDE MÓDULOS VENDIDOS': getProductQtyByCategory(proposeProducts, 'MÓDULO'),
      'QTDE INVERSORES VENDIDOS': getProductQtyByCategory(proposeProducts, 'INVERSOR'),
      'QTDE INSUMOS VENDIDOS': getProductQtyByCategory(proposeProducts, 'INSUMO'),
      'QTDE ESTRUTURAS VENDIDOS': getProductQtyByCategory(proposeProducts, 'ESTRUTURA'),
      'QTDE PADRÕES VENDIDOS': getProductQtyByCategory(proposeProducts, 'PADRÃO'),
      'PRODUTOS VENDIDOS': getProductsStr(proposeProducts),
      'QTDE SERVIÇOS VENDIDOS': proposeServices.reduce((acc, current) => acc + 1, 0),
      'SERVIÇOS VENDIDOS': getServicesStr(proposeServices),
      'VALOR VENDA': proposeValue,
      'CANAL DE AQUISIÇÃO': aquisitionOrigin,
      'DATA DE PERDA': formatDateAsLocale(project.dataPerda || undefined),
      'MOTIVO DA PERDA': project.motivoPerda,
      UF: uf,
      CIDADE: city,
      CLASSIFICAÇÃO: classification || 'NÃO DEFINIDO',
      'DATA DE ENVIO': isTransfer ? formatDateAsLocale(transferDate || undefined) : 'N/A',
      'DATA DE CRIAÇÃO': formatDateAsLocale(project.dataInsercao || undefined),
    } as TResultsExportsItem
  })
  res.json({ data: exportation })
}

export default apiHandler({ POST: exportData })

type TResultsExportsOpportunity = {
  nome: TOpportunity['nome']
  identificador: TOpportunity['identificador']
  tipo: TOpportunity['tipo']['titulo']
  uf: TOpportunity['localizacao']['uf']
  cidade: TOpportunity['localizacao']['cidade']
  idMarketing: TOpportunity['idMarketing']
  responsaveis: TOpportunity['responsaveis']
  ganho: TOpportunity['ganho']
  valorProposta: TProposal['valor']
  potenciaPicoProposta: TProposal['potenciaPico']
  produtosProposta: TProposal['produtos']
  servicosProposta: TProposal['servicos']
  telefone: TClient['telefonePrimario']
  canalAquisicao: TClient['canalAquisicao']
  dataPerda: TOpportunity['perda']['data']
  motivoPerda: TOpportunity['perda']['descricaoMotivo']
  dataInsercao: TOpportunity['dataInsercao']
}
type GetProjectsParams = {
  opportunitiesCollection: Collection<TOpportunity>
  responsiblesQuery: { 'responsaveis.id': { $in: string[] } } | {}
  partnerQuery: { idParceiro: { $in: string[] } } | {}
  projectTypesQuery: { 'tipo.id': { $in: string[] } } | {}
  afterDate: Date
  beforeDate: Date
}
async function getOpportunities({ opportunitiesCollection, partnerQuery, responsiblesQuery, projectTypesQuery, afterDate, beforeDate }: GetProjectsParams) {
  try {
    const afterDateStr = afterDate.toISOString()
    const beforeDateStr = beforeDate.toISOString()
    const match = {
      ...partnerQuery,
      ...responsiblesQuery,
      ...projectTypesQuery,
      $or: [
        { $and: [{ 'responsaveis.dataInsercao': { $gte: afterDateStr } }, { 'responsaveis.dataInsercao': { $lte: beforeDateStr } }] },
        { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
        { $and: [{ 'perda.data': { $gte: afterDateStr } }, { 'perda.data': { $lte: beforeDateStr } }] },
        { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
      ],
      dataExclusao: null,
    }
    const addFields = {
      activeProposeObjectID: {
        $toObjectId: '$ganho.idProposta',
      },
      clientObjectId: { $toObjectId: '$idCliente' },
    }
    const proposeLookup = { from: 'proposals', localField: 'activeProposeObjectID', foreignField: '_id', as: 'proposta' }
    const clientLookup = { from: 'clients', localField: 'clientObjectId', foreignField: '_id', as: 'cliente' }
    const projection = {
      nome: 1,
      identificador: 1,
      'tipo.titulo': 1,
      idMarketing: 1,
      responsaveis: 1,
      ganho: 1,
      'localizacao.uf': 1,
      'localizacao.cidade': 1,
      'proposta.valor': 1,
      'proposta.potenciaPico': 1,
      'proposta.produtos': 1,
      'proposta.servicos': 1,
      'cliente.canalAquisicao': 1,
      perda: 1,
      dataInsercao: 1,
    }
    const result = await opportunitiesCollection
      .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
      .toArray()
    const opportunities = result.map((r) => ({
      nome: r.nome,
      identificador: r.identificador,
      tipo: r.tipo.titulo,
      uf: r.localizacao.uf,
      cidade: r.localizacao.cidade,
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      ganho: r.ganho,
      valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
      potenciaPicoProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
      produtosProposta: r.proposta[0] ? r.proposta[0].produtos : [],
      servicosProposta: r.proposta[0] ? r.proposta[0].servicos : [],
      telefone: r.cliente[0] ? r.cliente[0].telefonePrimario : '',
      canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : 'NÃO DEFINIDO',
      dataPerda: r.perda.data,
      motivoPerda: r.perda.descricaoMotivo,
      dataInsercao: r.dataInsercao,
    }))
    return opportunities as TResultsExportsOpportunity[]
  } catch (error) {
    throw error
  }
}
