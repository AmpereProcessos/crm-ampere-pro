import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { novu } from '@/services/novu';
import { NOVU_WORKFLOW_IDS } from '@/services/novu/workflows';
import { apiHandler, validateAuthorization } from '@/utils/api';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TUser } from '@/utils/schemas/user.schema';
import createHttpError from 'http-errors';
import { ObjectId } from 'mongodb';
import type { NextApiHandler } from 'next';
import { z } from 'zod';

const AddResponsibleToOpportunitySchema = z.object({
  opportunityId: z.string({
    required_error: 'ID da oportunidade não fornecido.',
    invalid_type_error: 'Tipo não válido para ID da oportunidade.',
  }),
  responsibleId: z.string({
    required_error: 'ID do responsável não fornecido.',
  }),
  responsibleRole: z.enum(['VENDEDOR', 'SDR', 'ANALISTA TÉCNICO']),
});
export type TAddResponsibleToOpportunityInput = z.infer<typeof AddResponsibleToOpportunitySchema>;
export type TAddResponsibleToOpportunityOutput = {
  message: string;
};
const handleAddResponsibleToOpportunity: NextApiHandler<TAddResponsibleToOpportunityOutput> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'editar', true);

  const { opportunityId, responsibleId, responsibleRole } = AddResponsibleToOpportunitySchema.parse(req.body);

  const db = await connectToDatabase();
  const usersCollection = db.collection<TUser>('users');
  const opportunitiesCollection = db.collection<TOpportunity>('opportunities');

  const user = await usersCollection.findOne({ _id: new ObjectId(responsibleId) });

  if (!user) throw new createHttpError.NotFound('Usuário não encontrado.');

  const newResponsible: TOpportunity['responsaveis'][number] = {
    nome: user.nome,
    id: user._id.toString(),
    papel: responsibleRole,
    avatar_url: user.avatar_url,
    telefone: user.telefone,
    dataInsercao: new Date().toISOString(),
  };

  const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
  if (!opportunity) throw new createHttpError.NotFound('Oportunidade não encontrada.');

  const opportunityHasSDR = opportunity.responsaveis.some((responsible) => responsible.papel === 'SDR');
  const newResponsibleIsSeller = responsibleRole === 'VENDEDOR';

  const isLeadingSending = opportunityHasSDR && newResponsibleIsSeller;

  // Checking for duplicate responsible
  const isDuplicate = opportunity.responsaveis.some((responsible) => responsible.id === newResponsible.id);
  if (isDuplicate) throw new createHttpError.BadRequest('Responsável já adicionado à oportunidade.');

  const opportunityResponsibles = [...opportunity.responsaveis, newResponsible];

  const updatedOpportunity = await opportunitiesCollection.updateOne(
    { _id: new ObjectId(opportunityId) },
    { $set: { responsaveis: opportunityResponsibles, dataEnvioLead: isLeadingSending ? new Date().toISOString() : opportunity.dataEnvioLead } }
  );

  if (!updatedOpportunity.acknowledged) throw new createHttpError.InternalServerError('Erro ao adicionar responsável à oportunidade.');

  // Notifying the new opportunity responsible
  const novuTriggerResponse = await novu.trigger({
    to: responsibleId,
    workflowId: NOVU_WORKFLOW_IDS.NOTIFY_NEW_OPPORTUNITY_TO_RESPONSIBLES,
    payload: {
      oportunidade: {
        id: opportunity._id.toString(),
        nome: opportunity.nome,
        identificador: opportunity.identificador,
      },
      autor: {
        id: session.user.id,
        nome: session.user.nome,
        avatar_url: session.user.avatar_url,
      },
    },
    actor: {
      subscriberId: session.user.id,
      firstName: session.user.nome,
      avatar: session.user.avatar_url || undefined,
    },
  });

  // adding new user as subscripter to the opportunity topic
  const novuTopicKey = `opportunity:${opportunityId}`;
  await novu.topics.subscriptions.create(
    {
      subscriberIds: [responsibleId],
    },
    novuTopicKey
  );
  console.log('[NOVU] - new responsible notification response', novuTriggerResponse.result);
  res.status(200).json({ message: 'Responsável adicionado com sucesso.' });
};

const RemoveResponsibleFromOpportunitySchema = z.object({
  opportunityId: z.string({
    required_error: 'ID da oportunidade não fornecido.',
    invalid_type_error: 'Tipo não válido para ID da oportunidade.',
  }),
  responsibleId: z.string({
    required_error: 'ID do responsável não fornecido.',
  }),
});
export type TRemoveResponsibleFromOpportunityInput = z.infer<typeof RemoveResponsibleFromOpportunitySchema>;

export type TRemoveResponsibleFromOpportunityOutput = {
  message: string;
};

export const handleRemoveResponsibleFromOpportunity: NextApiHandler<TRemoveResponsibleFromOpportunityOutput> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'oportunidades', 'editar', true);

  const { opportunityId, responsibleId } = RemoveResponsibleFromOpportunitySchema.parse(req.query);

  const db = await connectToDatabase();
  const opportunitiesCollection = db.collection<TOpportunity>('opportunities');

  const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
  if (!opportunity) throw new createHttpError.NotFound('Oportunidade não encontrada.');

  const newResponsiblesArr = opportunity.responsaveis.filter((responsible) => responsible.id !== responsibleId);

  await opportunitiesCollection.updateOne({ _id: new ObjectId(opportunityId) }, { $set: { responsaveis: newResponsiblesArr } });

  const updatedOpportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) }, { projection: { responsaveis: 1 } });
  if (!updatedOpportunity) throw new createHttpError.InternalServerError('Erro ao remover responsável da oportunidade.');
  const updatedOpportunityHasSeller = updatedOpportunity.responsaveis.some((responsible) => responsible.papel === 'VENDEDOR');
  // If seller was removed, we need to "reset" the leading sending
  if (!updatedOpportunityHasSeller) await opportunitiesCollection.updateOne({ _id: new ObjectId(opportunityId) }, { $set: { dataEnvioLead: null } });

  // Removing responsible subscription from the opportunity topic
  const novuTopicKey = `opportunity:${opportunityId}`;
  await novu.topics.subscriptions.delete(
    {
      subscriberIds: [responsibleId],
    },
    novuTopicKey
  );

  res.status(200).json({ message: 'Responsável removido com sucesso.' });
};

export default apiHandler({ POST: handleAddResponsibleToOpportunity, DELETE: handleRemoveResponsibleFromOpportunity });
