import React, { useState } from 'react'
import { useSession } from 'next-auth/react'

import { BsCalendar2Check, BsCalendarCheckFill, BsCalendarFill } from 'react-icons/bs'

import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema'
import { useUsers } from '@/utils/queries/users'
import SelectInput from '@/components/Inputs/SelectInput'
import { TechnicalAnalysisPendencyCategories } from '@/utils/select-options'
import TextInput from '@/components/Inputs/TextInput'
import SelectWithImages from '@/components/Inputs/SelectWithImages'
import CheckboxInput from '@/components/Inputs/CheckboxInput'
import Avatar from '@/components/utils/Avatar'
import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting'
import toast from 'react-hot-toast'
import { Session } from 'next-auth'

import { createOpportunityHistory } from '@/utils/mutations/opportunity-history'
import { TNotification } from '@/utils/schemas/notification.schema'
import { createNotification } from '@/utils/mutations/notifications'
import { TActivity } from '@/utils/schemas/activities.schema'
import { useActivitiesByTechnicalAnalysisId } from '@/utils/queries/activities'
import NewActivityMenu from '@/components/Activities/NewActivityMenu'
import LoadingComponent from '@/components/utils/LoadingComponent'
import ErrorComponent from '@/components/utils/ErrorComponent'
import HomologationActivity from '@/components/Cards/HomologationActivity'
import TechnicalAnalysisActivity from '@/components/Cards/TechnicalAnalysisActivity'

type PendencyBlockProps = {
  session: Session
  technicalAnalysisId: string
  opportunity: { id?: string | null; nome?: string | null }
  infoHolder: TTechnicalAnalysisDTO
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>
  changes: object
  setChanges: React.Dispatch<React.SetStateAction<object>>
}
function PendencyBlock({ session, technicalAnalysisId, opportunity, infoHolder, setInfoHolder, changes, setChanges }: PendencyBlockProps) {
  const { data: activities, isLoading, isError, isSuccess } = useActivitiesByTechnicalAnalysisId({ technicalAnalysisId: technicalAnalysisId })
  return (
    <div className="mt-4 flex w-full flex-col">
      <div className="mb-2 flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
        <h1 className="font-bold text-white">PENDÊNCIAS</h1>
      </div>
      <NewActivityMenu
        session={session}
        opportunity={opportunity}
        project={undefined}
        technicalAnalysisId={technicalAnalysisId}
        affectedQueryKey={['technical-analysis-activities', technicalAnalysisId]}
      />
      <div className="mt-2 flex w-full flex-col gap-1">
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Houve um erro ao buscar atividades da análise técnica." /> : null}
        {isSuccess ? (
          activities.length > 0 ? (
            activities.map((activity, index) => <TechnicalAnalysisActivity key={activity._id} activity={activity} technicalAnalysisId={technicalAnalysisId} />)
          ) : (
            <p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
              Sem atividades adicionadas.
            </p>
          )
        ) : null}
      </div>
    </div>
  )
}

export default PendencyBlock
