import { apiHandler, type UnwrapNextResponse } from '@/lib/api';
import { getValidCurrentSessionUncached } from '@/lib/auth/session';
import { getProductQtyByCategory, getProductsStr, getServicesStr } from '@/lib/methods/extracting';
import { formatDateAsLocale } from '@/lib/methods/formatting';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import type { TClient } from '@/utils/schemas/client.schema';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import { GeneralStatsFiltersSchema } from '@/utils/schemas/stats.schema';
import dayjs from 'dayjs';
import createHttpError from 'http-errors';
import type { Collection } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';
import { QueryDatesSchema } from '../inputs';

export type TResultsExportsItem = {
  'NOME DO PROJETO': string;
  IDENTIFICADOR: string;
  TIPO: string;
  TELEFONE: string;
  VENDEDOR: string;
  SDR: string;
  'DATA DE GANHO': string;
  'POTÊNCIA VENDIDA': number;
  'QTDE MÓDULOS VENDIDOS': number;
  'QTDE INVERSORES VENDIDOS': number;
  'QTDE INSUMOS VENDIDOS': number;
  'QTDE ESTRUTURAS VENDIDOS': number;
  'QTDE PADRÕES VENDIDOS': number;
  'PRODUTOS VENDIDOS': string;
  'QTDE SERVIÇOS VENDIDOS': number;
  'SERVIÇOS VENDIDOS': string;
  'VALOR VENDA': number;
  'CANAL DE AQUISIÇÃO': string;
  'DATA DE PERDA': string;
  'MOTIVO DA PERDA': string;
  UF: string;
  CIDADE: string;
  'DATA DE ENVIO': string;
  CLASSIFICAÇÃO: string;
  'DATA DE CRIAÇÃO': string;
  'DATA DA ÚLTIMA INTERAÇÃO': string;
};

type TResultsExportsOpportunity = {
  nome: TOpportunity['nome'];
  identificador: TOpportunity['identificador'];
  tipo: TOpportunity['tipo']['titulo'];
  uf: TOpportunity['localizacao']['uf'];
  cidade: TOpportunity['localizacao']['cidade'];
  idMarketing: TOpportunity['idMarketing'];
  responsaveis: TOpportunity['responsaveis'];
  ganho: TOpportunity['ganho'];
  valorProposta: TProposal['valor'];
  potenciaPicoProposta: TProposal['potenciaPico'];
  produtosProposta: TProposal['produtos'];
  servicosProposta: TProposal['servicos'];
  telefone: TClient['telefonePrimario'];
  canalAquisicao: TClient['canalAquisicao'];
  dataPerda: TOpportunity['perda']['data'];
  motivoPerda: TOpportunity['perda']['descricaoMotivo'];
  dataInsercao: TOpportunity['dataInsercao'];
  ultimaInteracao: Exclude<TOpportunity['ultimaInteracao'], undefined | null>['data'];
};

async function exportData(request: NextRequest) {
  const { user } = await getValidCurrentSessionUncached();

  const partnerScope = user.permissoes.parceiros.escopo;
  const userScope = user.permissoes.resultados.escopo;

  const searchParams = request.nextUrl.searchParams;
  const { after, before } = QueryDatesSchema.parse({
    after: searchParams.get('after'),
    before: searchParams.get('before'),
  });
  const payload = await request.json();
  const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(payload);

  console.log('[INFO] [GET_EXPORTS_DATA] Query Params', { after, before });
  console.log('[INFO] [GET_EXPORTS_DATA] Payload', { responsibles, partners, projectTypes });

  // Authorization checks
  if (!!userScope && !responsibles) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  if (!!partnerScope && !partners) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  if (!!userScope && responsibles?.some((r) => !userScope.includes(r))) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  const responsiblesQuery = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {};
  const partnerQuery = partners ? { idParceiro: { $in: [...partners, null] } } : {};
  const projectTypesQuery = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {};

  const afterDate = dayjs(after).toDate();
  const beforeDate = dayjs(before).toDate();

  const db = await connectToDatabase();
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities');

  const opportunities = await getOpportunities({
    opportunitiesCollection,
    responsiblesQuery,
    partnerQuery,
    projectTypesQuery,
    afterDate,
    beforeDate,
  });

  const exportation = opportunities.map((project) => {
    const wonDate = project.ganho?.data;
    const uf = project.uf;
    const city = project.cidade;

    const aquisitionOrigin = project.canalAquisicao;

    const proposeValue = project.valorProposta;
    const proposePower = project.potenciaPicoProposta;
    const proposeProducts = project.produtosProposta;
    const proposeServices = project.servicosProposta;

    const seller = project.responsaveis.find((r) => r.papel === 'VENDEDOR');
    const sdr = project.responsaveis.find((r) => r.papel === 'SDR');

    // Sale channel related information
    const isInbound = !!project.idMarketing;
    const isTransfer = project.responsaveis.length > 1;
    const isFromInsider = !!sdr;
    const isLead = isTransfer && isFromInsider;
    const isSDROwn = !isTransfer && isFromInsider;

    const transferDate = isTransfer && seller?.dataInsercao ? new Date(seller.dataInsercao).toISOString() : null;

    const isOutboundSDR = !isInbound && (isLead || isSDROwn);
    const isOutboundSeller = !isInbound && !isOutboundSDR;

    let classification: string;
    if (isInbound) classification = 'INBOUND';
    else if (isOutboundSDR) classification = 'OUTBOUND SDR';
    else if (isOutboundSeller) classification = 'OUTBOUND VENDEDOR';
    else classification = 'NÃO DEFINIDO';

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
      'QTDE SERVIÇOS VENDIDOS': proposeServices.reduce((acc: number, current: any) => acc + 1, 0),
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
      'DATA DA ÚLTIMA INTERAÇÃO': formatDateAsLocale(project.ultimaInteracao || undefined),
    } as TResultsExportsItem;
  });

  return NextResponse.json({
    data: exportation,
    message: 'Dados exportados com sucesso',
  });
}

type GetProjectsParams = {
  opportunitiesCollection: Collection<TOpportunity>;
  responsiblesQuery: any;
  partnerQuery: any;
  projectTypesQuery: any;
  afterDate: Date;
  beforeDate: Date;
};

async function getOpportunities({
  opportunitiesCollection,
  partnerQuery,
  responsiblesQuery,
  projectTypesQuery,
  afterDate,
  beforeDate,
}: GetProjectsParams) {
  try {
    const afterDateStr = afterDate.toISOString();
    const beforeDateStr = beforeDate.toISOString();
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
    };
    const addFields = {
      activeProposeObjectID: { $toObjectId: '$ganho.idProposta' },
      clientObjectId: { $toObjectId: '$idCliente' },
    };
    const proposeLookup = { from: 'proposals', localField: 'activeProposeObjectID', foreignField: '_id', as: 'proposta' };
    const clientLookup = { from: 'clients', localField: 'clientObjectId', foreignField: '_id', as: 'cliente' };
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
      'ultimaInteracao.data': 1,
      perda: 1,
      dataInsercao: 1,
    };
    const result = await opportunitiesCollection
      .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
      .toArray();

    const opportunities: TResultsExportsOpportunity[] = result.map((r) => ({
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
      telefone: r.cliente[0] ? r.cliente[0].telefonePrimario : null,
      canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : 'NÃO DEFINIDO',
      dataPerda: r.perda?.data || null,
      motivoPerda: r.perda?.descricaoMotivo || null,
      dataInsercao: r.dataInsercao,
      ultimaInteracao: r.ultimaInteracao?.data || null,
    }));

    return opportunities;
  } catch (error) {
    throw new createHttpError.InternalServerError(`Erro ao buscar oportunidades: ${error}`);
  }
}

export type TExportDataRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof exportData>>>;
export const POST = apiHandler({ POST: exportData });
