import { ExpenseSimplifiedProjection, TExpense, TExpenseDTOSimplified, TExpenseWithProject, TPayment } from '@/utils/schemas/expenses.schema'
import { Collection, Filter, ObjectId } from 'mongodb'

type GetExpenseByIdParams = {
  id: string
  collection: Collection<TExpense>
  query: Filter<TExpense>
}
export async function getExpenseById({ id, collection, query }: GetExpenseByIdParams) {
  try {
    const addFields = { projectAsObjectId: { $toObjectId: '$projeto.id' } }
    const lookup = { from: 'projects', localField: 'projectAsObjectId', foreignField: '_id', as: 'projetoDados' }

    const expensesArr = await collection.aggregate([{ $match: { _id: new ObjectId(id), ...query } }, { $addFields: addFields }, { $lookup: lookup }]).toArray()

    const expense = expensesArr.map((e) => ({ ...e, projetoDados: e.projetoDados[0] }))

    return expense[0] as TExpenseWithProject
  } catch (error) {
    throw error
  }
}

type GetExpensesByProjectIdParams = {
  projectId: string
  collection: Collection<TExpense>
  query: Filter<TExpense>
}

export async function getExpensesByProjectId({ projectId, collection, query }: GetExpensesByProjectIdParams) {
  try {
    const expenses = await collection.find({ 'projeto.id': projectId, ...query }).toArray()

    return expenses
  } catch (error) {
    throw error
  }
}

type GetExpensesParams = {
  collection: Collection<TExpense>
  query: Filter<TExpense>
}
export async function getExpenses({ collection, query }: GetExpensesParams) {
  try {
    const expenses = await collection.find({ ...query }).toArray()

    return expenses
  } catch (error) {
    throw error
  }
}

type GetExpensesByFiltersParams = {
  collection: Collection<TExpense>
  query: Filter<TExpense>
  skip: number
  limit: number
}

export async function getExpensesByFilters({ collection, query, skip, limit }: GetExpensesByFiltersParams) {
  try {
    const expensesMatched = await collection.countDocuments({ ...query })
    const sort = { _id: -1 }
    const match = { ...query }
    const expenses = await collection
      .aggregate([{ $sort: sort }, { $match: match }, { $skip: skip }, { $limit: limit }, { $project: ExpenseSimplifiedProjection }])
      .toArray()

    return { expenses, expensesMatched } as { expenses: TExpenseDTOSimplified[]; expensesMatched: number }
  } catch (error) {
    throw error
  }
}
type GetPaymentsByFiltersParams = {
  collection: Collection<TExpense>
  query: Filter<TExpense>
  skip: number
  limit: number
}

export async function getPaymentsByFilters({ collection, query, skip, limit }: GetPaymentsByFiltersParams) {
  try {
    const match = { ...query }
    const unwind = { path: '$pagamentos', includeArrayIndex: 'indexPagamento', preserveNullAndEmptyArrays: false }
    const sort = { 'pagamentos.efetivado': 1, 'pagamentos.dataPagamento': 1 }

    const paymentsMatched = (await collection.aggregate([{ $match: match }, { $unwind: unwind }, { $count: 'contagem' }]).toArray())[0]?.contagem || 0

    const projection = { titulo: 1, pagamentos: 1, indexPagamento: 1 }
    const payments = (await collection
      .aggregate([{ $match: match }, { $unwind: unwind }, { $project: projection }, { $sort: sort }, { $skip: skip }, { $limit: limit }])
      .toArray()) as TPayment[]

    return { payments, paymentsMatched } as { payments: TPayment[]; paymentsMatched: number }
  } catch (error) {
    throw error
  }
}
