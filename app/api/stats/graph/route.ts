import { apiHandler } from '@/lib/api';
import { getValidCurrentSessionUncached, TUserSession } from '@/lib/auth/session';
import { getPeriodUtils } from '@/lib/methods/dates';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { TOpportunity } from '@/utils/schemas/opportunity.schema';
import { GeneralStatsFiltersSchema, QueryDatesSchema } from '@/utils/schemas/stats.schema';
import dayjs from 'dayjs';
import createHttpError from 'http-errors';
import { Collection, Filter } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

const GraphDataStatsFilterSchema = GeneralStatsFiltersSchema.extend({
  graphType: z.enum(['opportunities-created', 'opportunities-won', 'opportunities-lost', 'total-sold']),
});
export type TGetGraphDataRouteInput = z.infer<typeof GraphDataStatsFilterSchema>;

type TGraphDataReduced = {
  [k: string]: {
    identificador: string;
    valor: number;
  };
};
async function getGraphData({
  session,
  queryParams,
  payload,
}: {
  session: TUserSession;
  queryParams: z.infer<typeof QueryDatesSchema>;
  payload: TGetGraphDataRouteInput;
}) {
  const partnerScope = session.user.permissoes.parceiros.escopo;
  const opportunityVisibilityScope = session.user.permissoes.oportunidades.escopo;

  const { after, before } = queryParams;
  const { responsibles, partners, projectTypes, graphType } = GraphDataStatsFilterSchema.parse(payload);

  const afterDate = new Date(after);
  const beforeDate = new Date(before);
  // Se o usuário tem escopo definido e na requisição não há array de responsáveis definido,
  // então o usuário está tentando acessar uma visualização geral, o que não é permitido
  if (!!opportunityVisibilityScope && !responsibles) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  // Se o usuário tem escopo definido e na requisição não há array de parceiros definido,
  // então o usuário está tentando acessar uma visualização geral, o que não é permitido
  if (!!partnerScope && !partners) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  // Se o usuário tem escopo definido e no array de responsáveis da requisição há um responsável
  // que não está no seu escopo, então o usuário está tentando acessar uma visualização não permitida
  if (!!opportunityVisibilityScope && responsibles?.some((r) => !opportunityVisibilityScope.includes(r))) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  // Se o usuário tem escopo definido e no array de parceiros da requisição há um parceiro
  // que não está no seu escopo, então o usuário está tentando acessar uma visualização não permitida
  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');
  }

  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {};
  const partnerQuery: Filter<TOpportunity> = partners ? { idParceiro: { $in: [...partners] } } : {};
  const projectTypeQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {};

  const query: Filter<TOpportunity> = { ...responsiblesQuery, ...partnerQuery, ...projectTypeQuery };

  const crmDb = await connectToDatabase();
  const opportunitiesCollection = crmDb.collection<TOpportunity>('opportunities');

  const opportunities = await getOpportunities({
    collection: opportunitiesCollection,
    coreQuery: query,
    periodStart: after,
    periodEnd: before,
  });

  const periodUtils = getPeriodUtils({ startDate: new Date(after), endDate: new Date(before) });

  const graphDataReduced = opportunities.reduce<TGraphDataReduced>(
    (acc, current) => {
      const insertDate = new Date(current.dataInsercao);
      const winDate = current.ganho.data ? new Date(current.ganho.data) : null;
      const lossDate = current.dataPerda ? new Date(current.dataPerda) : null;

      if (graphType === 'opportunities-created') {
        const isInsertedWithinPeriod = insertDate >= afterDate && insertDate <= beforeDate;
        if (isInsertedWithinPeriod) {
          const insertionTime = insertDate.getTime();
          const bucket = periodUtils.buckets.find((b) => insertionTime >= b.start && insertionTime <= b.end);
          if (!bucket) return acc;
          const bucketKey = dayjs(bucket.key).format(periodUtils.format);
          acc[bucketKey].valor += 1;
        }
      }
      if (graphType === 'opportunities-won') {
        const isWonWithinPeriod = winDate && winDate >= afterDate && winDate <= beforeDate;
        if (isWonWithinPeriod) {
          const winTime = winDate.getTime();
          const bucket = periodUtils.buckets.find((b) => winTime >= b.start && winTime <= b.end);
          if (!bucket) return acc;
          const bucketKey = dayjs(bucket.key).format(periodUtils.format);
          acc[bucketKey].valor += 1;
        }
      }
      if (graphType === 'opportunities-lost') {
        const isLostWithinPeriod = lossDate && lossDate >= afterDate && lossDate <= beforeDate;
        if (isLostWithinPeriod) {
          const lossTime = lossDate.getTime();
          const bucket = periodUtils.buckets.find((b) => lossTime >= b.start && lossTime <= b.end);
          if (!bucket) return acc;
          const bucketKey = dayjs(bucket.key).format(periodUtils.format);
          acc[bucketKey].valor += 1;
        }
      }
      if (graphType === 'total-sold') {
        const saleValue = current.valorProposta;
        const isWonWithinPeriod = winDate && winDate >= afterDate && winDate <= beforeDate;
        if (isWonWithinPeriod) {
          const winTime = winDate.getTime();
          const bucket = periodUtils.buckets.find((b) => winTime >= b.start && winTime <= b.end);
          if (!bucket) return acc;
          const bucketKey = dayjs(bucket.key).format(periodUtils.format);
          acc[bucketKey].valor += saleValue;
        }
      }
      return acc;
    },
    Object.fromEntries(
      periodUtils.spacedDates.map((date) => [
        dayjs(date).format(periodUtils.format),
        {
          identificador: dayjs(date).format(periodUtils.format),
          valor: 0,
        },
      ])
    )
  );

  return {
    data: Object.values(graphDataReduced),
  };
}
export type TGetGraphDataRouteOutput = Awaited<ReturnType<typeof getGraphData>>;

const getGraphDataHandler = async (request: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const searchParams = request.nextUrl.searchParams;
  const queryParams = QueryDatesSchema.parse({
    after: searchParams.get('after'),
    before: searchParams.get('before'),
  });
  const payload = GraphDataStatsFilterSchema.parse(await request.json());

  const data = await getGraphData({ session, queryParams, payload });
  return NextResponse.json(data);
};
export const POST = apiHandler({ POST: getGraphDataHandler });

type TOpportunitySimplifiedResult = {
  ganho: TOpportunity['ganho'];
  perda: TOpportunity['perda'];
  proposta: { valor: number; potenciaPico: number }[];
  dataInsercao: TOpportunity['dataInsercao'];
};

type TGetOpportunitiesParams = {
  collection: Collection<TOpportunity>;
  coreQuery: Filter<TOpportunity>;
  periodStart: string;
  periodEnd: string;
};
async function getOpportunities({ collection, coreQuery, periodStart, periodEnd }: TGetOpportunitiesParams) {
  const match: Filter<TOpportunity> = {
    ...coreQuery,
    $or: [
      { $and: [{ dataInsercao: { $gte: periodStart } }, { dataInsercao: { $lte: periodEnd } }] },
      { $and: [{ 'perda.data': { $gte: periodStart } }, { 'perda.data': { $lte: periodEnd } }] },
      { $and: [{ 'ganho.data': { $gte: periodStart } }, { 'ganho.data': { $lte: periodEnd } }] },
    ],
  };

  const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' } };
  const lookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' };
  const projection = {
    ganho: 1,
    perda: 1,
    'proposta.valor': 1,
    'proposta.potenciaPico': 1,
    dataInsercao: 1,
  };

  const result = (await collection
    .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }])
    .toArray()) as TOpportunitySimplifiedResult[];

  const opportunities = result.map((r) => ({
    ganho: r.ganho,
    valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
    potenciaProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
    dataPerda: r.perda.data,
    motivoPerda: r.perda.descricaoMotivo,
    dataInsercao: r.dataInsercao,
  }));
  return opportunities;
}
