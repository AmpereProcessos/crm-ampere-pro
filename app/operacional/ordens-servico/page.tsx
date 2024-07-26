import { auth } from '@/auth'
import ServiceOrdersPage from '@/components/ServiceOrders/ServiceOrdersPage'
import { redirect } from 'next/navigation'
import React from 'react'

async function ServiceOrderMainPage() {
  const session = await auth()
  if (!session) return redirect('/auth/signin')

  return <ServiceOrdersPage session={session} />
}

export default ServiceOrderMainPage
