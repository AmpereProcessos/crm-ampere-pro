import { Sidebar } from '@/components/Sidebar'
import LoadingPage from '@/components/utils/LoadingPage'
import { getErrorMessage } from '@/lib/methods/errors'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function Testing() {
  const { data: session, status } = useSession()

  async function getTest() {
    try {
      const { data } = await axios.get('/api/kits')
      console.log(data)
    } catch (error) {
      console.log('ERRO', error)
      const msg = getErrorMessage(error)
      toast.error(msg)
    }
  }
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="w-full self-center lg:w-[40%]">
          <button onClick={() => getTest()}>CLICAR</button>
        </div>
      </div>
    </div>
  )
}

export default Testing
