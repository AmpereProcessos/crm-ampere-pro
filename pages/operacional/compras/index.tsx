import PurchaseCard from '@/components/Cards/PurchaseCard'
import ControlPurchase from '@/components/Modals/Purchase/ControlPurchase'
import PurchasesPage from '@/components/Purchases/PurchasesPage'
import { Sidebar } from '@/components/Sidebar'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import LoadingPage from '@/components/utils/LoadingPage'
import { usePurchases } from '@/utils/queries/purchases'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'

function PurchasesMainPage() {
  const { data: session, status } = useSession({ required: true })
  if (status != 'authenticated') return <LoadingPage />
  return <PurchasesPage session={session} />
}

export default PurchasesMainPage
