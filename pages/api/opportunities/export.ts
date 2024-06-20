import { formatDateAsLocale } from '@/lib/methods/formatting'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { TClient } from '@/utils/schemas/client.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import createHttpError from 'http-errors'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { TResultsExportsItem } from '../stats/comercial-results/results-export'

const statusOptionsQueries = {
  GANHOS: { 'ganho.data': { $ne: null } },
  PERDIDOS: { 'perda.data': { $ne: null } },
}

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
  telefone: TClient['telefonePrimario']
  canalAquisicao: TClient['canalAquisicao']
  dataPerda: TOpportunity['perda']['data']
  motivoPerda: TOpportunity['perda']['descricaoMotivo']
  dataInsercao: TOpportunity['dataInsercao']
}

type GetResponse = {
  data: TResultsExportsItem[]
}
const getOpportunitiesExport: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'visualizar', true)
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TOpportunity> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {}

  const userScope = session.user.permissoes.oportunidades.escopo

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')

  const { id, responsible, funnel, after, before, status } = req.query

  if (typeof responsible != 'string') throw new createHttpError.BadRequest('Responsável inválido')
  if (typeof funnel != 'string' || funnel == 'null') throw new createHttpError.BadRequest('Funil inválido')
  if (typeof after != 'string' || typeof before != 'string') throw new createHttpError.BadRequest('Parâmetros de período inválidos.')

  const isPeriodDefined = after != 'undefined' && before != 'undefined'
  const statusOption = statusOptionsQueries[status as keyof typeof statusOptionsQueries] || {}

  // Validing user scope visibility
  if (!!userScope && !userScope.includes(responsible)) throw new createHttpError.BadRequest('Seu escopo de visibilidade não contempla esse usuário.')

  // Defining the responsible query parameters. If specified, filtering opportunities in the provided responsible scope
  const queryResponsible: Filter<TOpportunity> = responsible != 'null' ? { 'responsaveis.id': responsible } : {}
  // Defining, if provided, period query parameters for date of insertion
  const queryInsertion: Filter<TOpportunity> = isPeriodDefined ? { $and: [{ dataInsercao: { $gte: after } }, { dataInsercao: { $lte: before } }] } : {}
  // Defining, if provided, won/lost query parameters
  const queryStatus: Filter<TOpportunity> = status != 'undefined' ? statusOption : { 'perda.data': null, 'ganho.data': null }

  const query = { ...partnerQuery, ...queryResponsible, ...queryInsertion, ...queryStatus }

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
    'cliente.canalAquisicao': 1,
    perda: 1,
    dataInsercao: 1,
  }
  const result = await opportunitiesCollection
    .aggregate([{ $match: query }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
    .toArray()

  const exportation = result.map((project) => {
    const info = {
      nome: project.nome,
      identificador: project.identificador,
      tipo: project.tipo.titulo,
      uf: project.localizacao.uf,
      cidade: project.localizacao.cidade,
      idMarketing: project.idMarketing,
      responsaveis: project.responsaveis,
      ganho: project.ganho,
      valorProposta: project.proposta[0] ? project.proposta[0].valor : 0,
      potenciaPicoProposta: project.proposta[0] ? project.proposta[0].potenciaPico : 0,
      telefone: project.cliente[0] ? project.cliente[0].telefonePrimario : '',
      canalAquisicao: project.cliente[0] ? project.cliente[0].canalAquisicao : 'NÃO DEFINIDO',
      dataPerda: project.perda.data,
      motivoPerda: project.perda.descricaoMotivo,
      dataInsercao: project.dataInsercao,
    } as TResultsExportsOpportunity

    const wonDate = info.ganho?.data
    const uf = info.uf
    const city = info.cidade

    const aquisitionOrigin = info.canalAquisicao

    const proposeValue = info.valorProposta
    const proposePower = info.potenciaPicoProposta

    const seller = info.responsaveis.find((r) => r.papel == 'VENDEDOR')
    const sdr = info.responsaveis.find((r) => r.papel == 'SDR')

    // Sale channel related information
    const isInbound = !!info.idMarketing
    const isTransfer = info.responsaveis.length > 1
    const isFromInsider = !!sdr
    const isLead = isTransfer && isFromInsider
    const isSDROwn = !isTransfer && isFromInsider

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
      UF: uf,
      CIDADE: city,
      'CANAL DE AQUISIÇÃO': aquisitionOrigin,
      CLASSIFICAÇÃO: classification || 'NÃO DEFINIDO',
      'DATA DE GANHO': formatDateAsLocale(wonDate || undefined) || 'NÃO ASSINADO',
      'POTÊNCIA VENDIDA': proposePower,
      'VALOR VENDA': proposeValue,
      'DATA DE PERDA': formatDateAsLocale(project.dataPerda || undefined),
      'MOTIVO DA PERDA': project.motivoPerda,
      'DATA DE CRIAÇÃO': formatDateAsLocale(project.dataInsercao || undefined),
    } as TResultsExportsItem
  })

  return res.status(200).json({ data: exportation })
}

export default apiHandler({ GET: getOpportunitiesExport })
