import { apiHandler, type UnwrapNextResponse } from '@/lib/api';
import { getValidCurrentSessionUncached } from '@/lib/auth/session';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import type { TClient } from '@/utils/schemas/client.schema';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import type { TSaleGoal } from '@/utils/schemas/sale-goal.schema';
import { GeneralStatsFiltersSchema } from '@/utils/schemas/stats.schema';
import dayjs from 'dayjs';
import createHttpError from 'http-errors';
import type { Collection, Filter } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';
import { QueryDatesSchema } from '../inputs';

export type TSDRTeamResults = {
  [key: string]: {
    potenciaPico: {
      objetivo: number;
      atingido: number;
      origem: {
        INBOUND: number;
        OUTBOUND: number;
      };
    };
    valorVendido: {
      objetivo: number;
      atingido: number;
      origem: {
        INBOUND: number;
        OUTBOUND: number;
      };
    };
    projetosVendidos: {
      objetivo: number;
      atingido: number;
      origem: {
        INBOUND: number;
        OUTBOUND: number;
      };
    };
    projetosCriados: {
      objetivo: number;
      atingido: number;
      origem: {
        INBOUND: number;
        OUTBOUND: number;
      };
    };
    projetosEnviados: {
      objetivo: number;
      atingido: number;
      origem: {
        INBOUND: number;
        OUTBOUND: number;
      };
    };

    'POR VENDEDOR': {
      [key: string]: {
        recebido: 0;
        ganho: 0;
        perdido: 0;
      };
    };
  };
};

async function getSalesSDRResults(request: NextRequest) {
  const { user } = await getValidCurrentSessionUncached();
  if (!user) {
    throw new createHttpError.Unauthorized('Nível de autorização insuficiente.');
  }
  if (!user.permissoes?.resultados?.visualizarComercial) {
    throw new createHttpError.Unauthorized('Nível de autorização insuficiente.');
  }
  const partnerScope = user.permissoes.parceiros.escopo;
  const userScope = user.permissoes.resultados.escopo;

  const searchParams = request.nextUrl.searchParams;
  const searchParamsObject = {
    after: searchParams.get('after'),
    before: searchParams.get('before'),
  };
  const payload = await request.json();
  const { after, before } = QueryDatesSchema.parse(searchParamsObject);
  const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(payload);

  console.log('[INFO] [GET_SALES_SDR_STATS] Query Params', { after, before });
  console.log('[INFO] [GET_SALES_SDR_STATS] Payload', { responsibles, partners, projectTypes });

  if (!!userScope && !responsibles)
    // If user has a scope defined and in the request there isnt a responsible arr defined, then user is trying
    // to access a overall visualiation, which he/she isnt allowed
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');

  if (!!partnerScope && !partners)
    // If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
    // to access a overall visualiation, which he/she isnt allowed
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');

  if (!!userScope && responsibles?.some((r) => !userScope.includes(r)))
    // If user has a scope defined and in the responsible arr request there is a single responsible that is not in hes/shes scope
    // then user is trying to access a visualization he/she isnt allowed
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');

  if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
    // If user has a scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
    // then user is trying to access a visualization he/she isnt allowed
    throw new createHttpError.Unauthorized('Seu usuário não possui solicitação para esse escopo de visualização.');

  const responsiblesQuery: Filter<TOpportunity> = responsibles ? { 'responsaveis.id': { $in: responsibles } } : {};
  const partnerQuery = partners ? { idParceiro: { $in: [...partners, null] } } : {};
  const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { 'tipo.id': { $in: [...projectTypes] } } : {};

  const userSaleGoalQuery: Filter<TSaleGoal> = responsibles ? { 'usuario.id': { $in: responsibles } } : {};

  const afterDate = dayjs(after).toDate();
  const beforeDate = dayjs(before).toDate();
  const currentPeriod = dayjs(beforeDate).format('MM/YYYY');

  const afterWithMarginDate = dayjs(afterDate).subtract(1, 'month').toDate();
  const beforeWithMarginDate = dayjs(beforeDate).subtract(1, 'month').toDate();

  const db = await connectToDatabase();
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities');
  const saleGoalsCollection: Collection<TSaleGoal> = db.collection('sale-goals');

  const saleGoals = await getSaleGoals({ saleGoalsCollection, currentPeriod, userSaleGoalQuery, partnerQuery: partnerQuery as Filter<TSaleGoal> });
  const projects = await getOpportunities({
    opportunitiesCollection,
    afterDate,
    beforeDate,
    responsiblesQuery,
    partnerQuery: partnerQuery as Filter<TOpportunity>,
    projectTypesQuery,
  });

  console.log('[INFO] [GET_SALES_SDR_STATS] Projects', projects.length);
  const sdrResults = projects.reduce((acc: TSDRTeamResults, current) => {
    // Insertion related checkings
    const currentPeriod = dayjs(beforeDate).format('MM/YYYY');
    const insertDate = new Date(current.dataInsercao);
    const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;

    // if (!wasInsertedWithinCurrentPeriod) return acc

    // Signing related checkings
    const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null;
    const hasContractSigned = !!signatureDate;
    const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate;
    const wasSignedWithinPreviousPeriod = hasContractSigned && signatureDate >= afterWithMarginDate && signatureDate < beforeWithMarginDate;
    const proposeValue = current.valorProposta;
    const proposePeakPower = current.potenciaPicoProposta || 0;

    const lossDate = current.perda?.data ? new Date(current.perda.data) : null;
    const sdr = current.responsaveis.find((r) => r.papel === 'SDR');
    if (!sdr) return acc;

    const seller = current.responsaveis.find((r) => r.papel === 'VENDEDOR');

    const sdrSaleGoals = saleGoals.find((goals) => goals.usuario?.id === sdr.nome && goals.periodo === currentPeriod);

    // If there is a sdr and seller, than is a trasfered project
    const isTransfer = !!sdr && !!seller;

    const transferDate = seller?.dataInsercao ? new Date(seller.dataInsercao) : null;
    const wasTransferedWithinCurrentPeriod = transferDate && transferDate >= afterDate && transferDate <= beforeDate;

    const isInbound = !!current.idMarketing;
    if (!acc[sdr.nome]) {
      acc[sdr.nome] = {
        potenciaPico: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        valorVendido: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        projetosVendidos: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        projetosCriados: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },
        projetosEnviados: {
          objetivo: 0,
          atingido: 0,
          origem: {
            INBOUND: 0,
            OUTBOUND: 0,
          },
        },

        'POR VENDEDOR': {
          'NÃO DEFINIDO': { recebido: 0, ganho: 0, perdido: 0 },
        },
      };
    }
    // Creating info for the current responsible, if non-existent
    if (isTransfer && !acc[sdr.nome]['POR VENDEDOR'][seller.nome]) acc[sdr.nome]['POR VENDEDOR'][seller.nome] = { recebido: 0, ganho: 0, perdido: 0 };

    // Defining goal information, if existent
    if (sdrSaleGoals) {
      acc[sdr.nome].potenciaPico.objetivo = sdrSaleGoals.metas.potenciaVendida || 0;
      acc[sdr.nome].valorVendido.objetivo = sdrSaleGoals.metas.valorVendido || 0;
      acc[sdr.nome].projetosVendidos.objetivo = sdrSaleGoals.metas.projetosVendidos || 0;
      acc[sdr.nome].projetosCriados.objetivo = sdrSaleGoals.metas.projetosCriados || 0;
      acc[sdr.nome].projetosEnviados.objetivo = sdrSaleGoals.metas.projetosEnviados || 0;
    }
    if (wasInsertedWithinCurrentPeriod) {
      acc[sdr.nome].projetosCriados.atingido += 1;

      if (isInbound) acc[sdr.nome].projetosCriados.origem.INBOUND += 1;
      if (!isInbound) acc[sdr.nome].projetosCriados.origem.OUTBOUND += 1;
    }
    if (wasTransferedWithinCurrentPeriod) {
      if (isTransfer) acc[sdr.nome].projetosEnviados.atingido++;
      if (isTransfer) acc[sdr.nome]['POR VENDEDOR'][seller.nome].recebido++;
      if (isTransfer && isInbound) acc[sdr.nome].projetosEnviados.origem.INBOUND++;
      if (isTransfer && !isInbound) acc[sdr.nome].projetosEnviados.origem.OUTBOUND++;
    }
    if (wasSignedWithinCurrentPeriod) {
      acc[sdr.nome].potenciaPico.atingido += proposePeakPower;
      acc[sdr.nome].valorVendido.atingido += proposeValue;
      acc[sdr.nome].projetosVendidos.atingido += 1;

      if (isInbound) acc[sdr.nome].potenciaPico.origem.INBOUND += proposePeakPower;
      if (!isInbound) acc[sdr.nome].potenciaPico.origem.OUTBOUND += proposePeakPower;
      if (isInbound) acc[sdr.nome].valorVendido.origem.INBOUND += proposeValue;
      if (!isInbound) acc[sdr.nome].valorVendido.origem.OUTBOUND += proposeValue;
      if (isInbound) acc[sdr.nome].projetosVendidos.origem.INBOUND += 1;
      if (!isInbound) acc[sdr.nome].projetosVendidos.origem.OUTBOUND += 1;
    }

    if (!!signatureDate && seller) acc[sdr.nome]['POR VENDEDOR'][seller.nome].ganho += 1;
    if (!!lossDate && seller) acc[sdr.nome]['POR VENDEDOR'][seller.nome].perdido += 1;

    return acc;
  }, {});
  return NextResponse.json({
    data: sdrResults,
    message: 'Resultados por SDR recuperados com sucesso',
  });
}

export type TSDRTeamResultsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getSalesSDRResults>>>;
export const POST = apiHandler({ POST: getSalesSDRResults });
async function getSaleGoals({
  saleGoalsCollection,
  currentPeriod,
  userSaleGoalQuery,
  partnerQuery,
}: {
  saleGoalsCollection: Collection<TSaleGoal>;
  currentPeriod: string;
  userSaleGoalQuery: Filter<TSaleGoal>;
  partnerQuery: Filter<TSaleGoal>;
}) {
  try {
    const saleGoals = await saleGoalsCollection.find({ periodo: currentPeriod, ...partnerQuery, ...userSaleGoalQuery }).toArray();
    return saleGoals;
  } catch (error) {
    console.log('[ERROR] Error getting sale goals', error);
    throw error;
  }
}
type GetProjectsParams = {
  opportunitiesCollection: Collection<TOpportunity>;
  responsiblesQuery: Filter<TOpportunity>;
  partnerQuery: Filter<TOpportunity>;
  projectTypesQuery: Filter<TOpportunity>;
  afterDate: Date;
  beforeDate: Date;
};
type TSDRResultsProject = {
  idMarketing: TOpportunity['idMarketing'];
  responsaveis: TOpportunity['responsaveis'];
  ganho: TOpportunity['ganho'];
  perda: {
    data: TOpportunity['perda']['data'];
  };
  valorProposta: TProposal['valor'];
  potenciaPicoProposta: TProposal['potenciaPico'];
  canalAquisicao: TClient['canalAquisicao'];
  dataInsercao: string;
};
async function getOpportunities({
  opportunitiesCollection,
  responsiblesQuery,
  partnerQuery,
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
      $or: [
        { $and: [{ 'responsaveis.dataInsercao': { $gte: afterDateStr } }, { 'responsaveis.dataInsercao': { $lte: beforeDateStr } }] },
        { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
        { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
      ],
      dataExclusao: null,
    };
    console.log('[INFO] [GET_SALES_SDR_STATS] Query', JSON.stringify(match, null, 2));
    const addFields = {
      activeProposeObjectID: {
        $toObjectId: '$ganho.idProposta',
      },
      clientObjectId: { $toObjectId: '$idCliente' },
    };
    const proposeLookup = { from: 'proposals', localField: 'activeProposeObjectID', foreignField: '_id', as: 'proposta' };
    const clientLookup = { from: 'clients', localField: 'clientObjectId', foreignField: '_id', as: 'cliente' };
    const projection = {
      idMarketing: 1,
      responsaveis: 1,
      ganho: 1,
      'perda.data': 1,
      'proposta.valor': 1,
      'proposta.potenciaPico': 1,
      'cliente.canalAquisicao': 1,
      dataInsercao: 1,
    };
    const result = await opportunitiesCollection
      .aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
      .toArray();
    const projects = result.map((r) => ({
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      ganho: r.ganho,
      perda: r.perda,
      valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
      potenciaPicoProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
      canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : 'NÃO DEFINIDO',
      dataInsercao: r.dataInsercao,
    })) as TSDRResultsProject[];
    return projects;
  } catch (error) {
    console.log('[ERROR] Error getting opportunities', error);
    throw error;
  }
}
