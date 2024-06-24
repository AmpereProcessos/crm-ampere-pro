import { useState } from 'react'
import { getServerSession } from 'next-auth'
import { Collection, Filter } from 'mongodb'
import { GetServerSidePropsContext } from 'next'
import { authOptions } from '../../api/auth/[...nextauth]'

import { getPartnerFunnels } from '@/repositories/funnels/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'

import LoadingPage from '@/components/utils/LoadingPage'

import { useOpportunitiesQueryOptions } from '@/utils/queries/opportunities'

import { TFunnel, TFunnelDTO } from '@/utils/schemas/funnel.schema'
import OpportunitiesCardModePage from '@/components/Opportunities/OpportunitiesCardModePage'
import OpportunitiesKanbanModePage from '@/components/Opportunities/OpportunitiesKanbanModePage'
import { useSession } from 'next-auth/react'
import nookies, { setCookie, parseCookies } from 'nookies'
import { handleSetCookie } from '@/lib/methods/cookies'

export type TOpportunitiesPageModes = 'card' | 'kanban'

type OpportunitiesMainPageProps = { initialMode: TOpportunitiesPageModes | null | undefined }
export default function OpportunitiesMainPage({ initialMode }: OpportunitiesMainPageProps) {
  console.log(initialMode)
  const { data: session, status } = useSession({ required: true })
  const { data: queryOptions } = useOpportunitiesQueryOptions()

  const responsiblesOptions = queryOptions?.responsibles || []
  const partnersOptions = queryOptions?.partners || []
  const projectTypesOptions = queryOptions?.projectTypes || []
  const funnelsOptions = queryOptions?.funnels || []

  const [mode, setMode] = useState<TOpportunitiesPageModes>(initialMode || 'kanban')

  function handleSetMode(selected: TOpportunitiesPageModes) {
    // Setting selected mode in a cookie for futher preference use
    handleSetCookie({ ctx: null, key: 'opportunities-page-mode', value: selected, path: '/comercial/oportunidades' })
    setMode(selected)
  }

  if (status != 'authenticated') return <LoadingPage />
  if (mode == 'card')
    return (
      <OpportunitiesCardModePage
        session={session}
        partnersOptions={partnersOptions}
        responsiblesOptions={responsiblesOptions}
        projectTypesOptions={projectTypesOptions}
        funnelsOptions={funnelsOptions}
        handleSetMode={handleSetMode}
      />
    )
  if (mode == 'kanban')
    return (
      <OpportunitiesKanbanModePage session={session} funnelsOptions={funnelsOptions} responsiblesOptions={responsiblesOptions} handleSetMode={handleSetMode} />
    )
  return <></>
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookies = nookies.get(context)
  console.log(cookies)
  const initialMode = cookies['opportunities-page-mode'] || null
  return {
    props: {
      initialMode,
    },
  }
}
