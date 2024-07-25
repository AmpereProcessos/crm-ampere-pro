import { auth } from '@/auth'
import ErrorComponent from '@/components/utils/ErrorComponent'
import { ObjectId } from 'mongodb'
import React from 'react'
import { fetchServiceOrderById } from './queries'
import ReportPage from '@/app/components/ServiceOrders/ReportPage'

async function ServiceOrderReportPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return <ErrorComponent msg="Usuário não autenticado." />
  const orderId = params.id
  if (!orderId || typeof orderId != 'string' || !ObjectId.isValid(orderId)) return <ErrorComponent msg="Oops, ID inválido." />
  const order = await fetchServiceOrderById({ id: orderId })

  return <ReportPage order={order} user={session.user} />
}

export default ServiceOrderReportPage
