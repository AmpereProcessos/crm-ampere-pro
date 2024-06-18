import { insertManyProcessFlowReferences } from '@/repositories/process-flows-references/mutations'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'
import { IndividualProcess } from '@/utils/schemas/process-flow.schema'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type PostResponse = {
  data: {
    insertedIds: string[]
  }
  message: string
}

const InsertManyProcessFlowReferencesSchema = z.object({
  individualProcess: z.array(IndividualProcess, {
    required_error: 'Lista de processos não informada.',
    invalid_type_error: 'Tipo não válido para lista de processos.',
  }),
  projectId: z.string({ required_error: 'ID de referência do projeto não informado.', invalid_type_error: 'Tipo não válido para o ID do projeto.' }),
})

const createManyProcessFlowReferencesRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TProcessFlowReference> = db.collection('process-flow-references')

  const { individualProcess, projectId } = InsertManyProcessFlowReferencesSchema.parse(req.body)

  // Defining the flow references to be create using the individual process and the projectId
  const flowReferences: TProcessFlowReference[] = individualProcess.map((p) => {
    return {
      idProjeto: projectId,
      idProcesso: p.id,
      idProcessoPai: p.idProcessoPai,
      idProcessoReferenciaPai: null,
      referencia: {
        entidade: p.referencia.entidade,
        id: p.referencia.entidade == 'Project' ? projectId : null,
      },
      customizacao: p.customizacao,
      gatilho: p.gatilho,
      retorno: p.retorno,
      canvas: p.canvas,
      dataInsercao: new Date().toISOString(),
    }
  })

  // Finding the all depending process flow childs by flowReferences index
  const dependecyRelations = flowReferences.reduce((acc: { [key: string]: number[] }, current, index) => {
    const dependingReferences = flowReferences.map((f, index) => (f.idProcessoPai == current.idProcesso ? index : null)).filter((f) => f != null)
    if (!acc[index]) acc[index] = dependingReferences
    return acc
  }, {})
  // Inserting the flow references and getting the list of inserted ids
  const insertResponse = await insertManyProcessFlowReferences({ collection, flowReferences })
  const insertedIds = Object.values(insertResponse.insertedIds).map((id) => id.toString())

  // Now, using the dependency relations found to update the dependening flow references with their respective idProcessoReferenciaPai based on
  // the insertedIds array
  const bulkwriteArr = Object.entries(dependecyRelations)
    .filter(([key, value]) => value.length > 0)
    .map(([key, value]) => {
      const fatherProcessFlowReferenceId = insertedIds[Number(key)]
      return value.map((childProcessFlowReferenceIndex) => {
        const childProcessFlowReferenceId = insertedIds[Number(childProcessFlowReferenceIndex)]
        return {
          updateOne: {
            filter: { _id: new ObjectId(childProcessFlowReferenceId) },
            update: {
              $set: {
                idProcessoReferenciaPai: fatherProcessFlowReferenceId,
              },
            },
          },
        }
      })
    })
    .flat(1)
  const bulkwriteResponse = await collection.bulkWrite(bulkwriteArr)
  return res.status(200).json({ data: { insertedIds }, message: 'Referências de fluxo de processo criadas com sucesso!' })
}

export default apiHandler({ POST: createManyProcessFlowReferencesRoute })
