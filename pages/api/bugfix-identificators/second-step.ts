import connectToAppCallsDatabase from '@/services/mongodb/ampere/calls-db-connection';
import connectToAppProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection';
import connectToAppRequestsDatabase from '@/services/mongodb/ampere/resquests-db-connection';
import connectToCRMDatabase from '@/services/mongodb/crm-db-connection';
import { apiHandler } from '@/utils/api';
import { TContractRequest } from '@/utils/schemas//contract-request.schema';
import { TAppProject } from '@/utils/schemas//projects.schema';
import { TNotification } from '@/utils/schemas/notification.schema';
import { TOpportunityHistory } from '@/utils/schemas/opportunity-history.schema';
import { TOpportunity } from '@/utils/schemas/opportunity.schema';
import { TPPSCall } from '@/utils/schemas/pps-calls.schema';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import { Collection } from 'mongodb';
import { NextApiHandler } from 'next';
type PostResponse = any;
const fixOpportunityIdentificatorsSecondStep: NextApiHandler<PostResponse> = async (req, res) => {
  // SECOND STEP
  // Envolve atualizações de diversas entidades ao longo da aplicação que dependentes do identificador
  // das oportunidades do CRM

  const crmDb = await connectToCRMDatabase(process.env.MONGODB_URI, 'crm');
  const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities');
  const notificationsCollection: Collection<TNotification> = crmDb.collection('notifications');
  const opportunityHistoryCollection: Collection<TOpportunityHistory> = crmDb.collection('opportunities-history');
  const technicalAnalysisCollection: Collection<TTechnicalAnalysis> = crmDb.collection('technical-analysis');

  const appProjectsDb = await connectToAppProjectsDatabase(process.env.MONGODB_URI);
  const appProjectsCollection: Collection<TAppProject> = appProjectsDb.collection('dados');

  const appRequestsDb = await connectToAppRequestsDatabase(process.env.MONGODB_URI);
  const appContractRequestsCollection: Collection<TContractRequest> = appRequestsDb.collection('contrato');

  const appCallsDb = await connectToAppCallsDatabase(process.env.MONGODB_URI);
  const appPPSCallsCollection: Collection<TPPSCall> = appCallsDb.collection('pps');

  // Primeiro, buscamos os registros das oportunidades (agora atualizadas)
  const opportunities = await opportunitiesCollection.find({}, { projection: { identificador: 1 } }).toArray();

  // Agora, buscamos cada uma das entidades dependentes e definimos um bulkwrite para atualização dos identificadores

  // NOTIFICAÇÕES DO CRM -----------------CHECKED
  //   const notifications = await notificationsCollection.find({}, { projection: { oportunidade: 1 } }).toArray()
  //   const notificationsBulkwriteArr = notifications.map((notification) => {
  //     const equivalentOpportunity = opportunities.find((opp) => opp._id.toString() == notification.oportunidade?.id)
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(notification._id) },
  //         update: {
  //           $set: {
  //             'oportunidade.identificador': equivalentOpportunity?.identificador || notification.oportunidade.identificador,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const notificationsBulkwriteResponse = await notificationsCollection.bulkWrite(notificationsBulkwriteArr)

  // HISTÓRICO DAS OPORTUNIDADES DO CRM ---------------- CHECKED
  //   const opportunityHistory = await opportunityHistoryCollection.find({}, { projection: { oportunidade: 1 } }).toArray()
  //   const opportunityHistoryBulkwriteArr = opportunityHistory.map((history) => {
  //     const equivalentOpportunity = opportunities.find((opp) => opp._id.toString() == history.oportunidade?.id)
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(history._id) },
  //         update: {
  //           $set: {
  //             antigo: history.oportunidade.identificador,
  //             'oportunidade.identificador': equivalentOpportunity?.identificador || history.oportunidade.identificador,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const opportunityHistoryBulkwriteResponse = await opportunityHistoryCollection.bulkWrite(opportunityHistoryBulkwriteArr)

  // ANÁLISES TÉCNICAS DO CRM ---------------- CHECKED
  //   const technicalAnalysis = await technicalAnalysisCollection.find({}, { projection: { oportunidade: 1 } }).toArray()
  //   const technicalAnalysisBulkwriteArr = technicalAnalysis.map((analysis) => {
  //     const equivalentOpportunity = opportunities.find((opp) => opp._id.toString() == analysis.oportunidade?.id)
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(analysis._id) },
  //         update: {
  //           $set: {
  //             'oportunidade.identificador': equivalentOpportunity?.identificador || analysis.oportunidade.identificador,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const technicalAnalysisBulkwriteResponse = await technicalAnalysisCollection.bulkWrite(technicalAnalysisBulkwriteArr)

  //   // CHAMADOS DE PPS DO APP ---------------- CHECKED
  //   const ppsCalls = await appPPSCallsCollection.find({ 'projeto.id': { $ne: null } }, { projection: { projeto: 1 } }).toArray()
  //   const ppsCallsBulkwriteArr = ppsCalls.map((call) => {
  //     const equivalentOpportunity = opportunities.find((opp) => opp._id.toString() == call.projeto.id)
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(call._id) },
  //         update: {
  //           $set: {
  //             'projeto.codigo': equivalentOpportunity?.identificador || call.projeto.codigo,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const ppsCallsBulkwriteResponse = await appPPSCallsCollection.bulkWrite(ppsCallsBulkwriteArr)

  // SOLICITAÇÕES DE CONTRATO DO APP ---------------- CHECKED
  //   const appContractRequests = await appContractRequestsCollection
  //     .find({ idProjetoCRM: { $ne: null } }, { projection: { idProjetoCRM: 1, codigoSVB: 1 } })
  //     .toArray()

  //   const appContractRequestsBulkwriteArr = appContractRequests.map((request) => {
  //     const equivalentOpportunity = opportunities.find((opp) => opp._id.toString() == request.idProjetoCRM)
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(request._id) },
  //         update: {
  //           $set: {
  //             codigoSVB: equivalentOpportunity?.identificador || request.codigoSVB,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const appContractRequestsBulkwriteResponse = await appContractRequestsCollection.bulkWrite(appContractRequestsBulkwriteArr)

  // PROJETOS DO APP ---------------- CHECKED
  //   const appProjects = await appProjectsCollection.find({ idProjetoCRM: { $ne: null } }, { projection: { idProjetoCRM: 1, codigoSVB: 1 } }).toArray()
  //   const appProjectsBulkwriteArr = appProjects.map((project) => {
  //     const equivalentOpportunity = opportunities.find((opp) => opp._id.toString() == project.idProjetoCRM)
  //     return {
  //       updateOne: {
  //         filter: { _id: new ObjectId(project._id) },
  //         update: {
  //           $set: {
  //             codigoSVB: equivalentOpportunity?.identificador || project.codigoSVB,
  //           },
  //         },
  //       },
  //     }
  //   })
  //   const appProjectsBulkwriteResponse = await appProjectsCollection.bulkWrite(appProjectsBulkwriteArr)
  return res.json('DESATIVADA');
};

export default apiHandler({ GET: fixOpportunityIdentificatorsSecondStep });
