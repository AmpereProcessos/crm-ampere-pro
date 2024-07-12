import { NextApiHandler } from 'next'
import { IRepresentative } from '../../../utils/models'
import { apiHandler, validateAuthentication } from '@/utils/api'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import createHttpError from 'http-errors'

type GetResponse = {
  data: IRepresentative[] | IRepresentative
}

const getRepresentatives: NextApiHandler<GetResponse> = async (req, res) => {
  await validateAuthentication(req, res)
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection = db.collection('users')
  const { id } = req.query
  if (id && typeof id === 'string') {
    const dbResponse = await collection
      .aggregate([
        {
          $match: {
            _id: new Object(id),
            'permissoes.clientes.serRepresentante': true,
          },
        },
        { $project: { _id: 1, nome: 1 } },
      ])
      .toArray()
    if (!dbResponse[0]) throw new createHttpError.NotFound('Nenhum representante encontrado com esse ID.')
    const representative = {
      id: dbResponse[0]._id,
      nome: dbResponse[0].nome,
    }
    res.status(200).json({ data: representative })
  } else {
    const dbResponse = await collection
      .aggregate([
        {
          $match: {
            'permissoes.clientes.serRepresentante': true,
          },
        },
        { $project: { _id: 1, nome: 1 } },
      ])
      .toArray()
    const representatives = dbResponse.map((rep: IRepresentative) => {
      return {
        id: rep._id,
        nome: rep.nome,
      }
    })
    res.status(200).json({ data: representatives })
  }
}

export default apiHandler({
  GET: getRepresentatives,
})
