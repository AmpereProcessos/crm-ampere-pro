import MultipleSelectInput from '@/components/Inputs/MultipleSelectInput'
import TextInput from '@/components/Inputs/TextInput'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { formatDateAsLocale, formatDecimalPlaces } from '@/lib/methods/formatting'
import { AllProcessTracked } from '@/utils/process-tracking'
import { useProjectsFollowUp } from '@/utils/queries/project'
import { Session } from 'next-auth'
import Link from 'next/link'
import React from 'react'
import { BsCalendarCheck, BsCheckCircleFill, BsCode } from 'react-icons/bs'
import { FaBolt, FaCity } from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'

type ProjectsFollowUpPageProps = {
  session: Session
}
function ProjectsFollowUpPage({ session }: ProjectsFollowUpPageProps) {
  const { data: projects, isLoading, isError, isSuccess, filters, setFilters } = useProjectsFollowUp()
  return (
    <div className="flex w-full grow flex-col">
      {isLoading ? <LoadingComponent /> : null}
      {isError ? <ErrorComponent msg="Oops, houve um erro ao buscar resultados." /> : null}
      {isSuccess ? (
        <>
          <div className="mb-4 flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
            <div className="flex min-w-fit items-center gap-2">
              <h1 className="py-6 text-center text-lg font-black leading-4 tracking-tighter">FOLLOW UP DE PROJETOS</h1>
            </div>
            <div className="flex grow flex-wrap items-center justify-end gap-2">
              <TextInput
                label="NOME DO PROJETO"
                placeholder="Filtre pelo nome do projeto..."
                value={filters.search}
                handleChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
              />
              <MultipleSelectInput
                label="PROCESSO PENDENTE"
                options={Object.values(AllProcessTracked)
                  .map((value) => value)
                  .flat(1)
                  .map((process, index) => ({ id: index + 1, value: process.processo, label: process.processo }))}
                selected={filters.pendingProcesses}
                handleChange={(value) => setFilters((prev) => ({ ...prev, pendingProcesses: value as string[] }))}
                selectedItemLabel="NÃO DEFINIDO"
                onReset={() => setFilters((prev) => ({ ...prev, pendingProcesses: [] }))}
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-6">
            {projects.map((project, key) => (
              <div key={key} className="flex w-full flex-col gap-2 rounded border border-gray-500 bg-[#fff] p-4 shadow-sm">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
                      <MdDashboard size={12} />
                    </div>
                    <h1 className="text-sm font-black leading-none tracking-tight">{project.nome}</h1>
                    <div className="flex items-center gap-1">
                      <BsCode />
                      {project.idProjetoCRM ? (
                        <Link href={`/comercial/oportunidades/id/${project.idProjetoCRM}`}>
                          <h1 className="text-sm tracking-tight text-gray-500 duration-300 ease-in-out hover:text-cyan-500">{project.identificador}</h1>
                        </Link>
                      ) : (
                        <h1 className="text-sm tracking-tight text-gray-500">{project.identificador}</h1>
                      )}
                    </div>
                  </div>
                  <h1 className="rounded-full bg-gray-800 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">{project.indexador}</h1>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <MdDashboard />
                    <h1 className="text-xs font-medium leading-none text-gray-500">{project.tipo}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCity />
                    <h1 className="text-xs font-medium leading-none text-gray-500">{project.cidade}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaBolt />
                    <h1 className="text-xs font-medium leading-none text-gray-500">{formatDecimalPlaces(project.potenciaPico)} kWp</h1>
                  </div>
                </div>
                <h1 className="w-full text-start text-xs font-medium">PROCESSOS</h1>
                <div className="flex w-full flex-wrap items-center gap-4">
                  {project.processos.map((process, processIndex) => {
                    if (process.concluido)
                      return (
                        <div
                          key={processIndex}
                          className="flex items-center gap-1 rounded-lg border border-green-600 bg-green-50 px-2 py-1 text-[0.57rem] font-medium"
                        >
                          <h1 className="">{process.processo}</h1>
                          <BsCalendarCheck color="rgb(22,163,7)" />
                          <h1>{process.data && process.data != '-' ? formatDateAsLocale(process.data) : 'N/A'}</h1>
                        </div>
                      )
                    else
                      return (
                        <div key={processIndex} className="rounded-lg border border-gray-500 bg-gray-50 px-2 py-1 text-[0.57rem] font-medium">
                          <h1>{process.processo}</h1>
                        </div>
                      )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default ProjectsFollowUpPage
