import HomologationsControlPage from '@/app/components/Homologations/Page/HomologationPage'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import React from 'react'

async function HomologationMainPage() {
  const session = await auth()
  if (!session) return redirect('/auth/signin')
  return <HomologationsControlPage session={session} />
}

export default HomologationMainPage
