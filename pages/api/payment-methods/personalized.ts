import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthentication } from '@/utils/api'
import { TKit } from '@/utils/schemas/kits.schema'
import { TPaymentMethod, TPaymentMethodDTO } from '@/utils/schemas/payment-methods'
import { TProduct } from '@/utils/schemas/products.schema'
import { TService } from '@/utils/schemas/service.schema'
import { TSignaturePlan } from '@/utils/schemas/signature-plans.schema'
import { Collection, ObjectId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

type TPostResponse = {
  data: TPaymentMethod[]
}

const PayloadFilters = z.object({
  kitsIds: z.array(z.string({ required_error: 'ID de kit não informado.', invalid_type_error: 'Tipo não válido para o ID do kit.' })),
  plansIds: z.array(z.string({ required_error: 'ID de plano não informado.', invalid_type_error: 'Tipo não válido para o ID do plano.' })),
  productsIds: z.array(z.string({ required_error: 'ID de produto não informado.', invalid_type_error: 'Tipo não válido para o ID do produto.' })),
  servicesIds: z.array(z.string({ required_error: 'ID de serviço não informado.', invalid_type_error: 'Tipo não válido para o ID do serviço.' })),
})

const getPaymentMethods: NextApiHandler<TPostResponse> = async (req, res) => {
  await validateAuthentication(req, res)

  const { kitsIds, plansIds, productsIds, servicesIds } = PayloadFilters.parse(req.body)

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')

  const kitsCollection: Collection<TKit> = db.collection('kits')
  const plansCollection: Collection<TSignaturePlan> = db.collection('signature-plans')
  const productsCollection: Collection<TProduct> = db.collection('products')
  const servicesCollection: Collection<TService> = db.collection('services')
  const paymentMethodsCollection: Collection<TPaymentMethod> = db.collection('payment-methods')

  if (kitsIds.length > 0) {
    const kits = await kitsCollection.find({ _id: { $in: kitsIds.map((k) => new ObjectId(k)) } }, { projection: { idsMetodologiasPagamento: 1 } }).toArray()
    const paymentMethodIds = kits.flatMap((k) => k.idsMetodologiasPagamento).map((p) => p.toString())

    const paymentMethods = await paymentMethodsCollection.find({ _id: { $in: paymentMethodIds.map((p) => new ObjectId(p)) } }).toArray()

    return res.status(200).json({ data: paymentMethods })
  }
  if (plansIds.length > 0) {
    const plans = await plansCollection.find({ _id: { $in: plansIds.map((k) => new ObjectId(k)) } }, { projection: { idsMetodologiasPagamento: 1 } }).toArray()

    const paymentMethodIds = plans.flatMap((k) => k.idsMetodologiasPagamento).map((p) => p.toString())

    const paymentMethods = await paymentMethodsCollection.find({ _id: { $in: paymentMethodIds.map((p) => new ObjectId(p)) } }).toArray()

    return res.status(200).json({ data: paymentMethods })
  }
  if (productsIds.length > 0) {
    const products = await productsCollection
      .find({ _id: { $in: productsIds.map((k) => new ObjectId(k)) } }, { projection: { idsMetodologiasPagamento: 1 } })
      .toArray()

    const paymentMethodIds = products.flatMap((k) => k.idsMetodologiasPagamento).map((p) => p.toString())

    const paymentMethods = await paymentMethodsCollection.find({ _id: { $in: paymentMethodIds.map((p) => new ObjectId(p)) } }).toArray()

    return res.status(200).json({ data: paymentMethods })
  }
  if (servicesIds.length > 0) {
    const services = await servicesCollection
      .find({ _id: { $in: servicesIds.map((k) => new ObjectId(k)) } }, { projection: { idsMetodologiasPagamento: 1 } })
      .toArray()

    const paymentMethodIds = services.flatMap((k) => k.idsMetodologiasPagamento).map((p) => p.toString())

    const paymentMethods = await paymentMethodsCollection.find({ _id: { $in: paymentMethodIds.map((p) => new ObjectId(p)) } }).toArray()

    return res.status(200).json({ data: paymentMethods })
  }

  return res.status(200).json({ data: [] })
}

export default apiHandler({ POST: getPaymentMethods })
