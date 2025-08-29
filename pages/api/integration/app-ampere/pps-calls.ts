import insertPPSCall from '@/repositories/integrations/app-ampere/pps-calls/mutations';
import {
  getAllPPSCalls,
  getPPSCallsByApplicantId,
  getPPSCallsById,
  getPPSCallsByOpportunityId,
} from '@/repositories/integrations/app-ampere/pps-calls/queries';
import connectToCallsDatabase from '@/services/mongodb/ampere/calls-db-connection';
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api';
import { InsertPPSCallSchema, TPPSCall } from '@/utils/schemas/pps-calls.schema';
import createHttpError from 'http-errors';
import { Collection, Filter, ObjectId } from 'mongodb';
import { NextApiHandler } from 'next';

type GetResponse = {
  data: TPPSCall | TPPSCall[];
};

const getPPSCalls: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res);

  const { id, opportunityId, applicantId, openOnly } = req.query;

  const db = await connectToCallsDatabase(process.env.OPERATIONAL_MONGODB_URI);
  const collection: Collection<TPPSCall> = db.collection('pps');

  const queryOpenOnly: Filter<TPPSCall> = openOnly == 'true' ? { status: { $ne: 'REALIZADO' } } : {};

  const query: Filter<TPPSCall> = { ...queryOpenOnly };

  if (id) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('ID inválido.');
    const call = await getPPSCallsById({ collection: collection, id: id });
    if (!call) throw new createHttpError.NotFound('Chamado não encontrado.');
    return res.status(200).json({ data: call });
  }
  if (opportunityId) {
    if (typeof opportunityId != 'string' || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest('ID de oportunidade inválido.');
    const calls = await getPPSCallsByOpportunityId({ collection: collection, opportunityId: opportunityId, query: query });
    return res.status(200).json({ data: calls });
  }
  if (applicantId) {
    if (typeof applicantId != 'string' || !ObjectId.isValid(applicantId)) throw new createHttpError.BadRequest('ID de requerente inválido.');
    const calls = await getPPSCallsByApplicantId({ collection: collection, applicantId: applicantId, query: query });
    return res.status(200).json({ data: calls });
  }

  const allCalls = await getAllPPSCalls({ collection: collection, query: query });

  return res.status(200).json({ data: allCalls });
};

type PostResponse = {
  data: { insertedId: string };
  message: string;
};

const createPPSCall: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res);

  const call = InsertPPSCallSchema.parse(req.body);

  const db = await connectToCallsDatabase(process.env.OPERATIONAL_MONGODB_URI);
  const collection: Collection<TPPSCall> = db.collection('pps');

  const insertResponse = await insertPPSCall({ collection: collection, info: call });
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar chamado.');
  const insertedId = insertResponse.insertedId.toString();

  return res.status(200).json({ data: { insertedId }, message: 'Chamado criado com sucesso !' });
};

export default apiHandler({ GET: getPPSCalls, POST: createPPSCall });
