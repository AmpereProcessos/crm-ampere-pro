import { uploadFileAsPDF } from '@/lib/methods/firebase';
import { getPDFByAnvil } from '@/repositories/integrations/anvil';
import { insertProposal, updateProposal } from '@/repositories/proposals/mutations';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { novu } from '@/services/novu';
import { NOVU_WORKFLOW_IDS } from '@/services/novu/workflows';
import { apiHandler, validateAuthorization } from '@/utils/api';
import { ProposalTemplates, type ProposeTemplateOptions, getTemplateData } from '@/utils/integrations/general';
import { GeneralClientSchema } from '@/utils/schemas/client.schema';
import type { TConectaIndication } from '@/utils/schemas/conecta-indication.schema';
import type { TOpportunityHistory } from '@/utils/schemas/opportunity-history.schema';
import { OpportunityWithClientSchema, type TOpportunity, UpdateOpportunitySchema } from '@/utils/schemas/opportunity.schema';
import { InsertProposalSchema, type TProposal } from '@/utils/schemas/proposal.schema';
import createHttpError from 'http-errors';
import { type Collection, type Filter, ObjectId } from 'mongodb';
import type { NextApiHandler } from 'next';
import { z } from 'zod';

export type TPersonalizedProposalCreationResponse = {
  data: { insertedId: string; fileUrl: string | null | undefined };
  message: string;
};

type PostResponse = TPersonalizedProposalCreationResponse;

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
});

const createProposalPersonalized: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'criar', true);
  const partnerId = session.user.idParceiro;
  const parterScope = session.user.permissoes.parceiros.escopo;
  const partnerQuery: Filter<TProposal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

  const { proposal, opportunityWithClient, saveAsActive, idAnvil } = PersonalizedProposalCreationSchema.parse(req.body);

  const db = await connectToDatabase();
  const proposalsCollection: Collection<TProposal> = db.collection('proposals');
  const opportunityCollection: Collection<TOpportunity> = db.collection('opportunities');
  const opportunityHistoryCollection: Collection<TOpportunityHistory> = db.collection('opportunities-history');
  const conectaIndicationsCollection: Collection<TConectaIndication> = db.collection('conecta-indications');

  const insertResponse = await insertProposal({
    collection: proposalsCollection,
    info: proposal,
    partnerId: opportunityWithClient.idParceiro || '',
  });
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido na criação da proposta.');
  const insertedId = insertResponse.insertedId.toString();
  // In case there is a specified anvil ID
  if (idAnvil) {
    const tag = opportunityWithClient?.nome.replaceAll('/', '').replaceAll('?', '').replaceAll('&', '');
    const template = ProposalTemplates.find((t) => t.idAnvil === idAnvil) || ProposalTemplates[0];
    const anvilTemplateData = getTemplateData({
      opportunity: opportunityWithClient,
      proposal: { _id: insertedId, ...proposal },
      template: template.value as (typeof ProposeTemplateOptions)[number],
    });
    console.log(anvilTemplateData, idAnvil);
    const anvilFileResponse = await getPDFByAnvil({
      info: anvilTemplateData,
      idAnvil: idAnvil,
    });
    console.log(anvilFileResponse);
    const { format, size, url } = await uploadFileAsPDF({
      file: anvilFileResponse,
      fileName: proposal.nome,
      vinculationId: opportunityWithClient._id,
    });

    await updateProposal({
      id: insertedId,
      collection: proposalsCollection,
      changes: { urlArquivo: url },
      query: partnerQuery,
    });

    if (saveAsActive) {
      await opportunityCollection.updateOne(
        { _id: new ObjectId(opportunityWithClient._id) },
        {
          $set: {
            'proposta.nome': proposal.nome,
            'proposta.valor': proposal.valor,
            'proposta.potenciaPico': proposal.potenciaPico,
            'proposta.urlArquivo': url,
          },
        }
      );
    }

    return res.status(201).json({
      data: { insertedId, fileUrl: url },
      message: 'Proposta criada com sucesso !',
    });
  }

  await opportunityHistoryCollection.insertOne({
    oportunidade: {
      id: opportunityWithClient._id,
      nome: opportunityWithClient.nome,
      identificador: opportunityWithClient.identificador,
    },
    idParceiro: opportunityWithClient.idParceiro,
    categoria: 'INTERAÇÃO',
    tipoInteracao: 'ORÇAMENTOS/PROPOSTAS',
    idProposta: insertResponse.insertedId.toString(),
    conteudo: `Criação de proposta (${proposal.nome}) para o cliente.`,
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });

  await opportunityCollection.updateOne(
    {
      _id: new ObjectId(opportunityWithClient._id),
    },
    {
      $set: saveAsActive
        ? {
            ultimaInteracao: {
              tipo: 'ORÇAMENTOS/PROPOSTAS',
              data: new Date().toISOString(),
            },
            idPropostaAtiva: insertedId,
            'proposta.nome': proposal.nome,
            'proposta.valor': proposal.valor,
            'proposta.potenciaPico': proposal.potenciaPico,
          }
        : {
            ultimaInteracao: {
              tipo: 'ORÇAMENTOS/PROPOSTAS',
              data: new Date().toISOString(),
            },
          },
    }
  );

  const novuTopicKey = `opportunity:${opportunityWithClient._id.toString()}`;
  // Notifying users of the new interaction
  const novuTriggerBulkResponse = await novu.trigger({
    to: {
      type: 'Topic',
      topicKey: novuTopicKey,
    },
    workflowId: NOVU_WORKFLOW_IDS.NOTIFY_NEW_INTERACTION_TO_RESPONSIBLES,
    payload: {
      autor: {
        nome: session.user.nome,
        avatar_url: session.user.avatar_url,
      },
      oportunidade: {
        id: opportunityWithClient._id.toString(),
        identificador: opportunityWithClient.identificador,
        nome: opportunityWithClient.nome,
      },
      interacao: {
        tipo: 'ORÇAMENTOS/PROPOSTAS',
      },
    },
    actor: {
      subscriberId: session.user.id,
      firstName: session.user.nome,
      avatar: session.user.avatar_url || undefined,
    },
  });
  console.log('[NOVU] - Notifications sent on new interaction', novuTriggerBulkResponse.result);
  // Updating indication (if applicable) in case of first interaction
  if (opportunityWithClient.idIndicacao)
    await conectaIndicationsCollection.updateOne(
      {
        _id: new ObjectId(opportunityWithClient.idIndicacao),
        'oportunidade.dataInteracao': null,
      },
      { $set: { 'oportunidade.dataInteracao': new Date().toISOString() } }
    );
  return res.status(201).json({
    data: { insertedId, fileUrl: undefined },
    message: 'Proposta criada com sucesso !',
  });
};

export type TPersonalizedProposalUpdateResponse = {
  data: { fileUrl: string | null | undefined };
  message: string;
};
type PutResponse = TPersonalizedProposalUpdateResponse;

const PersonalizedProposalUpdateSchema = z.object({
  proposal: InsertProposalSchema,
  client: GeneralClientSchema.extend({
    _id: z.string({
      required_error: 'ID do cliente não informado.',
      invalid_type_error: 'Tipo não válido para o ID do cliente.',
    }),
  }),
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
});

const updateProposalPersonalized: NextApiHandler<PutResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'propostas', 'editar', true);
  const partnerId = session.user.idParceiro;
  const parterScope = session.user.permissoes.parceiros.escopo;
  const partnerQuery: Filter<TProposal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

  const { id } = req.query;
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.');

  const { proposal, client, opportunity, regenerateFile, idAnvil } = PersonalizedProposalUpdateSchema.parse(req.body);

  const db = await connectToDatabase();
  const proposalsCollection: Collection<TProposal> = db.collection('proposals');
  const opportunityCollection: Collection<TOpportunity> = db.collection('opportunities');

  let proposalFileUrl: string | null | undefined = proposal.urlArquivo;
  if (regenerateFile) {
    if (idAnvil) {
      const template = ProposalTemplates.find((t) => t.idAnvil === idAnvil) || ProposalTemplates[0];
      const anvilTemplateData = getTemplateData({
        opportunity: { ...opportunity, cliente: client },
        proposal: { _id: id, ...proposal },
        template: template.value as (typeof ProposeTemplateOptions)[number],
      });
      const anvilFileResponse = await getPDFByAnvil({
        info: anvilTemplateData,
        idAnvil: idAnvil,
      });

      const { url } = await uploadFileAsPDF({
        file: anvilFileResponse,
        fileName: proposal.nome,
        vinculationId: opportunity._id,
      });

      proposalFileUrl = url;
    }
  }

  const updateResponse = await updateProposal({
    id: id,
    collection: proposalsCollection,
    changes: { ...proposal, urlArquivo: proposalFileUrl },
    query: partnerQuery,
  });
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar proposta.');
  if (updateResponse.matchedCount === 0) throw new createHttpError.NotFound('Nenhum proposta foi encontrada para atualização.');

  const updatedProposal = await proposalsCollection.findOne({ _id: new ObjectId(id) });
  if (!updatedProposal) throw new createHttpError.NotFound('Nenhum proposta foi encontrada para atualização.');

  // Updating opportunity that has proposal as active with new proposal data
  await opportunityCollection.updateMany(
    { idPropostaAtiva: id },
    {
      $set: {
        'proposta.nome': updatedProposal.nome,
        'proposta.valor': updatedProposal.valor,
        'proposta.potenciaPico': updatedProposal.potenciaPico,
        'proposta.urlArquivo': updatedProposal.urlArquivo,
      },
    }
  );

  return res.status(201).json({
    data: { fileUrl: updatedProposal.urlArquivo },
    message: 'Proposta atualizada com sucesso !',
  });
};

export default apiHandler({
  POST: createProposalPersonalized,
  PUT: updateProposalPersonalized,
});
