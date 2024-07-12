import { auth } from '@/auth'
import { useSession } from 'next-auth/react'

import React from 'react'

async function TestingPage() {
  const session = await auth()
  console.log(session)
  return <div>TestinPage</div>
}

export default TestingPage
