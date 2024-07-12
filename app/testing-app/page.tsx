'use client'

import { useSession } from 'next-auth/react'

import React from 'react'

function TestingPage() {
  const { data: session } = useSession()
  console.log(session)
  return <div>TestinPage</div>
}

export default TestingPage
