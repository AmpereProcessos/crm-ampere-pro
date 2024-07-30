import { validateAuthenticationAppRouter, withErrorHandler } from '@/app/utils/api'
import { insertStockMaterial, updateStockMaterial } from '@/repositories/stock-materials/mutations'
import { getStockMaterialById, getStockMaterials } from '@/repositories/stock-materials/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { validateAuthentication, validateAuthenticationWithSession } from '@/utils/api'
import { InsertStockMaterialSchema, TStockMaterial } from '@/utils/schemas/stock-materials.schema'
import createHttpError from 'http-errors'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import { NextRequest, NextResponse } from 'next/server'

const createStockMaterialRoute = async (req: NextRequest) => {
  const session = await validateAuthenticationAppRouter()
  console.log('session', session)
  const body = await req.json()
  const material = InsertStockMaterialSchema.parse(body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TStockMaterial> = db.collection('stock-materials')

  const insertResponse = await insertStockMaterial({ collection, info: material })
  if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecio ao criar material.')
  const insertedId = insertResponse.insertedId.toString()

  return NextResponse.json({ data: { insertedId }, message: 'Material criado com sucesso !' }, { status: 201 })
}

const getStockMaterialsRoute = async (req: NextRequest) => {
  const session = await validateAuthenticationAppRouter()

  const id = req.nextUrl.searchParams.get('id')

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TStockMaterial> = db.collection('stock-materials')
  if (id) {
    if (typeof id !== 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('Id inválido')

    const stockMaterial = await getStockMaterialById({ collection, id, query: {} })
    if (!stockMaterial) throw new createHttpError.NotFound('Material não encontrado.')
    return NextResponse.json({ data: stockMaterial })
  }

  const stockMaterials = getStockMaterials({ collection, query: {} })
  return NextResponse.json({ data: stockMaterials })
}

const editStockMaterialRoute = async (req: NextRequest) => {
  const session = await validateAuthenticationAppRouter()

  const id = req.nextUrl.searchParams.get('id')
  if (!id || typeof id != 'string' || !ObjectId.isValid(id)) throw new createHttpError.BadRequest('Id inválido')

  const body = await req.json()
  const changes = InsertStockMaterialSchema.partial().parse(body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TStockMaterial> = db.collection('stock-materials')

  const updateResponse = await updateStockMaterial({ id, collection, changes, query: {} })
  if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao editar material.')
  if (updateResponse.matchedCount === 0) throw new createHttpError.NotFound('Material não encontrado.')

  return NextResponse.json({ data: 'Material atualizado com sucesso !', message: 'Material atualizado com sucesso !' })
}

export const GET = withErrorHandler(getStockMaterialsRoute)
export const POST = withErrorHandler(createStockMaterialRoute)
export const PUT = withErrorHandler(editStockMaterialRoute)
