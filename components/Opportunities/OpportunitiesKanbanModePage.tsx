import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Session } from 'next-auth'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Collection, Filter } from 'mongodb'
import { GetServerSidePropsContext } from 'next'
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
import { fetchOpportunityExport, useOpportunities } from '@/utils/queries/opportunities'

import { TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels } from '@/utils/schemas/opportunity.schema'
import { TUserDTOSimplified } from '@/utils/schemas/user.schema'
import { TFunnel, TFunnelDTO } from '@/utils/schemas/funnel.schema'

import { useFunnelReferenceUpdate } from '@/utils/mutations/funnel-references'

import { getExcelFromJSON } from '@/lib/methods/excel-utils'
import { formatDateAsLocale } from '@/lib/methods/formatting'
import { TOpportunitiesPageModes } from '@/pages/comercial/oportunidades'
import { FaRotate } from 'react-icons/fa6'
import MultipleSelectInput from '../Inputs/MultipleSelectInput'

type Options = {
  activeResponsible: string[] | null
  activeFunnel: string | null
  responsibleOptions:
    | {
        id: string
        label: string
        value: string
      }[]
    | null
  funnelOptions:
    | {
        id: string | number
        label: string
        value: string | number
      }[]
    | null
}
type ParamFilter = {
  status: 'GANHOS' | 'PERDIDOS' | undefined
  mode: 'GERAL' | 'ATIVO' | 'LEAD'
}

type DateFilterType = {
  after: string | undefined
  before: string | undefined
}
type GetStageOpportunities = {
  opportunities: TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[]
  stageId: string | number
}
function getStageOpportunities({ opportunities, stageId }: GetStageOpportunities) {
  if (opportunities) {
    let stageOpportunities = opportunities.filter((project) => project.funil.idEstagio == stageId)
    return stageOpportunities
  } else return []
}
type GetOptionsParams = {
  session: Session | null
  responsiblesOptions: TUserDTOSimplified[] | undefined
  funnelsOptions: TFunnelDTO[] | undefined
}
function getOptions({ session, responsiblesOptions, funnelsOptions }: GetOptionsParams) {
  const responsibleFilterPreference = typeof window != 'undefined' ? localStorage.getItem('responsible') : null
  const funnelFilterPreference = typeof window != 'undefined' ? localStorage.getItem('funnel') : null

  var options: Options = {
    activeResponsible: null,
    activeFunnel: null,
    responsibleOptions: null,
    funnelOptions: null,
  }

  if (!session || !responsiblesOptions || !funnelsOptions) return options
  // Case were user has a global scope, which means able to visualize all opportunities
  if (!session.user.permissoes.oportunidades.escopo) {
    options.activeResponsible = null
    // If defined in local storage, using the stored option instead of null
    if (responsibleFilterPreference) options.activeResponsible = JSON.parse(responsibleFilterPreference) as string[]
 
    options.responsibleOptions = responsiblesOptions.map((resp) => {
      return {
        id: resp._id.toString(),
        label: resp.nome,
        value: resp._id.toString(),
      }
    })
  }
  // Case were user has a defined limited scope, which means able to visualize opportunities from a given list of users
  if (!!session.user.permissoes.oportunidades.escopo) {
    // filtering options to the defined user ids
    const visibleUsers = session.user.permissoes.oportunidades.escopo
    var filteredresponsibles = responsiblesOptions.filter((responsible) => visibleUsers.includes(responsible._id.toString()))

    options.activeResponsible = [session.user.id]

    options.responsibleOptions = filteredresponsibles.map((resp) => ({
      id: resp._id.toString(),
      label: resp.nome,
      value: resp._id.toString(),
    }))
  }
  // Defining funnel related options
  options.activeFunnel = funnelsOptions[0]?._id.toString() || null
  if (funnelFilterPreference) options.activeFunnel = funnelFilterPreference
  options.funnelOptions = funnelsOptions.map((funnel) => ({ id: funnel._id.toString(), label: funnel.nome, value: funnel._id.toString() }))

  return options
}
type OpportunitiesKanbanModePageProps = {
  session: Session
  funnelsOptions: TFunnelDTO[]
  responsiblesOptions: TUserDTOSimplified[]
  handleSetMode: (mode: TOpportunitiesPageModes) => void
}
export default function OpportunitiesKanbanModePage({ session, funnelsOptions, responsiblesOptions, handleSetMode }: OpportunitiesKanbanModePageProps) {
  const queryClient = useQueryClient()

  const [newProjectModalIsOpen, setNewProjectModalIsOpen] = useState<boolean>(false)

  const [funnel, setFunnel] = useState<string | null>(getOptions({ session, responsiblesOptions, funnelsOptions }).activeFunnel)
  const [responsible, setResponsible] = useState<string[] | null>(getOptions({ session, responsiblesOptions, funnelsOptions }).activeResponsible)
  const [dateParam, setDateParam] = useState<DateFilterType>({
    after: undefined,
    before: undefined,
  })
  const [params, setParams] = useState<ParamFilter>({
    status: undefined,
    mode: 'GERAL',
  })

  const { data: projects } = useOpportunities({
    responsibles: responsible,
    funnel: funnel,
    after: dateParam.after,
    before: dateParam.before,
    status: params.status,
  })
  const { mutate: handleFunnelReferenceUpdate } = useFunnelReferenceUpdate({
    queryClient,
    affectedQueryKey: ['opportunities', responsible, funnel, dateParam.after, dateParam.before, params.status],
  })

  function handleFunnelChange(value: string) {
    setFunnel(value)
    localStorage.setItem('funnel', value.toString())
    return
  }
  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (destination.droppableId == source.droppableId) return
    const funnelReferenceId = draggableId
    const newStageId = destination.droppableId
    handleFunnelReferenceUpdate({ funnelReferenceId, newStageId })
  }

  async function handleExportData() {
    const results = await fetchOpportunityExport({
      responsibles: responsible,
      funnel: funnel,
      after: dateParam.after,
      before: dateParam.before,
      status: params.status,
    })
    getExcelFromJSON(results, `EXPORTAÇÃO DE OPORTUNIDADES ${formatDateAsLocale(new Date().toISOString())}`)
  }
  useEffect(() => {
    if (!funnel) {
      setFunnel(getOptions({ session, responsiblesOptions, funnelsOptions }).activeFunnel)
    }
    if (!responsible) {
      setResponsible(getOptions({ session, responsiblesOptions, funnelsOptions }).activeResponsible)
    }
  }, [session, responsiblesOptions, funnelsOptions])

  if (!session.user) return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex flex-col items-center border-b border-[#000] pb-2 xl:flex-row">
          <div className="flex items-center gap-1">
            <div className="text-xl font-black leading-none tracking-tight md:text-2xl">OPORTUNIDADES</div>
            <button
              onClick={() => handleSetMode('card')}
              className="flex items-center gap-1 px-2 text-xs text-gray-500 duration-300 ease-out hover:text-gray-800"
            >
              <FaRotate />
              <h1 className="font-medium">ALTERAR MODO</h1>
            </button>
          </div>

          <div className="flex grow flex-col items-center justify-end  gap-2 xl:flex-row">
            <PeriodDropdownFilter initialAfter={dateParam.after} initialBefore={dateParam.before} setDateParam={setDateParam} />
            <div className="w-full lg:w-[200px]">
              <SelectInput
                showLabel={false}
                label="STATUS"
                selectedItemLabel="EM ANDAMENTO"
                value={params.status}
                options={[
                  { id: 1, label: 'GANHOS', value: 'GANHOS' },
                  { id: 2, label: 'PERDIDOS', value: 'PERDIDOS' },
                ]}
                handleChange={(selected) => {
                  setParams((prev) => ({ ...prev, status: selected }))
                }}
                onReset={() => setParams((prev) => ({ ...prev, status: undefined }))}
                width="100%"
              />
            </div>
            <div className="w-full lg:w-[200px]">
              <MultipleSelectInput
                label="Usuários"
                showLabel={false}
                selectedItemLabel="Todos"
                selected={responsible}
                options={getOptions({ session, responsiblesOptions, funnelsOptions }).responsibleOptions}
                handleChange={(selected) => {
                  localStorage.setItem('responsible', JSON.stringify(selected as string[]))
                  setResponsible(selected as string[])
                }}
                onReset={() => {
                  if (!session.user.permissoes.oportunidades.escopo) {
                    setResponsible(null)
                    localStorage.removeItem('responsible')
                  } else {
                    setResponsible([session.user.id])
                    localStorage.setItem('responsible', JSON.stringify([session.user.id]))
                  }
                }}
                width="100%"
              />
            </div>
            <div className="w-full lg:w-[200px]">
              <SelectInput
                label="Funis"
                showLabel={false}
                selectedItemLabel="NÃO DEFINIDO"
                value={funnel}
                options={getOptions({ session, responsiblesOptions, funnelsOptions }).funnelOptions}
                handleChange={(selected) => {
                  handleFunnelChange(selected)
                  // setFunnel(selected.value)
                }}
                onReset={() => {
                  if (funnelsOptions) handleFunnelChange(funnelsOptions[0]._id.toString())
                }}
                width="100%"
              />
            </div>

            <button
              onClick={() => handleExportData()}
              className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#2c6e49] p-2 px-3 text-sm font-medium text-white shadow-sm duration-300 ease-in-out hover:scale-105"
            >
              <BsDownload style={{ fontSize: '18px' }} />
            </button>

            <SearchOpportunities />
            <button
              onClick={() => setNewProjectModalIsOpen(true)}
              className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#15599a] p-2 px-3 text-sm font-medium text-white shadow-sm duration-300 ease-in-out hover:scale-105"
            >
              <AiOutlinePlus style={{ fontSize: '18px' }} />
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
          <div className="1.5xl:max-h- mt-2 flex w-full overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 md:max-h-[500px] lg:max-h-[600px]  2.25xl:max-h-[800px]">
            {!projects || !funnelsOptions ? (
              <div className="flex min-h-[600px] w-full items-center justify-center">
                <LoadingComponent />
              </div>
            ) : funnelsOptions.filter((funn) => funn._id == funnel)[0] ? (
              funnelsOptions
                .filter((funn) => funn._id == funnel)[0]
                .etapas.map((stage) => (
                  <FunnelList
                    key={stage.id}
                    id={stage.id}
                    session={session}
                    stageName={stage.nome}
                    items={getStageOpportunities({ opportunities: projects, stageId: stage.id }).map((item, index) => {
                      return {
                        id: item.funil.id,
                        idOportunidade: item._id,
                        nome: item.nome,
                        identificador: item.identificador,
                        tipo: item.tipo.titulo,
                        responsaveis: item.responsaveis,
                        idIndicacao: item.idIndicacao || undefined,
                        idMarketing: item.idMarketing || undefined,
                        proposta: item.proposta,
                        statusAtividades: item.statusAtividades,
                        ganho: !!item.ganho.data,
                        perca: !!item.perda.data,
                        contratoSolicitado: !!item.ganho.dataSolicitacao,
                        dataInsercao: item.dataInsercao,
                      }
                    })}
                  />
                ))
            ) : null}
          </div>
        </DragDropContext>
      </div>
      {newProjectModalIsOpen ? (
        <NewOpportunity
          session={session}
          opportunityCreators={responsiblesOptions || []}
          funnels={funnelsOptions || []}
          closeModal={() => setNewProjectModalIsOpen(false)}
        />
      ) : null}
    </div>
  )
}
