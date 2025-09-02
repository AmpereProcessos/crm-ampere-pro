import { getDateDifference } from '@/lib/methods/extracting';
import { getFunnelReferences } from '@/repositories/funnel-references/queries';
import { insertOpportunity, updateOpportunity } from '@/repositories/opportunities/mutations';
import { getOpportunitiesByQuery, getOpportunityById } from '@/repositories/opportunities/queries';
import { getOpenActivities } from '@/repositories/opportunity-history/queries';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { apiHandler, validateAuthorization } from '@/utils/api';
import { INDICATION_OPPORTUNITY_WIN_CREDITS_PERCENTAGE } from '@/utils/constants';
import type { TActivity } from '@/utils/schemas/activities.schema';
import type { TConectaIndication } from '@/utils/schemas/conecta-indication.schema';
import type { TFunnelReference } from '@/utils/schemas/funnel-reference.schema';
import {
  InsertOpportunitySchema,
  type TOpportunity,
  type TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
  type TOpportunitySimplifiedWithProposalAndActivitiesAndFunnels,
} from '@/utils/schemas/opportunity.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import createHttpError from 'http-errors';
import { type Collection, type Filter, ObjectId, type WithId } from 'mongodb';
import type { NextApiHandler } from 'next';
import { z } from 'zod';
import type { TClient } from '../../../utils/schemas/client.schema';

export const config = {
  maxDuration: 25,
};

export type ActivitiesByStatus = {
  [key: string]: number;
};
function getOpportunityActivityPendencyStatus(activities: WithId<TActivity>[]) {
  const currentDate = new Date().toISOString();
  const qty = activities.length;
  if (qty === 0) return undefined;

  const activitiesByStatus = activities.reduce((acc: ActivitiesByStatus, current) => {
    const dueDate = current.dataVencimento || new Date().toISOString();
    const dateDiffDays = getDateDifference({ dateOne: dueDate, dateTwo: currentDate, absolute: false }) || 0;
    let status = 'A VENCER';
    if (dateDiffDays < 0) status = 'EM ATRASO';
    if (dateDiffDays < 3) status = 'EM VENCIMENTO';
    if (dateDiffDays > 3) status = 'A VENCER';
    if (!acc[status]) acc[status] = 0;
    acc[status] += 1;
    return acc;
  }, {});
  return activitiesByStatus;
}

type PostResponse = {
  data: {
    insertedId: string;
  };
  message: string;
};

const createOpportunity: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'criar', true);
  const partnerId = session.user.idParceiro;

  const project = InsertOpportunitySchema.parse(req.body);

  const db = await connectToDatabase();
  const collection: Collection<TOpportunity> = db.collection('opportunities');

  const insertResponse = await insertOpportunity({ collection: collection, info: project, partnerId: partnerId || '' });
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na criação do projeto.');
  const insertedId = insertResponse.insertedId.toString();
  res.status(201).json({ data: { insertedId: insertedId }, message: 'Projeto criado com sucesso.' });
};

const statusOptionsQueries = {
  GANHOS: { 'ganho.data': { $ne: null } },
  PERDIDOS: { 'perda.data': { $ne: null } },
};

const PeriodQuerySchema = z.object({
  periodAfter: z
    .string({
      required_error: 'Data de início do período não informada.',
      invalid_type_error: 'Tipo inválido para data de início do período.',
    })
    .datetime(),
  periodBefore: z
    .string({
      required_error: 'Data de fim do período não informada.',
      invalid_type_error: 'Tipo inválido para data de fim do período.',
    })
    .datetime(),
  periodField: z.enum(['dataInsercao', 'dataGanho', 'dataPerda', 'ultimaInteracao.data'], {
    required_error: 'Campo de período não informado.',
    invalid_type_error: 'Tipo inválido para campo de período.',
  }),
});

type GetResponse = {
  data: TOpportunitySimplifiedWithProposalAndActivitiesAndFunnels[] | TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
};

const getOpportunities: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'visualizar', true);
  const partnerId = session.user.idParceiro;
  const parterScope = session.user.permissoes.parceiros.escopo;
  const partnerQuery: Filter<TOpportunity> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

  const userScope = session.user.permissoes.oportunidades.escopo;

  const db = await connectToDatabase();
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities');
  const funnelReferencesCollection: Collection<TFunnelReference> = db.collection('funnel-references');
  const opportunityActivitiesCollection: Collection<TActivity> = db.collection('activities');

  const { id, responsibles, funnel, periodAfter, periodBefore, periodField, status, isFromMarketing, isFromIndication } = req.query;
  // There are two possible query dynamics, query by ID or query by funnel-status

  // In case of query by ID, looking for the requested opportunity within the partners scope
  if (id) {
    if (typeof id !== 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.');

    const opportunity = await getOpportunityById({ collection: opportunitiesCollection, id: id, query: partnerQuery });
    if (!opportunity) throw new createHttpError.BadRequest('Nenhum projeto encontrado.');

    return res.status(200).json({ data: opportunity });
  }

  if (!funnel || typeof funnel !== 'string' || funnel === 'null') throw new createHttpError.BadRequest('Funil inválido');

  const isResponsibleDefined = responsibles && typeof responsibles === 'string';
  const isPeriodDefined = periodField && periodAfter && periodBefore;
  const periodParams = isPeriodDefined ? PeriodQuerySchema.parse({ periodAfter, periodBefore, periodField }) : null;

  const statusOption = statusOptionsQueries[status as keyof typeof statusOptionsQueries] || {};

  const responsibleArr = isResponsibleDefined ? responsibles.split(',') : null;
  // Validing user scope visibility
  if (!!userScope && responsibleArr?.some((r) => !userScope.includes(r)))
    throw new createHttpError.BadRequest('Seu escopo de visibilidade não contempla esse usuário.');

  // Defining the responsible query parameters. If specified, filtering opportunities in the provided responsible scope
  const queryResponsible: Filter<TOpportunity> = responsibleArr ? { 'responsaveis.id': { $in: responsibleArr } } : {};
  // Defining, if provided, period query parameters for date of insertion
  const queryInsertion: Filter<TOpportunity> = periodParams
    ? {
        $and: [
          { [periodParams.periodField]: { $gte: periodParams.periodAfter } },
          { [periodParams.periodField]: { $lte: periodParams.periodBefore } },
        ],
      }
    : {};
  // Defining, if provided, won/lost query parameters
  const queryStatus: Filter<TOpportunity> = status ? statusOption : { 'perda.data': null, 'ganho.data': null };
  const queryMarketing: Filter<TOpportunity> = isFromMarketing === 'true' ? { idMarketing: { $ne: null } } : {};
  const queryIndication: Filter<TOpportunity> = isFromIndication === 'true' ? { idIndicacao: { $ne: null } } : {};

  const query = { ...partnerQuery, ...queryResponsible, ...queryInsertion, ...queryStatus, ...queryMarketing, ...queryIndication };

  const opportunities = await getOpportunitiesByQuery({ collection: opportunitiesCollection, query: query });
  // Looking for the funnel references
  const funnelReferences = await getFunnelReferences({
    collection: funnelReferencesCollection,
    funnelId: funnel,
    query: {} as Filter<TFunnelReference>,
  });
  // Looking for open activities
  const activities = await getOpenActivities({ collection: opportunityActivitiesCollection, query: partnerQuery as Filter<TActivity> });

  // Formatting projects with the respective funnel reference
  const opportunitiesWithFunnelAndActivities: (WithId<TOpportunitySimplifiedWithProposalAndActivitiesAndFunnels> | null)[] = opportunities.map(
    (opportunity) => {
      // Getting the equivalent funnel reference for the current opportunity
      const opportunityFunnelReference = funnelReferences.find((reference) => reference.idOportunidade === opportunity._id.toString());
      if (!opportunityFunnelReference) return null;
      // Getting all pending activities for the current opportunity
      const opportunityActivities = activities.filter((activity) => activity.oportunidade.id === opportunity._id.toString());
      const activitiesStatus = getOpportunityActivityPendencyStatus(opportunityActivities);
      return {
        ...opportunity,
        proposta: {
          nome: opportunity.proposta?.nome,
          valor: opportunity.proposta?.valor,
          potenciaPico: opportunity.proposta?.potenciaPico,
        },
        funil: {
          id: opportunityFunnelReference._id.toString(),
          idFunil: opportunityFunnelReference.idFunil,
          idEstagio: opportunityFunnelReference.idEstagioFunil.toString(),
        },
        statusAtividades: activitiesStatus,
      };
    }
  );
  const filteredOpportunitiesWithFunnelReference = opportunitiesWithFunnelAndActivities.filter(
    (opportunity) => !!opportunity?._id
  ) as WithId<TOpportunitySimplifiedWithProposalAndActivitiesAndFunnels>[];

  return res.status(200).json({ data: filteredOpportunitiesWithFunnelReference });
};

type PutResponse = {
  data: string;
  message: string;
};
const editOpportunity: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'editar', true);
  const partnerId = session.user.idParceiro;
  const parterScope = session.user.permissoes.parceiros.escopo;
  const partnerQuery: Filter<TOpportunity> = { idParceiro: parterScope ? { $in: parterScope } : { $ne: undefined } };

  const userId = session.user.id;
  const userScope = session.user.permissoes.oportunidades.escopo;

  const { id } = req.query;
  const changes = req.body;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID de oportunidade inválido.');

  const db = await connectToDatabase();
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities');
  const proposalsCollection: Collection<TProposal> = db.collection('proposals');
  const clientsCollection: Collection<TClient> = db.collection('clients');
  const conectaIndicationsCollection: Collection<TConectaIndication> = db.collection('conecta-indications');

  const previousOpportunity = await getOpportunityById({ collection: opportunitiesCollection, id: id, query: partnerQuery });
  if (!previousOpportunity) throw new createHttpError.NotFound('Oportunidade não encontrada.');

  // Validating if user either: has global opportunity scope, its one of the opportunity responsibles or has one of the opportunity responsibles within his scope
  const hasEditAuthorizationForOpportunity =
    !userScope || previousOpportunity.responsaveis.some((opResp) => opResp.id === userId || userScope.includes(opResp.id));
  if (!hasEditAuthorizationForOpportunity)
    throw new createHttpError.Unauthorized('Você não possui permissão para alterar informações dessa oportunidade.');

  if (changes['tipo.id'] || changes?.tipo?.id) {
    console.log('Attemp to change opportunity type', changes['tipo.id'], changes.tipo?.id);
    console.log(`New: ${changes['tipo.id'] || changes?.tipo.id} - Previous: ${previousOpportunity.tipo.id}`);
    if (changes['tipo.id'] !== previousOpportunity.tipo.id || changes.tipo?.id !== previousOpportunity.tipo.id) {
      // In case update attemps to change the opportunity type, checking if type update is allowed
      const opportunityProposals = await proposalsCollection.find({ 'oportunidade.id': id }, { projection: { _id: 1 } }).toArray();
      // In case there are proposals linked to the opportunity, type update is not allowed
      if (opportunityProposals.length > 0)
        throw new createHttpError.BadRequest('Não é possível alterar o tipo de oportunidade, pois já existem propostas vinculadas a ela.');
    }
  }
  const updateResponse = await updateOpportunity({ id: id, collection: opportunitiesCollection, changes: changes, query: partnerQuery });

  const updatedOpportunity = await getOpportunityById({ collection: opportunitiesCollection, id: id, query: partnerQuery });

  // In case opportunity came from indication, checking for possible integration updates
  if (previousOpportunity.idIndicacao) {
    if (!updatedOpportunity) throw new createHttpError.NotFound('Oportunidade não encontrada.');
    // In case opportunity wasnt lost, but changes update this status, updating the indication
    if (!previousOpportunity.perda.data && !!updatedOpportunity.perda?.data) {
      console.log(`ADD LOSS - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

      await conectaIndicationsCollection.updateOne(
        { _id: new ObjectId(previousOpportunity.idIndicacao) },
        { $set: { 'oportunidade.dataPerda': updatedOpportunity.perda?.data } }
      );
    }
    // In case opportunity was lost, but changes update this status, updating the indication
    if (!!previousOpportunity.perda.data && !updatedOpportunity.perda?.data) {
      console.log(`REMOVE LOSS - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

      await conectaIndicationsCollection.updateOne(
        { _id: new ObjectId(previousOpportunity.idIndicacao) },
        { $set: { 'oportunidade.dataPerda': null } }
      );
    }

    // In case opportunity wasnt won, but changes update this status, updating the indication
    if (!previousOpportunity.ganho.data && !!updatedOpportunity.ganho?.data) {
      console.log(`ADD WIN - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

      const winningProposalId = updatedOpportunity.ganho?.idProposta;
      if (!winningProposalId) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na atualização da oportunidade.');
      const winningProposal = await proposalsCollection.findOne({ _id: new ObjectId(winningProposalId) });
      if (!winningProposal) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na atualização da oportunidade.');

      const addIndicationCredits = Math.ceil(winningProposal.valor * INDICATION_OPPORTUNITY_WIN_CREDITS_PERCENTAGE);

      await conectaIndicationsCollection.updateOne(
        { _id: new ObjectId(previousOpportunity.idIndicacao) },
        { $set: { 'oportunidade.dataGanho': updatedOpportunity.ganho?.data, creditosRecebidos: addIndicationCredits } }
      );
      await clientsCollection.updateOne({ _id: new ObjectId(updatedOpportunity.idCliente) }, { $inc: { 'conecta.creditos': addIndicationCredits } });
    }
    // In case opportunity was won, but changes update this status, updating the indication
    if (previousOpportunity.ganho.data && !updatedOpportunity.ganho?.data) {
      console.log(`REMOVE WIN - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

      await conectaIndicationsCollection.updateOne(
        { _id: new ObjectId(previousOpportunity.idIndicacao) },
        { $set: { 'oportunidade.dataGanho': null, creditosRecebidos: 0 } }
      );
    }
  }

  if (previousOpportunity.idPropostaAtiva !== updatedOpportunity.idPropostaAtiva) {
    const newActiveProposalId = updatedOpportunity.idPropostaAtiva;
    if (!newActiveProposalId) {
      // We gotta clean up the opportunity proposal fields
      await opportunitiesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { proposta: null } });
    } else {
      const newActiveProposal = await proposalsCollection.findOne({ _id: new ObjectId(newActiveProposalId) });
      if (!newActiveProposal) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na atualização da oportunidade.');
      await opportunitiesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'proposta.nome': newActiveProposal.nome,
            'proposta.valor': newActiveProposal.valor,
            'proposta.potenciaPico': newActiveProposal.potenciaPico,
            'proposta.urlArquivo': newActiveProposal.urlArquivo,
          },
        }
      );
    }
  }
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na atualização da oportunidade.');
  return res.status(201).json({ data: 'Oportunidade alterada com sucesso !', message: 'Oportunidade alterada com sucesso !' });
};

const deleteOpportunity: NextApiHandler = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'excluir', true);

  const { id } = req.query;

  if (typeof id !== 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID de oportunidade inválido.');

  const db = await connectToDatabase();
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities');

  const updateResponse = await opportunitiesCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        dataExclusao: new Date().toISOString(),
      },
    }
  );
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na exclusão da oportunidade.');
  if (updateResponse.modifiedCount === 0) throw new createHttpError.NotFound('Oportunidade não encontrada.');

  return res.status(201).json({
    data: 'Oportunidade excluída com sucesso !',
    message: 'Oportunidade excluída com sucesso !',
  });
};
export default apiHandler({
  POST: createOpportunity,
  GET: getOpportunities,
  PUT: editOpportunity,
  DELETE: deleteOpportunity,
});
