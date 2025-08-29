import { apiHandler, type UnwrapNextResponse } from '@/lib/api';
import { getValidCurrentSessionUncached } from '@/lib/auth/session';
import { getSalePromoters } from '@/repositories/users/queries';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import type { TClient } from '@/utils/schemas/client.schema';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import { QueryDatesSchema } from '@/utils/schemas/stats.schema';
import type { TUser, TUserDTO } from '@/utils/schemas/user.schema';
import dayjs from 'dayjs';
import createHttpError from 'http-errors';
import { ObjectId, type Collection, type Filter } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { QueryPeriodsComparisonSchema } from '../inputs';

type TGoals = {
  projetosCriados: number;
  projetosVendidos: number;
  potenciaVendida: number;
  valorVendido: number;
  projetosEnviados: number;
  conversao: number;
};

type TTwoPeriodGoals = {
  primeiro: {
    projetosCriados: number;
    projetosVendidos: number;
    potenciaVendida: number;
    valorVendido: number;
    projetosEnviados: number;
    conversao: number;
  };
  segundo: {
    projetosCriados: number;
    projetosVendidos: number;
    potenciaVendida: number;
    valorVendido: number;
    projetosEnviados: number;
    conversao: number;
  };
};
type TMonthResult = {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6': number;
  '7': number;
  '8': number;
  '9': number;
  '10': number;
  '11': number;
  '12': number;
};
type TSalePromoterResultsByIdReduced = {
  primeiro: {
    potenciaVendida: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    valorVendido: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    projetosVendidos: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    projetosCriados: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    projetosEnviados: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    conversao: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
  };
  segundo: {
    potenciaVendida: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    valorVendido: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    projetosVendidos: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    projetosCriados: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    projetosEnviados: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
    conversao: {
      objetivo: number;
      atingido: number;
      mensal: TMonthResult;
    };
  };
};
export type TSalePromoterResultsById = {
  id: string;
  nome: string;
  avatar_url: string | null | undefined;
  primeiro: {
    potenciaVendida: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    valorVendido: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    projetosVendidos: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    projetosCriados: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    projetosEnviados: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    conversao: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
  };
  segundo: {
    potenciaVendida: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    valorVendido: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    projetosVendidos: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    projetosCriados: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    projetosEnviados: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
    conversao: {
      objetivo: number;
      atingido: number;
      mensal: { mes: string; valor: number }[];
    };
  };
};

export type TSalePromotersResultsReduced = {
  [key: string]: {
    id: TUserDTO['_id'];
    nome: TUser['nome'];
    avatar_url: TUser['avatar_url'];
    potenciaVendida: {
      objetivo: number;
      atingido: number;
    };
    valorVendido: {
      objetivo: number;
      atingido: number;
    };
    projetosVendidos: {
      objetivo: number;
      atingido: number;
    };
    projetosCriados: {
      objetivo: number;
      atingido: number;
    };
    projetosEnviados: {
      objetivo: number;
      atingido: number;
    };
    conversao: {
      objetivo: number;
      atingido: number;
    };
  };
};
export type TSalePromotersResults = {
  id: TUserDTO['_id'];
  nome: TUser['nome'];
  avatar_url: TUser['avatar_url'];
  potenciaVendida: {
    objetivo: number;
    atingido: number;
  };
  valorVendido: {
    objetivo: number;
    atingido: number;
  };
  projetosVendidos: {
    objetivo: number;
    atingido: number;
  };
  projetosCriados: {
    objetivo: number;
    atingido: number;
  };
  projetosEnviados: {
    objetivo: number;
    atingido: number;
  };
  conversao: {
    objetivo: number;
    atingido: number;
  };
}[];

async function getSalePromotersResults(request: NextRequest) {
  const { user } = await getValidCurrentSessionUncached();
  if (!user) {
    throw new createHttpError.Unauthorized('Nível de autorização insuficiente.');
  }

  if (!user.permissoes?.resultados?.visualizarComercial) throw new createHttpError.Unauthorized('Nível de autorização insuficiente.');
  const searchParams = request.nextUrl.searchParams;

  const { after, before } = QueryDatesSchema.parse({
    after: searchParams.get('after'),
    before: searchParams.get('before'),
  });

  console.log('[INFO] [GET_SALES_SELLERS_STATS] Query Params', { after, before });

  const afterDate = dayjs(after).toDate();
  const beforeDate = dayjs(before).toDate();
  const afterDateStr = afterDate.toISOString();
  const beforeDateStr = beforeDate.toISOString();

  const db = await connectToDatabase();
  const usersCollection = db.collection<TUser>('users');
  const opportunitiesCollection = db.collection<TOpportunity>('opportunities');

  const queryOpportunities = {
    $or: [
      { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
      { $and: [{ 'ganho.data': { $gte: afterDateStr } }, { 'ganho.data': { $lte: beforeDateStr } }] },
    ],
    dataExclusao: null,
  };

  const salePromoters = await getSalePromoters({ collection: usersCollection, query: {} });
  const opportunities = await getOpportunities({ opportunitiesCollection, query: queryOpportunities });

  const initialResultsReduced = salePromoters.reduce((acc: TSalePromotersResultsReduced, current) => {
    const promoterSaleGoals = current.metas.reduce(
      (acc: TGoals, goalCurrent) => {
        const afterDatetime = new Date(afterDate).getTime();
        const beforeDatetime = new Date(beforeDate).getTime();

        const monthStartDatetime = new Date(goalCurrent.periodoInicio).getTime();
        const monthEndDatetime = new Date(goalCurrent.periodoFim).getTime();
        let multiplier = 0;
        if (
          (afterDatetime < monthStartDatetime && beforeDatetime < monthStartDatetime) ||
          (afterDatetime > monthEndDatetime && beforeDatetime > monthEndDatetime)
        )
          return acc;
        // Caso o período de filtro da query compreenda o mês inteiro
        if (afterDatetime <= monthStartDatetime && beforeDatetime >= monthEndDatetime) {
          multiplier = 1;
        } else {
          if (beforeDatetime > monthEndDatetime) {
            const applicableDays = dayjs(goalCurrent.periodoFim).diff(dayjs(afterDate), 'days');

            multiplier = applicableDays / goalCurrent.periodoDias;
          } else {
            const applicableDays = dayjs(beforeDate).diff(dayjs(goalCurrent.periodoInicio), 'days');

            multiplier = applicableDays / goalCurrent.periodoDias;
          }
        }
        acc.projetosCriados += (goalCurrent.metas?.projetosCriados || 0) * multiplier;
        acc.potenciaVendida += (goalCurrent.metas?.potenciaVendida || 0) * multiplier;
        acc.valorVendido += (goalCurrent.metas?.valorVendido || 0) * multiplier;
        acc.projetosVendidos += (goalCurrent.metas?.projetosVendidos || 0) * multiplier;
        acc.projetosEnviados += (goalCurrent.metas?.projetosEnviados || 0) * multiplier;
        acc.conversao += (goalCurrent.metas?.conversao || 0) * multiplier;

        return acc;
      },
      {
        projetosCriados: 0,
        potenciaVendida: 0,
        valorVendido: 0,
        projetosVendidos: 0,
        projetosEnviados: 0,
        conversao: 0,
      }
    );
    acc[current.nome] = {
      id: current._id.toString(),
      nome: current.nome,
      avatar_url: current.avatar_url,
      potenciaVendida: {
        atingido: 0,
        objetivo: promoterSaleGoals.potenciaVendida,
      },
      valorVendido: {
        atingido: 0,
        objetivo: promoterSaleGoals.valorVendido,
      },
      projetosVendidos: {
        atingido: 0,
        objetivo: promoterSaleGoals.projetosVendidos,
      },
      projetosCriados: {
        atingido: 0,
        objetivo: promoterSaleGoals.projetosCriados,
      },
      projetosEnviados: {
        atingido: 0,
        objetivo: promoterSaleGoals.projetosEnviados,
      },
      conversao: {
        atingido: 0,
        objetivo: promoterSaleGoals.conversao,
      },
    };
    return acc;
  }, {});

  const results = opportunities.reduce((acc: TSalePromotersResultsReduced, current) => {
    const seller = current.responsaveis.find((r) => r.papel === 'VENDEDOR');
    const sdr = current.responsaveis.find((r) => r.papel === 'SDR');

    // If there is a sdr and seller, than is a trasfered project
    const isTransfer = !!sdr && !!seller;
    const insider = !!sdr;

    const transferDate = seller?.dataInsercao ? new Date(seller.dataInsercao) : null;
    const wasTransferedWithinCurrentPeriod = transferDate && transferDate >= afterDate && transferDate < beforeDate;

    // Insertion related checkings
    const insertDate = new Date(current.dataInsercao);
    const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;

    // Signing related checkings
    const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null;
    const hasContractSigned = !!signatureDate;
    const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate;
    const proposeValue = current.valorProposta;
    const proposePeakPower = current.potenciaPicoProposta || 0;

    // Increasing based on checkings
    if (seller) {
      if (!acc[seller.nome]) return acc;
      if (wasInsertedWithinCurrentPeriod) acc[seller.nome].projetosCriados.atingido += 1;
      if (wasSignedWithinCurrentPeriod) acc[seller.nome].projetosVendidos.atingido += 1;
      if (wasSignedWithinCurrentPeriod) acc[seller.nome].valorVendido.atingido += proposeValue;
      if (wasSignedWithinCurrentPeriod) acc[seller.nome].potenciaVendida.atingido += proposePeakPower;
    }
    if (sdr) {
      if (!acc[sdr.nome]) return acc;
      if (wasInsertedWithinCurrentPeriod) acc[sdr.nome].projetosCriados.atingido += 1;
      if (wasSignedWithinCurrentPeriod) acc[sdr.nome].projetosVendidos.atingido += 1;
      if (wasSignedWithinCurrentPeriod) acc[sdr.nome].valorVendido.atingido += proposeValue;
      if (wasSignedWithinCurrentPeriod) acc[sdr.nome].potenciaVendida.atingido += proposePeakPower;
      if (!!isTransfer && wasTransferedWithinCurrentPeriod) acc[sdr.nome].projetosEnviados.atingido += 1;
    }

    return acc;
  }, initialResultsReduced);

  const response: TSalePromotersResults = Object.values(results)
    .map((value) => ({
      id: value.id,
      nome: value.nome,
      avatar_url: value.avatar_url,
      potenciaVendida: value?.potenciaVendida,
      valorVendido: value?.valorVendido,
      projetosVendidos: value?.projetosVendidos,
      projetosCriados: value?.projetosCriados,
      projetosEnviados: value?.projetosEnviados,
      conversao: {
        objetivo: value?.conversao.objetivo,
        atingido: value?.projetosVendidos.atingido / value?.projetosCriados.atingido,
      },
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return NextResponse.json({ data: response }, { status: 200 });
}

export type TSalePromotersResultsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getSalePromotersResults>>>;

async function getSalePromoterResultByIdRoute(request: NextRequest) {
  // const session = await validateAuthorization(req, res, 'resultados', 'visualizarComercial', true)
  const searchParams = request.nextUrl.searchParams;

  const { id, firstPeriodAfter, firstPeriodBefore, secondPeriodAfter, secondPeriodBefore } = QueryPeriodsComparisonSchema.extend({
    id: z.string({ required_error: 'ID inválido ou não informado.', invalid_type_error: 'Tipo não válido para ID.' }),
  }).parse({
    id: searchParams.get('id'),
    firstPeriodAfter: searchParams.get('firstPeriodAfter'),
    firstPeriodBefore: searchParams.get('firstPeriodBefore'),
    secondPeriodAfter: searchParams.get('secondPeriodAfter'),
    secondPeriodBefore: searchParams.get('secondPeriodBefore'),
  });

  const firstPeriodAfterDate = dayjs(firstPeriodAfter).toDate();
  const firstPeriodAfterDateString = firstPeriodAfterDate.toISOString();
  const firstPeriodBeforeDate = dayjs(firstPeriodBefore).endOf('day').subtract(3, 'hour').toDate();
  const firstPeriodBeforeDateString = firstPeriodBeforeDate.toISOString();

  const secondPeriodAfterDate = dayjs(secondPeriodAfter).toDate();
  const secondPeriodAfterDateString = secondPeriodAfterDate.toISOString();
  const secondPeriodBeforeDate = dayjs(secondPeriodBefore).endOf('day').subtract(3, 'hour').toDate();
  const secondPeriodBeforeDateString = secondPeriodBeforeDate.toISOString();

  const db = await connectToDatabase();
  const usersCollection = db.collection<TUser>('users');
  const opportunitiesCollection = db.collection<TOpportunity>('opportunities');

  // Validating existence of the requested sale promoter
  const querySalePromoter = { _id: new ObjectId(id) };
  const salePromoters = await getSalePromoters({ collection: usersCollection, query: querySalePromoter });
  const salePromoter = salePromoters[0];
  if (!salePromoter) throw new createHttpError.NotFound('Usuário não encontrado.');

  // Getting the opportunities created or won within any of the two periods
  const queryOpportunities = {
    'responsaveis.id': id,
    $or: [
      { $and: [{ dataInsercao: { $gte: firstPeriodAfterDateString } }, { dataInsercao: { $lte: firstPeriodBeforeDateString } }] },
      { $and: [{ 'ganho.data': { $gte: firstPeriodAfterDateString } }, { 'ganho.data': { $lte: firstPeriodBeforeDateString } }] },
      { $and: [{ dataInsercao: { $gte: secondPeriodAfterDateString } }, { dataInsercao: { $lte: secondPeriodBeforeDateString } }] },
      { $and: [{ 'ganho.data': { $gte: secondPeriodAfterDateString } }, { 'ganho.data': { $lte: secondPeriodBeforeDateString } }] },
    ],
    dataExclusao: null,
  };
  const opportunities = await getOpportunities({ opportunitiesCollection, query: queryOpportunities });

  const salePromoterGoals = salePromoter.metas.reduce(
    (acc: TTwoPeriodGoals, goalCurrent) => {
      const firstPeriodAfterDatetime = new Date(firstPeriodAfterDate).getTime();
      const firstPeriodBeforeDatetime = new Date(firstPeriodBeforeDate).getTime();
      const secondPeriodAfterDatetime = new Date(secondPeriodAfterDate).getTime();
      const secondPeriodBeforeDatetime = new Date(secondPeriodBeforeDate).getTime();

      const monthStartDatetime = new Date(goalCurrent.periodoInicio).getTime();
      const monthEndDatetime = new Date(goalCurrent.periodoFim).getTime();

      // Validating if the month`s defined period does not match any of the provided periods
      if (
        // Validating if the goal defined period is out of scope for the first requested period
        ((firstPeriodAfterDatetime < monthStartDatetime && firstPeriodBeforeDatetime < monthStartDatetime) ||
          (firstPeriodAfterDatetime > monthEndDatetime && firstPeriodBeforeDatetime > monthEndDatetime)) &&
        // Validating if the goal defined period is out of scope for the second requested period
        ((secondPeriodAfterDatetime < monthStartDatetime && secondPeriodBeforeDatetime < monthStartDatetime) ||
          (secondPeriodAfterDatetime > monthEndDatetime && secondPeriodBeforeDatetime > monthEndDatetime))
      )
        return acc;

      // In case it got to this point, the goal period is within either first period or the second one

      if (firstPeriodAfterDatetime <= monthStartDatetime && firstPeriodBeforeDatetime >= monthEndDatetime) {
        acc.primeiro.projetosCriados += goalCurrent.metas?.projetosCriados || 0;
        acc.primeiro.potenciaVendida += goalCurrent.metas?.potenciaVendida || 0;
        acc.primeiro.valorVendido += goalCurrent.metas?.valorVendido || 0;
        acc.primeiro.projetosVendidos += goalCurrent.metas?.projetosVendidos || 0;
        acc.primeiro.projetosEnviados += goalCurrent.metas?.projetosEnviados || 0;
        acc.primeiro.conversao += goalCurrent.metas?.conversao || 0;
      } else {
        let firstPeriodMultiplier = 0;

        if (firstPeriodAfterDatetime > monthStartDatetime && firstPeriodBeforeDatetime > monthEndDatetime) {
          const applicableDays = dayjs(goalCurrent.periodoFim).diff(dayjs(firstPeriodAfterDatetime), 'days');

          firstPeriodMultiplier = applicableDays / goalCurrent.periodoDias;
        }
        if (firstPeriodAfterDatetime < monthStartDatetime && firstPeriodBeforeDatetime < monthEndDatetime) {
          const applicableDays = dayjs(firstPeriodBeforeDatetime).diff(dayjs(goalCurrent.periodoInicio), 'days');

          firstPeriodMultiplier = applicableDays / goalCurrent.periodoDias;
        }
        acc.primeiro.projetosCriados += goalCurrent.metas?.projetosCriados || 0 * firstPeriodMultiplier;
        acc.primeiro.potenciaVendida += goalCurrent.metas?.potenciaVendida || 0 * firstPeriodMultiplier;
        acc.primeiro.valorVendido += goalCurrent.metas?.valorVendido || 0 * firstPeriodMultiplier;
        acc.primeiro.projetosVendidos += goalCurrent.metas?.projetosVendidos || 0 * firstPeriodMultiplier;
        acc.primeiro.projetosEnviados += goalCurrent.metas?.projetosEnviados || 0 * firstPeriodMultiplier;
        acc.primeiro.conversao += goalCurrent.metas?.conversao || 0 * firstPeriodMultiplier;
      }
      if (secondPeriodAfterDatetime <= monthStartDatetime && secondPeriodBeforeDatetime >= monthEndDatetime) {
        acc.primeiro.projetosCriados += goalCurrent.metas?.projetosCriados || 0;
        acc.primeiro.potenciaVendida += goalCurrent.metas?.potenciaVendida || 0;
        acc.primeiro.valorVendido += goalCurrent.metas?.valorVendido || 0;
        acc.primeiro.projetosVendidos += goalCurrent.metas?.projetosVendidos || 0;
        acc.primeiro.projetosEnviados += goalCurrent.metas?.projetosEnviados || 0;
        acc.primeiro.conversao += goalCurrent.metas?.conversao || 0;
      } else {
        let secondPeriodMultiplier = 0;

        if (secondPeriodAfterDatetime > monthStartDatetime && secondPeriodBeforeDatetime > monthEndDatetime) {
          const applicableDays = dayjs(goalCurrent.periodoFim).diff(dayjs(secondPeriodAfterDatetime), 'days');

          secondPeriodMultiplier = applicableDays / goalCurrent.periodoDias;
        }
        if (secondPeriodAfterDatetime < monthStartDatetime && secondPeriodBeforeDatetime < monthEndDatetime) {
          const applicableDays = dayjs(secondPeriodBeforeDatetime).diff(dayjs(goalCurrent.periodoInicio), 'days');

          secondPeriodMultiplier = applicableDays / goalCurrent.periodoDias;
        }
        acc.segundo.projetosCriados += goalCurrent.metas?.projetosCriados || 0 * secondPeriodMultiplier;
        acc.segundo.potenciaVendida += goalCurrent.metas?.potenciaVendida || 0 * secondPeriodMultiplier;
        acc.segundo.valorVendido += goalCurrent.metas?.valorVendido || 0 * secondPeriodMultiplier;
        acc.segundo.projetosVendidos += goalCurrent.metas?.projetosVendidos || 0 * secondPeriodMultiplier;
        acc.segundo.projetosEnviados += goalCurrent.metas?.projetosEnviados || 0 * secondPeriodMultiplier;
        acc.segundo.conversao += goalCurrent.metas?.conversao || 0 * secondPeriodMultiplier;
      }

      return acc;
    },
    {
      primeiro: { projetosCriados: 0, potenciaVendida: 0, valorVendido: 0, projetosVendidos: 0, projetosEnviados: 0, conversao: 0 },
      segundo: { projetosCriados: 0, potenciaVendida: 0, valorVendido: 0, projetosVendidos: 0, projetosEnviados: 0, conversao: 0 },
    }
  );
  const initialResultsReduced: TSalePromoterResultsByIdReduced = {
    primeiro: {
      potenciaVendida: {
        atingido: 0,
        objetivo: salePromoterGoals.primeiro.potenciaVendida,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      valorVendido: {
        atingido: 0,
        objetivo: salePromoterGoals.primeiro.valorVendido,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      projetosVendidos: {
        atingido: 0,
        objetivo: salePromoterGoals.primeiro.projetosVendidos,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      projetosCriados: {
        atingido: 0,
        objetivo: salePromoterGoals.primeiro.projetosCriados,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      projetosEnviados: {
        atingido: 0,
        objetivo: salePromoterGoals.primeiro.projetosEnviados,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      conversao: {
        atingido: 0,
        objetivo: salePromoterGoals.primeiro.conversao,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
    },
    segundo: {
      potenciaVendida: {
        atingido: 0,
        objetivo: salePromoterGoals.segundo.potenciaVendida,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      valorVendido: {
        atingido: 0,
        objetivo: salePromoterGoals.segundo.valorVendido,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      projetosVendidos: {
        atingido: 0,
        objetivo: salePromoterGoals.segundo.projetosVendidos,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      projetosCriados: {
        atingido: 0,
        objetivo: salePromoterGoals.segundo.projetosCriados,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      projetosEnviados: {
        atingido: 0,
        objetivo: salePromoterGoals.segundo.projetosEnviados,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
      conversao: {
        atingido: 0,
        objetivo: salePromoterGoals.segundo.conversao,
        mensal: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 },
      },
    },
  };
  const results = opportunities.reduce((acc: TSalePromoterResultsByIdReduced, current) => {
    const seller = current.responsaveis.find((r) => r.papel === 'VENDEDOR');
    const sdr = current.responsaveis.find((r) => r.papel === 'SDR');
    const userIsSDR = sdr?.id === salePromoter._id.toString();
    // If there is a sdr and seller, than is a trasfered project
    const isTransfer = !!userIsSDR && !!sdr && !!seller;

    // Transfer related information
    const transferDate = seller?.dataInsercao ? new Date(seller.dataInsercao) : null;
    const transferDateMonth = transferDate ? (transferDate.getMonth() + 1).toString() : '0';

    const wasTransferedWithinFirstPeriod = transferDate && transferDate >= firstPeriodAfterDate && transferDate < firstPeriodBeforeDate;
    const wasTransferedWithinSecondPeriod = transferDate && transferDate >= secondPeriodAfterDate && transferDate < secondPeriodBeforeDate;

    // Insertion related information
    const insertDate = new Date(current.dataInsercao);
    const insertDateMonth = insertDate ? (insertDate.getMonth() + 1).toString() : '0';

    const wasInsertedWithinFirstPeriod = insertDate >= firstPeriodAfterDate && insertDate <= firstPeriodBeforeDate;
    const wasInsertedWithinSecondPeriod = insertDate >= secondPeriodAfterDate && insertDate <= secondPeriodBeforeDate;

    // Signing related checkings
    const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null;
    const signatureDateMonth = signatureDate ? (signatureDate.getMonth() + 1).toString() : '0';
    const hasContractSigned = signatureDate;
    const proposeValue = current.valorProposta;
    const proposePeakPower = current.potenciaPicoProposta || 0;

    const wasSignedWithinFirstPeriod = hasContractSigned && signatureDate >= firstPeriodAfterDate && signatureDate <= firstPeriodBeforeDate;
    const wasSignedWithinSecondPeriod = hasContractSigned && signatureDate >= secondPeriodAfterDate && signatureDate <= secondPeriodBeforeDate;

    // increasing first period related information
    if (wasInsertedWithinFirstPeriod) {
      acc.primeiro.projetosCriados.atingido += 1;
      acc.primeiro.projetosCriados.mensal[insertDateMonth as keyof TMonthResult] += 1;
    }
    if (wasSignedWithinFirstPeriod) {
      acc.primeiro.projetosVendidos.atingido += 1;
      acc.primeiro.projetosVendidos.mensal[signatureDateMonth as keyof TMonthResult] += 1;

      acc.primeiro.potenciaVendida.atingido += proposePeakPower;
      acc.primeiro.potenciaVendida.mensal[signatureDateMonth as keyof TMonthResult] += proposePeakPower;
      acc.primeiro.valorVendido.atingido += proposeValue;
      acc.primeiro.valorVendido.mensal[signatureDateMonth as keyof TMonthResult] += proposeValue;
    }
    if (wasTransferedWithinFirstPeriod) {
      acc.primeiro.projetosEnviados.atingido += 1;
      acc.primeiro.projetosEnviados.mensal[transferDateMonth as keyof TMonthResult] += 1;
    }
    // increasing second period related information
    if (wasInsertedWithinSecondPeriod) {
      acc.segundo.projetosCriados.atingido += 1;
      acc.segundo.projetosCriados.mensal[insertDateMonth as keyof TMonthResult] += 1;
    }
    if (wasSignedWithinSecondPeriod) {
      acc.segundo.projetosVendidos.atingido += 1;
      acc.segundo.projetosVendidos.mensal[signatureDateMonth as keyof TMonthResult] += 1;

      acc.segundo.potenciaVendida.atingido += proposePeakPower;
      acc.segundo.potenciaVendida.mensal[signatureDateMonth as keyof TMonthResult] += proposePeakPower;

      acc.segundo.valorVendido.atingido += proposeValue;
      acc.segundo.valorVendido.mensal[signatureDateMonth as keyof TMonthResult] += proposeValue;
    }
    if (isTransfer && wasTransferedWithinSecondPeriod) {
      acc.segundo.projetosEnviados.atingido += 1;
      acc.segundo.projetosEnviados.mensal[transferDateMonth as keyof TMonthResult] += 1;
    }

    return acc;
  }, initialResultsReduced);

  const response: TSalePromoterResultsById = {
    id: salePromoter._id.toString(),
    nome: salePromoter.nome,
    avatar_url: salePromoter.avatar_url,
    primeiro: {
      potenciaVendida: {
        atingido: results.primeiro.potenciaVendida.atingido,
        objetivo: results.primeiro.potenciaVendida.objetivo,
        mensal: Object.entries(results.primeiro.potenciaVendida.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      valorVendido: {
        atingido: results.primeiro.valorVendido.atingido,
        objetivo: results.primeiro.valorVendido.objetivo,
        mensal: Object.entries(results.primeiro.valorVendido.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      projetosVendidos: {
        atingido: results.primeiro.projetosVendidos.atingido,
        objetivo: results.primeiro.projetosVendidos.objetivo,
        mensal: Object.entries(results.primeiro.projetosVendidos.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      projetosCriados: {
        atingido: results.primeiro.projetosCriados.atingido,
        objetivo: results.primeiro.projetosCriados.objetivo,
        mensal: Object.entries(results.primeiro.projetosCriados.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      projetosEnviados: {
        atingido: results.primeiro.projetosEnviados.atingido,
        objetivo: results.primeiro.projetosEnviados.objetivo,
        mensal: Object.entries(results.primeiro.projetosEnviados.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      conversao: {
        atingido: results.primeiro.projetosVendidos.atingido / results.primeiro.projetosCriados.atingido,
        objetivo: results.primeiro.conversao.objetivo,
        mensal: Object.entries(results.primeiro.conversao.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
    },
    segundo: {
      potenciaVendida: {
        atingido: results.segundo.potenciaVendida.atingido,
        objetivo: results.segundo.potenciaVendida.objetivo,
        mensal: Object.entries(results.segundo.potenciaVendida.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      valorVendido: {
        atingido: results.segundo.valorVendido.atingido,
        objetivo: results.segundo.valorVendido.objetivo,
        mensal: Object.entries(results.segundo.valorVendido.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      projetosVendidos: {
        atingido: results.segundo.projetosVendidos.atingido,
        objetivo: results.segundo.projetosVendidos.objetivo,
        mensal: Object.entries(results.segundo.projetosVendidos.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      projetosCriados: {
        atingido: results.segundo.projetosCriados.atingido,
        objetivo: results.segundo.projetosCriados.objetivo,
        mensal: Object.entries(results.segundo.projetosCriados.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      projetosEnviados: {
        atingido: results.segundo.projetosEnviados.atingido,
        objetivo: results.segundo.projetosEnviados.objetivo,
        mensal: Object.entries(results.segundo.projetosEnviados.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
      conversao: {
        atingido: results.segundo.projetosVendidos.atingido / results.segundo.projetosCriados.atingido,
        objetivo: results.segundo.conversao.objetivo,
        mensal: Object.entries(results.segundo.conversao.mensal).map(([key, value]) => ({ mes: key, valor: value })),
      },
    },
  };

  return NextResponse.json({ data: response });
}

export type TGetSalePromoterResultByIdRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getSalePromoterResultByIdRoute>>>;
export type TGetSalePromoterResultByIdRouteOutputData = TGetSalePromoterResultByIdRouteOutput['data'];

export const POST = apiHandler({ POST: getSalePromotersResults });
export const GET = apiHandler({ GET: getSalePromoterResultByIdRoute });

type TPromotersResultsProject = {
  idMarketing: TOpportunity['idMarketing'];
  responsaveis: TOpportunity['responsaveis'];
  ganho: TOpportunity['ganho'];
  valorProposta: TProposal['valor'];
  potenciaPicoProposta: TProposal['potenciaPico'];
  canalAquisicao: TClient['canalAquisicao'];
  dataInsercao: string;
};
type GetOpportunitiesParams = {
  opportunitiesCollection: Collection<TOpportunity>;
  query: Filter<TOpportunity>;
};
async function getOpportunities({ opportunitiesCollection, query }: GetOpportunitiesParams) {
  try {
    const match = query;

    const projection = {
      idMarketing: 1,
      responsaveis: 1,
      ganho: 1,
      'proposta.valor': 1,
      'proposta.potenciaPico': 1,
      'cliente.canalAquisicao': 1,
      dataInsercao: 1,
    };
    const result = await opportunitiesCollection.aggregate([{ $match: match }, { $project: projection }]).toArray();
    const projects = result.map((r) => ({
      idMarketing: r.idMarketing,
      responsaveis: r.responsaveis,
      ganho: r.ganho,
      valorProposta: r.proposta ? r.proposta.valor : 0,
      potenciaPicoProposta: r.proposta ? r.proposta.potenciaPico : 0,
      canalAquisicao: r.cliente ? r.cliente.canalAquisicao : 'NÃO DEFINIDO',
      dataInsercao: r.dataInsercao,
    })) as TPromotersResultsProject[];
    return projects;
  } catch (error) {
    console.log('[ERROR] - getOpportunities', error);
    throw error;
  }
}
