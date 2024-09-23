import SelectInput from '@/components/InputsPlus/SelectInput'
import SelectOldInput from "@/components/Inputs/SelectInput"
import { Sidebar } from '@/components/Sidebar'
import LoadingPage from '@/components/utils/LoadingPage'
import { getErrorMessage } from '@/lib/methods/errors'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function Testing() {
  const { data: session, status } = useSession()

  const [value, setValue] = useState<string | null>(null)
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <SelectInput label={"NEW INPUT"} value={value} handleChange={(value) => setValue(value)} selectedItemLabel='NÃO DEFINIDO' options={[{ id: 1, label: "TESTE 1", value: "TESTANDO 1" }, { id: 2, label: "TESTE 2", value: "TESTANDO 2" }]} />
        <SelectOldInput label='OLD INPUT' handleChange={value => setValue(value)} value={value} options={[{ id: 1, label: "TESTE 1", value: "TESTANDO 1" }, { id: 2, label: "TESTE 2", value: "TESTANDO 2" }]} selectedItemLabel='NÃO DEFINIDO' onReset={() => setValue(null)} />
      </div>
    </div>
  )
}

export default Testing
