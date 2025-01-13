import SelectInput from '@/components/InputsPlus/SelectInput'
import SelectOldInput from '@/components/Inputs/SelectInput'
import { Sidebar } from '@/components/Sidebar'
import LoadingPage from '@/components/utils/LoadingPage'
import { getErrorMessage } from '@/lib/methods/errors'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import OpportunitiesSendAndReceived from '@/opportunities-send-received-2024.json'
function Testing() {
  const { data: session, status } = useSession()

  const [value, setValue] = useState<string | null>(null)
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">{OpportunitiesSendAndReceived['ENVIOS']}</div>
    </div>
  )
}

export default Testing
