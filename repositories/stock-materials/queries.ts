import { TStockMaterial } from '@/utils/schemas/stock-materials.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetStockMaterialsParams = {
  collection: Collection<TStockMaterial>
  query: Filter<TStockMaterial>
}
export function getStockMaterials({ collection, query }: GetStockMaterialsParams) {
  try {
    const stockMaterials = collection.find({ ...query }).toArray()

    return stockMaterials
  } catch (error) {
    throw error
  }
}

type GetSotckMaterialByIdParams = {
  collection: Collection<TStockMaterial>
  query: Filter<TStockMaterial>
  id: string
}

export async function getStockMaterialById({ collection, query, id }: GetSotckMaterialByIdParams) {
  try {
    const stockMaterial = await collection.findOne({ _id: new ObjectId(id), ...query })
    return stockMaterial
  } catch (error) {
    throw error
  }
}
