import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Session, getServerSession } from 'next-auth'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Collection, Filter } from 'mongodb'
import { GetServerSidePropsContext } from 'next'
import { authOptions } from '../../api/auth/[...nextauth]'

import { getPartnerFunnels } from '@/repositories/funnels/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'

import { AiOutlinePlus } from 'react-icons/ai'
import { BsDownload } from 'react-icons/bs'

import { Sidebar } from '@/components/Sidebar'
import FunnelList from '@/components/dnd/FunnelList'
import LoadingPage from '@/components/utils/LoadingPage'
import PeriodDropdownFilter from '@/components/Inputs/PeriodDropdownFilter'
import NewOpportunity from '@/components/Modals/Opportunity/NewOpportunity'
import SearchOpportunities from '@/components/Opportunities/SearchOpportunities'
import LoadingComponent from '@/components/utils/LoadingComponent'

import SelectInput from '@/components/Inputs/SelectInput'

import { useOpportunityCreators } from '@/utils/queries/users'
import { fetchOpportunityExport, useOpportunities, useOpportunitiesQueryOptions } from '@/utils/queries/opportunities'

import { TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels } from '@/utils/schemas/opportunity.schema'
import { TUserDTOSimplified } from '@/utils/schemas/user.schema'
import { TFunnel, TFunnelDTO } from '@/utils/schemas/funnel.schema'

import { useFunnelReferenceUpdate } from '@/utils/mutations/funnel-references'

import { getExcelFromJSON } from '@/lib/methods/excel-utils'
import { formatDateAsLocale } from '@/lib/methods/formatting'
import OpportunitiesCardModePage from '@/components/Opportunities/OpportunitiesCardModePage'
import OpportunitiesKanbanModePage from '@/components/Opportunities/OpportunitiesKanbanModePage'
import { useSession } from 'next-auth/react'

export type TOpportunitiesPageModes = 'card' | 'kanban'

export default function OpportunitiesMainPage({}) {
  const { data: session, status } = useSession()
  const { data: queryOptions } = useOpportunitiesQueryOptions()

  const responsiblesOptions = queryOptions?.responsibles || []
  const partnersOptions = queryOptions?.partners || []
  const projectTypesOptions = queryOptions?.projectTypes || []
  const funnelsOptions = queryOptions?.funnels || []

  const [mode, setMode] = useState<TOpportunitiesPageModes>('kanban')
  if (status != 'authenticated') return <LoadingPage />
  if (mode == 'card')
    return (
      <OpportunitiesCardModePage
        session={session}
        partnersOptions={partnersOptions}
        responsiblesOptions={responsiblesOptions}
        projectTypesOptions={projectTypesOptions}
        funnelsOptions={funnelsOptions}
        handleSetMode={(m) => setMode(m)}
      />
    )
  if (mode == 'kanban')
    return (
      <OpportunitiesKanbanModePage
        session={session}
        funnelsOptions={funnelsOptions}
        responsiblesOptions={responsiblesOptions}
        handleSetMode={(m) => setMode(m)}
      />
    )
  return <></>
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // @ts-ignore
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }
  const partnerId = session.user.idParceiro
  const parterScope = session.user.permissoes.parceiros.escopo
  const partnerQuery: Filter<TFunnel> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {}

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const funnelsCollection: Collection<TFunnel> = db.collection('funnels')
  const funnels = await getPartnerFunnels({ collection: funnelsCollection, query: partnerQuery })
  const parsedFunnels: TFunnelDTO[] = funnels.map((funnel) => ({ ...funnel, _id: funnel._id.toString() }))
  const { user } = session
  return {
    props: {
      funnelsJSON: JSON.stringify(parsedFunnels),
      sessionJSON: JSON.stringify(session),
    },
  }
}
