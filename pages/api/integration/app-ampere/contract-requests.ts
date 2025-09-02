import connectToRequestsDatabase from '@/services/mongodb/ampere/resquests-db-connection';
import connectoToCRMDatabase from '@/services/mongodb/crm-db-connection';
import { apiHandler } from '@/utils/api';
import { type Collection, ObjectId } from 'mongodb';
import type { NextApiHandler } from 'next';

import type { TContractRequest } from '@/utils/schemas//contract-request.schema';
import type { TClient } from '@/utils/schemas/client.schema';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TPartner } from '@/utils/schemas/partner.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';
import createHttpError from 'http-errors';

type PostResponse = {
  data: { insertedId: string };
  message: string;
};

const createRequest: NextApiHandler<PostResponse> = async (req, res) => {
  const requestInfo = req.body as TContractRequest;
  if (!requestInfo) return 'Ooops, solicitação inválida.';

  const opportunityId = requestInfo.idProjetoCRM;
  const proposalId = requestInfo.idPropostaCRM;
  if (!opportunityId || typeof opportunityId !== 'string' || !ObjectId.isValid(opportunityId))
    throw new createHttpError.BadRequest('Referência da oportunidade não encontrada ou inválida, não é possível prosseguir com a solicitação.');
  if (!proposalId || typeof proposalId !== 'string' || !ObjectId.isValid(proposalId))
    throw new createHttpError.BadRequest('Referência da proposta não encontrada ou inválida, não é possível prosseguir com a solicitação.');

  const appAmpereDb = await connectToRequestsDatabase(process.env.OPERATIONAL_MONGODB_URI);
  const contractRequestsCollection: Collection<TContractRequest> = appAmpereDb.collection('contrato');

  const crmDb = await connectoToCRMDatabase();
  const crmOpportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities');
  const crmProposalsCollection: Collection<TProposal> = crmDb.collection('proposals');
  const partnersCollection: Collection<TPartner> = crmDb.collection('partners');
  const clientsCollection: Collection<TClient> = crmDb.collection('clients');

  // Getting CRM project informations
  const crmOpportunity = await crmOpportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
  if (!crmOpportunity) throw new createHttpError.BadRequest('Projeto não encontrado.');

  const crmProposal = await crmProposalsCollection.findOne({ _id: new ObjectId(proposalId) });
  if (!crmProposal) throw new createHttpError.BadRequest('Proposta não encontrada.');

  const partner = await partnersCollection.findOne({ _id: new ObjectId(crmOpportunity.idParceiro) });
  const { responsaveis, idMarketing } = crmOpportunity;

  let insiderName: string | undefined = undefined;

  const seller = responsaveis.find((r) => r.papel === 'VENDEDOR');
  const sdr = responsaveis.find((r) => r.papel === 'SDR' || r.papel === 'ANALISTA TÉCNICO');

  const insertContractRequestResponse = await contractRequestsCollection.insertOne({
    ...requestInfo,
    nomeParceiro: partner?.nome,
    idVendedor: seller?.id,
    nomeVendedor: seller?.nome,
    avatarVendedor: seller?.avatar_url,
    idOportunidade: idMarketing,
    insider: sdr?.nome,
    canalVenda: insiderName ? 'INSIDE SALES' : requestInfo.canalVenda,
    dataSolicitacao: new Date().toISOString(),
  });
  if (!insertContractRequestResponse.acknowledged) throw new createHttpError.BadRequest('Oops, houve um erro desconhecido ao solicitar o contrato');
  const insertedId = insertContractRequestResponse.insertedId.toString();

  // Updating the client registry
  const clientUpdates: Partial<TClient> = {
    email: requestInfo.email || undefined,
    cep: requestInfo.cepInstalacao || undefined,
    uf: requestInfo.uf || undefined,
    cidade: requestInfo.cidade || undefined,
    bairro: requestInfo.bairro || undefined,
    endereco: requestInfo.enderecoCobranca || undefined,
    numeroOuIdentificador: requestInfo.numeroResCobranca || undefined,
    complemento: requestInfo.pontoDeReferencia || undefined,
    dataNascimento: requestInfo.dataDeNascimento || undefined,
    profissao: requestInfo.profissao || undefined,
    ondeTrabalha: requestInfo.ondeTrabalha || undefined,
    canalAquisicao: requestInfo.canalVenda || undefined,
  };
  await clientsCollection.updateOne({ _id: new ObjectId(crmOpportunity.idCliente) }, { $set: clientUpdates });
  // Updating the opportunity with the inserted contract request id
  const updateOpportunityResponse = await crmOpportunitiesCollection.updateOne(
    { _id: new ObjectId(opportunityId) },
    {
      $set: {
        proposta: {
          nome: crmProposal.nome,
          valor: crmProposal.valor,
          potenciaPico: crmProposal.potenciaPico ?? 0,
          urlArquivo: crmProposal.urlArquivo,
        },
        'ganho.idProposta': proposalId,
        'ganho.idSolicitacao': insertedId,
        'ganho.dataSolicitacao': new Date().toISOString(),
      },
    }
  );

  return res.status(201).json({ data: { insertedId }, message: 'Solicitação de contrato criada com sucesso !' });
};

export default apiHandler({
  POST: createRequest,
});
