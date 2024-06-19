import { TActivity } from '@/utils/schemas/activities.schema'
import { TProcessFlowReference } from '@/utils/schemas/process-flow-reference.schema'
import { TProjectWithReferences } from '@/utils/schemas/project.schema'

type GetProjectToActivityDataProps = {
  project: TProjectWithReferences
  customization: TProcessFlowReference['retorno']['customizacao']
}
export function getProjectToActivityData({ project, customization }: GetProjectToActivityDataProps) {
  const activity: TActivity = {
    idParceiro: project.idParceiro,
    titulo: customization.titulo, // resume of the activity
    descricao: customization.descricao, // description of what to be done
    responsaveis: customization.responsaveis,
    oportunidade: project.oportunidade,
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
