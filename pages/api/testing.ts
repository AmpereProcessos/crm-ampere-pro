import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { apiHandler } from '@/utils/api';
import { TOpportunity } from '@/utils/schemas/opportunity.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';
import { AnyBulkWriteOperation, ObjectId } from 'mongodb';
import { NextApiHandler } from 'next';

const interval = {
  start: '2024-01-01T00:00:00.000Z',
  end: '2024-12-31T23:59:59.999Z',
};

type GetResponse = any;
const getManualTesting: NextApiHandler<GetResponse> = async (req, res) => {
  const db = await connectToDatabase();

  const opportunitiesCollection = db.collection<TOpportunity>('opportunities');
  const proposalsCollection = db.collection<TProposal>('proposals');

  const opportunities = await opportunitiesCollection
    .find(
      {
        idPropostaAtiva: { $ne: null },
      },
      {
        projection: {
          _id: 1,
          idPropostaAtiva: 1,
        },
      }
    )
    .toArray();

  const activeSalesProposalsObjectIds = opportunities.map((opportunity) => new ObjectId(opportunity.idPropostaAtiva as string));
  const proposals = await proposalsCollection.find({ _id: { $in: activeSalesProposalsObjectIds } }).toArray();

  const bulkwriteOpportunities: AnyBulkWriteOperation<TOpportunity>[] = opportunities
    .map((opportunity) => {
      const proposal = proposals.find((proposal) => proposal._id.toString() === opportunity.idPropostaAtiva);
      if (!proposal) return null;
      return {
        updateOne: {
          filter: { _id: new ObjectId(opportunity._id) },
          update: {
            $set: {
              proposta: {
                nome: proposal?.nome,
                valor: proposal?.valor,
                potenciaPico: proposal?.potenciaPico ?? 0,
                urlArquivo: proposal?.urlArquivo,
              },
            },
          },
        },
      };
    })
    .filter((opportunity) => opportunity !== null);

  const bulkwriteResponse = await opportunitiesCollection.bulkWrite(bulkwriteOpportunities);
  return res.status(200).json(bulkwriteResponse);
};

export default apiHandler({ GET: getManualTesting });
