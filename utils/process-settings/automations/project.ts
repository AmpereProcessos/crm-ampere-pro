import { TActivity } from '@/utils/schemas/activities.schema'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'
import { TProject, TProjectWithReferences } from '@/utils/schemas/project.schema'
import { WithId } from 'mongodb'
import { TProcessAutomationEntities } from '..'

type GetProjectToEntityProps = {
  project: WithId<TProject>
  customization: TProcessFlowReference['entidade']['customizacao']
  newEntity: TProcessAutomationEntities
}

export function getProjectToEntity({ project, customization, newEntity }: GetProjectToEntityProps) {
  if (newEntity == 'Activity') return getProjectToActivityData({ project, customization })
}

type GetProjectToActivityDataProps = {
  project: WithId<TProject>
  customization: TProcessFlowReference['entidade']['customizacao']
}
export function getProjectToActivityData({ project, customization }: GetProjectToActivityDataProps) {
  const activity: TActivity = {
    idParceiro: project.idParceiro,
    titulo: customization.titulo, // resume of the activity
    descricao: customization.descricao, // description of what to be done
    responsaveis: customization.responsaveis,
    oportunidade: project.oportunidade,
    projeto: {
      id: project._id.toString(),
      nome: project.nome,
    },
    idHomologacao: project.idHomologacao,
    idAnaliseTecnica: project.idAnaliseTecnica,
    subatividades: [],
    dataVencimento: null,
    dataConclusao: null,
    dataInsercao: new Date().toISOString(),
    autor: {
      id: 'id-holder',
      nome: 'AUTOMAÇÃO',
      avatar_url: null,
    },
  }
  return activity
}
