import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { TProject, TProjectDTO, TProjectDTOWithReferences, TProjectUltraSimplifiedDTO } from '../schemas/project.schema'
import { TFollowUpProject } from '@/pages/api/projects/follow-up'
import { useState } from 'react'
import { formatWithoutDiacritics } from '@/lib/methods/formatting'

async function fetchProjectById(id: string) {
  console.log('ID', id)
  if (!id) throw new Error('ID inválido.')
  try {
    const { data } = await axios.get(`/api/projects?id=${id}`)
    return data.data as TProjectDTOWithReferences
  } catch (error) {
    throw error
  }
}

export function useProjectById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['project-by-id', id],
    queryFn: async () => await fetchProjectById(id),
    refetchOnWindowFocus: true,
  })
}

async function fetchComercialProjects() {
  try {
    const { data } = await axios.get('/api/projects/by-sector/comercial')
    return data.data as TProjectDTO[]
  } catch (error) {}
}

export function useComercialProjects() {
  return useQuery({
    queryKey: ['comercial-projects'],
    queryFn: fetchComercialProjects,
  })
}

async function fetchProjectsUltraSimplified() {
  try {
    const { data } = await axios.get('/api/projects/simplified')
    return data.data as TProjectUltraSimplifiedDTO[]
  } catch (error) {
    throw error
  }
}

export function useProjectsUltraSimplified() {
  return useQuery({
    queryKey: ['projects-ultra-simplified'],
    queryFn: fetchProjectsUltraSimplified,
  })
}

async function fetchFollowUpProjects() {
  try {
    const { data } = await axios.get('/api/projects/follow-up')
    return data.data as TFollowUpProject[]
  } catch (error) {
    throw error
  }
}

type UseProjectsFollowUpFilters = {
  search: string
  projectTypes: string[]
  pendingProcesses: string[]
}
export function useProjectsFollowUp() {
  const [filters, setFilters] = useState<UseProjectsFollowUpFilters>({
    search: '',
    projectTypes: [],
    pendingProcesses: [],
  })

  function matchSearch(project: TFollowUpProject) {
    if (filters.search.trim().length == 0) return true
    return formatWithoutDiacritics(project.nome, true).includes(formatWithoutDiacritics(filters.search, true))
  }
  function matchProjectTypes(project: TFollowUpProject) {
    if (filters.projectTypes.length == 0) return true
    return filters.projectTypes.includes(project.tipo)
  }
  function matchPendingProcesses(project: TFollowUpProject) {
    if (filters.pendingProcesses.length == 0) return true
    return project.processos.some((process) => filters.pendingProcesses.includes(process.processo) && !process.concluido)
  }

  function handleModelData(data: TFollowUpProject[]) {
    return data.filter((project) => matchSearch(project) && matchProjectTypes(project) && matchPendingProcesses(project))
  }
  return {
    ...useQuery({
      queryKey: ['projects-follow-up'],
      queryFn: fetchFollowUpProjects,
      select: (data) => handleModelData(data),
    }),
    filters,
    setFilters,
  }
}
