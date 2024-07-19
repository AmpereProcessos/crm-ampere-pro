import { getDayStringsBetweenDates, getFixedDate } from '@/lib/methods/dates'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { GeneralExpenseFiltersSchema, TExpense } from '@/utils/schemas/expenses.schema'
import { TProject } from '@/utils/schemas/project.schema'
import dayjs from 'dayjs'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

export type TExpenseStatsResults = {
  total: number
  totalPago: number
  totalAPagar: number
  totalAPagarHoje: number
  totalAPagarEmAtraso: number
  diario: {
    dia: string
    previsto: number
    efetivo: number
  }[]
}

type TExpenseStatsReduced = {
  total: number
  totalPago: number
  totalAPagar: number
  totalAPagarHoje: number
  totalAPagarEmAtraso: number
  diario: {
    [key: string]: {
      previsto: number
      efetivo: number
    }
  }
}

type PostResponse = {
  data: TExpenseStatsResults
}
const QueryDatesSchema = z.object({
  after: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
  before: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
})

const getExpensesStatsRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const { after, before } = QueryDatesSchema.parse(req.query)
  const { partners, projectTypes } = GeneralExpenseFiltersSchema.parse(req.body)

  const partnerQuery: Filter<TExpense> = partners ? { idParceiro: { $in: [...partners] } } : {}
  const projectTypesQuery: Filter<TExpense> = projectTypes ? { 'projeto.tipo': { $in: [...projectTypes] } } : {}

  const query: Filter<TExpense> = { ...partnerQuery, ...projectTypesQuery }

  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').toDate()

  const initialDate = dayjs(after).add(3, 'hour').toISOString()
  const endDate = dayjs(before).endOf('day').add(3, 'hour').toISOString()
  const datesStrs = getDayStringsBetweenDates({ initialDate, endDate })

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const collection: Collection<TExpense> = db.collection('expenses')

  const expenses = await getExpenses({ collection, afterDate, beforeDate, query: query })
  const initialReducedAcc: TExpenseStatsReduced = {
    total: 0,
    totalPago: 0,
    totalAPagar: 0,
    totalAPagarHoje: 0,
    totalAPagarEmAtraso: 0,
    diario: datesStrs.reduce((acc: TExpenseStatsReduced['diario'], current) => {
      acc[current] = { previsto: 0, efetivo: 0 }
      return acc
    }, {}),
  }
  const reduced = expenses.reduce((acc: TExpenseStatsReduced, current) => {
    const revenueTotal = current.total
    const competenceDay = new Date(current.dataCompetencia)

    // Updating the total if revenue competence is within the current period
    const isCompetentWithinCurrentPeriod = competenceDay >= afterDate && competenceDay <= beforeDate
    if (isCompetentWithinCurrentPeriod) acc.total += revenueTotal

    // Iterating through the payments to update the other fields
    current.pagamentos.forEach((payment) => {
      const paymentValue = payment.valor
      const paymentDate = payment.dataPagamento ? getFixedDate(payment.dataPagamento, 'start') : null
      const paymentDay = dayjs(paymentDate).format('DD/MM')

      const wasPaid = !!payment.efetivado
      if (wasPaid && !!paymentDate) {
        // In case it was paid and within the current period, updating the totalPago field and the corresponding day
        // efective field
        const wasPaidWithinCurrentPeriod = paymentDate >= afterDate && paymentDate <= beforeDate
        if (wasPaidWithinCurrentPeriod) {
          acc.totalPago += paymentValue
          acc.diario[paymentDay].efetivo += paymentValue
        }
      } else {
        // In case it was not paid it

        // Updating the totalAPagar field
        acc.totalAPagar += paymentValue

        // Defining flags based on the payment date
        const paymentIsWithinCurrentPeriod = paymentDate && paymentDate >= afterDate && paymentDate <= beforeDate
        const paymentIsForToday = paymentDate && dayjs(paymentDate).isSame(new Date(), 'day')
        const paymentIsOverdue = paymentDate && dayjs(paymentDate).isBefore(new Date())

        // In case the flag paymentIsForToday is true (for payments due to today), updating the totalAPagarHoje
        if (paymentIsForToday) acc.totalAPagarHoje += paymentValue
        // In case the flag paymentIsOverdue is true (for overdue payments), updating the totalAPagarEmAtraso
        if (paymentIsOverdue) acc.totalAPagarEmAtraso += paymentValue
        // In case the flag paymentIsWithinCurrentPeriod is true (for payments within the period of filter), updating the corresponding
        // day previsto field
        if (paymentIsWithinCurrentPeriod) acc.diario[paymentDay].previsto += paymentValue
      }
    })
    return acc
  }, initialReducedAcc)

  const results: TExpenseStatsResults = {
    total: reduced.total,
    totalPago: reduced.totalPago,
    totalAPagar: reduced.totalAPagar,
    totalAPagarHoje: reduced.totalAPagarHoje,
    totalAPagarEmAtraso: reduced.totalAPagarEmAtraso,
    diario: Object.entries(reduced.diario).map(([key, value]) => ({ dia: key, ...value })),
  }
  return res.status(200).json({ data: results })
}

export default apiHandler({ POST: getExpensesStatsRoute })

type GetExpensesParams = {
  collection: Collection<TExpense>
  afterDate: Date
  beforeDate: Date
  query: Filter<TExpense>
}

type TExpenseResult = {
  tipoProjeto: TProject['tipo']['titulo']
  total: TExpense['total']
  dataCompetencia: TExpense['dataCompetencia']
  pagamentos: TExpense['pagamentos']
  dataInsercao: TExpense['dataInsercao']
}
async function getExpenses({ collection, afterDate, beforeDate, query }: GetExpensesParams) {
  const afterDateStr = afterDate.toISOString()
  const beforeDateStr = beforeDate.toISOString()
  const match: Filter<TExpense> = {
    ...query,
    $or: [
      { $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
      { $and: [{ dataCompetencia: { $gte: afterDateStr } }, { dataCompetencia: { $lte: beforeDateStr } }] },
      { $and: [{ 'pagamentos.dataPagamento': { $gte: afterDateStr } }, { 'pagamentos.dataPagamento': { $lte: beforeDateStr } }] },
    ],
  }
  const projection = {
    'projeto.tipo': 1,
    total: 1,
    dataCompetencia: 1,
    pagamentos: 1,
    dataInsercao: 1,
  }
  const result = await collection.aggregate([{ $match: match }, { $project: projection }]).toArray()

  const expenses = result.map((r) => ({
    tipoProjeto: r.projeto.tipo,
    total: r.total,
    dataCompetencia: r.dataCompetencia,
    pagamentos: r.pagamentos,
    dataInsercao: r.dataInsercao,
  })) as TExpenseResult[]

  return expenses
}
