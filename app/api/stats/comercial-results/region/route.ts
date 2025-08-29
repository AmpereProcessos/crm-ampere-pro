import { apiHandler, type UnwrapNextResponse } from '@/lib/api';
import { getValidCurrentSessionUncached } from '@/lib/auth/session';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import { GeneralStatsFiltersSchema } from '@/utils/schemas/stats.schema';
import dayjs from 'dayjs';
import createHttpError from 'http-errors';
import type { Collection, Filter } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';
import { QueryDatesSchema } from '../inputs';

type TResultsByRegionReduced = {
  [key: string]: {
    'OPORTUNIDADES CRIADAS': {
      INBOUND: number;
      OUTBOUND: number;
    };
    'OPORTUNIDADES GANHAS': {
      INBOUND: number;
      OUTBOUND: number;
    };
    'OPORTUNIDADES PERDIDAS': {
      INBOUND: number;
      OUTBOUND: number;
    };
    'VALOR VENDIDO': {
      INBOUND: number;
      OUTBOUND: number;
    };
  };
};

export type TResultsByRegion = {
  CIDADE: string;
  'OPORTUNIDADES CRIADAS': {
    INBOUND: number;
    OUTBOUND: number;
  };
  'OPORTUNIDADES GANHAS': {
    INBOUND: number;
    OUTBOUND: number;
  };
  'OPORTUNIDADES PERDIDAS': {
    INBOUND: number;
    OUTBOUND: number;
  };
  'VALOR VENDIDO': {
    INBOUND: number;
    OUTBOUND: number;
  };
};

async function getResultsByRegion(request: NextRequest) {
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

  console.log('[INFO] [GET_REGION_STATS] Query Params', { after, before });
  console.log('[INFO] [GET_REGION_STATS] Payload', { responsibles, partners, projectTypes });

  // Authorization checks
  if (userScope && !responsibles) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  if (partnerScope && !partners) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  if (userScope && responsibles?.some((r) => !userScope.includes(r))) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  if (partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {};
  const partnerQuery: Filter<TOpportunity> = partners ? { idParceiro: { $in: [...partners] } } : {};
  const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {};

  const afterDate = dayjs(after).toDate();
  const beforeDate = dayjs(before).toDate();

  const db = await connectToDatabase();
  const collection: Collection<TOpportunity> = db.collection('opportunities');

  const query: Filter<TOpportunity> = { ...partnerQuery, ...responsiblesQuery, ...projectTypesQuery };
  const opportunities = await getOpportunities({ collection, query, afterDate, beforeDate });

  const resultsReduced = opportunities.reduce((acc: TResultsByRegionReduced, current) => {
    const city = current.cidade || 'NÃO DEFINIDO';
    if (!acc[city]) {
      acc[city] = {
        'OPORTUNIDADES CRIADAS': { INBOUND: 0, OUTBOUND: 0 },
        'OPORTUNIDADES GANHAS': { INBOUND: 0, OUTBOUND: 0 },
        'OPORTUNIDADES PERDIDAS': { INBOUND: 0, OUTBOUND: 0 },
        'VALOR VENDIDO': { INBOUND: 0, OUTBOUND: 0 },
      };
    }

    // Insertion related data
    const insertionDate = new Date(current.dataInsercao);
    const wasInsertedWithinCurrentPeriod = insertionDate >= afterDate && insertionDate <= beforeDate;
    // Win related data
    const wonDate = current.ganho.data ? new Date(current.ganho.data) : null;
    const wasWonWithinCurrentPeriod = wonDate && wonDate >= afterDate && wonDate <= beforeDate;
    const winValue = current.valorProposta || 0;

    // Loss related data
    const lostDate = current.dataPerda ? new Date(current.dataPerda) : null;
    const wasLostWithinCurrentPeriod = lostDate && lostDate >= afterDate && lostDate <= beforeDate;
    // Sale channel related information
    const isInbound = current.idMarketing;

    if (wasInsertedWithinCurrentPeriod) {
      if (isInbound) acc[city]['OPORTUNIDADES CRIADAS'].INBOUND += 1;
      else acc[city]['OPORTUNIDADES CRIADAS'].OUTBOUND += 1;
    }
    if (wasWonWithinCurrentPeriod) {
      if (isInbound) {
        acc[city]['OPORTUNIDADES GANHAS'].INBOUND += 1;
        acc[city]['VALOR VENDIDO'].INBOUND += winValue;
      } else {
        acc[city]['OPORTUNIDADES GANHAS'].OUTBOUND += 1;
        acc[city]['VALOR VENDIDO'].OUTBOUND += winValue;
      }
    }
    if (wasLostWithinCurrentPeriod) {
      if (isInbound) acc[city]['OPORTUNIDADES PERDIDAS'].INBOUND += 1;
      else acc[city]['OPORTUNIDADES PERDIDAS'].OUTBOUND += 1;
    }
    return acc;
  }, {});

  const results: TResultsByRegion[] = Object.entries(resultsReduced)
    .map(([city, stats]) => ({ CIDADE: city, ...stats }))
    .sort((a, b) => a.CIDADE.localeCompare(b.CIDADE));

  return NextResponse.json({
    data: results,
    message: 'Resultados por região recuperados com sucesso',
  });
}

type GetOpportunitiesParams = {
  collection: Collection<TOpportunity>;
  query: Filter<TOpportunity>;
  afterDate: Date;
  beforeDate: Date;
};

type TResultsByRegionOpportunity = {
  idMarketing: TOpportunity['idMarketing'];
  cidade: TOpportunity['localizacao']['cidade'];
  valorProposta: TProposal['valor'];
  ganho: TOpportunity['ganho'];
  dataPerda: TOpportunity['perda']['data'];
  dataInsercao: TOpportunity['dataInsercao'];
};

async function getOpportunities({ collection, query, afterDate, beforeDate }: GetOpportunitiesParams) {
  const afterDateStr = afterDate.toISOString();
  const beforeDateStr = beforeDate.toISOString();
  const match = {
    ...query,
    $or: [
      { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
      { $and: [{ 'perda.data': { $gte: afterDateStr } }, { 'perda.data': { $lte: beforeDateStr } }] },
      { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
    ],
    dataExclusao: null,
  };

  const projection = {
    idMarketing: 1,
    'localizacao.cidade': 1,
    ganho: 1,
    'proposta.valor': 1,
    perda: 1,
    dataInsercao: 1,
  };
  const opportunities = await collection.aggregate([{ $match: match }, { $project: projection }]).toArray();

  const result: TResultsByRegionOpportunity[] = opportunities.map((opportunity: any) => {
    return {
      idMarketing: opportunity.idMarketing,
      ganho: opportunity.ganho,
      valorProposta: opportunity.proposta?.valor ?? 0,
      cidade: opportunity.localizacao?.cidade || null,
      dataPerda: opportunity.perda?.data || null,
      dataInsercao: opportunity.dataInsercao,
    };
  });

  return result;
}

export type TResultsByRegionRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getResultsByRegion>>>;
export const POST = apiHandler({ POST: getResultsByRegion });
