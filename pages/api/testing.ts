import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { apiHandler } from '@/utils/api';
import { TFileReference } from '@/utils/schemas/file-reference.schema';
import { NextApiHandler } from 'next';

type GetResponse = any;
const getManualTesting: NextApiHandler<GetResponse> = async (req, res) => {
  const db = await connectToDatabase();
  const fileReferenceCollection = db.collection<TFileReference>('file-references');

  const fileReferencesGrouped = await fileReferenceCollection
    .aggregate([
      {
        $group: {
          _id: '$titulo',
          contagem: {
            $count: {},
          },
        },
      },
    ])
    .toArray();
  console.log(fileReferencesGrouped.length);
  return res.status(200).json(fileReferencesGrouped);
};

export default apiHandler({ GET: getManualTesting });
