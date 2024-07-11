import { getDateFromString } from '@/lib/methods/dates'
import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import {
  CommissioningProcessesIds,
  ContractProcessesIds,
  ExecutionProcessesIds,
  HomologationProcessesIds,
  ProcessTrackedByProjectType,
  SupplyProcessesIds,
} from '@/utils/process-tracking'
import { AppProjectResultsSimplifiedProjection, TAppProject } from '@/utils/schemas/integrations/app-ampere/projects.schema'
import { Collection, Filter, WithId } from 'mongodb'
import { NextApiHandler } from 'next'

export type TFollowUpProject = TSimplifiedProjectResult & {
  processos: {
    concluido: boolean
    data: string | null
    processo: string
  }[]
}

function getContractValue({ system, pa, structure }: { system: number | string; pa: number | string; structure: number | string }) {
  const projeto = !isNaN(Number(system)) ? Number(system) : 0
  const padrao = !isNaN(Number(pa)) ? Number(pa) : 0
  const estrutura = !isNaN(Number(structure)) ? Number(structure) : 0

  return projeto + padrao + estrutura
}

type GetResponse = {
  data: TFollowUpProject[]
}
const getProjectsFollowUp: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI)
  const collection: Collection<TAppProject> = db.collection('dados')

  const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope] } } : {}
  // const nonConclusionQuery: Filter<TAppProject> = {
  //   $and: [
  //     { 'contrato.dataAssinatura': { $ne: null } },
  //     { 'homologacao.dataEfetivacao': { $ne: null } },
  //     { 'compra.status': { $ne: 'CONCLUIDA' } },
  //     { 'obra.status': { $ne: 'CONCLUIDA' } },
  //   ],
  // }

  const query = { ...partnerQuery }

  const projects = await getSimplifiedProjects({ collection, query })

  const result: TFollowUpProject[] = projects
    .map((project) => {
      var acc: { [key: string]: { concluido: boolean; data: string | null } } = {}
      const projectType = project.tipo
      const ProjectTypeProcesses = ProcessTrackedByProjectType[projectType as keyof typeof ProcessTrackedByProjectType] || []

      if (ProjectTypeProcesses.some((p) => ContractProcessesIds.includes(p))) {
        const contractLiberationDate = getDateFromString(project.contrato.dataLiberacao)
        const contractSignatureDate = getDateFromString(project.contrato.dataAssinatura)

        if (ProjectTypeProcesses.includes('contract_formulation')) {
          if (!acc['FORMULAÇÃO DE CONTRATO']) acc['FORMULAÇÃO DE CONTRATO'] = { concluido: false, data: null }
          const isFormulated = !!contractLiberationDate
          if (isFormulated) acc['FORMULAÇÃO DE CONTRATO'] = { concluido: true, data: contractLiberationDate.toISOString() }
        }

        if (ProjectTypeProcesses.includes('contract_signature_collection')) {
          if (!acc['COLETA DE ASSINATURA DO CONTRATO']) acc['COLETA DE ASSINATURA DO CONTRATO'] = { concluido: false, data: null }
          const isSigned = !!contractSignatureDate
          if (isSigned) acc['COLETA DE ASSINATURA DO CONTRATO'] = { concluido: true, data: contractSignatureDate.toISOString() }
        }
      }
      if (ProjectTypeProcesses.some((p) => HomologationProcessesIds.includes(p))) {
        const homologationConcluded = project.homologacao.concluido
        const homologationElaborationStartDate = getDateFromString(project.homologacao.dataInicioElaboracao)
        const homologationElaborationEndDate = getDateFromString(project.homologacao.dataConclusaoElaboracao)
        const homologationAccessRequestDate = getDateFromString(project.homologacao.dataSolicitacaoAcesso)
        const homologationAccessResponseDate = getDateFromString(project.homologacao.dataRespostaAcesso)

        if (ProjectTypeProcesses.includes('homologation_initiation')) {
          if (!acc['INICIAÇÃO DE PROJETO']) acc['INICIAÇÃO DE PROJETO'] = { concluido: false, data: null }
          const isHomologationInitiated = !!homologationConcluded || !!homologationElaborationStartDate
          if (isHomologationInitiated) acc['INICIAÇÃO DE PROJETO'] = { concluido: true, data: homologationElaborationStartDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('homologation_documents_elaboration')) {
          if (!acc['ELABORAÇÃO DA DOCUMENTAÇÃO']) acc['ELABORAÇÃO DA DOCUMENTAÇÃO'] = { concluido: false, data: null }
          const isHomologationElaborated = !!homologationConcluded || !!homologationElaborationEndDate
          if (isHomologationElaborated) acc['ELABORAÇÃO DA DOCUMENTAÇÃO'] = { concluido: true, data: homologationElaborationEndDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('homologation_access_request')) {
          if (!acc['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA']) acc['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'] = { concluido: false, data: null }
          const isHomologationAccessRequested = !!homologationConcluded || !!homologationAccessRequestDate
          if (isHomologationAccessRequested)
            acc['SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA'] = { concluido: true, data: homologationAccessRequestDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('homologation_access_approval')) {
          if (!acc['APROVAÇÃO DA CONCESSIONÁRIA']) acc['APROVAÇÃO DA CONCESSIONÁRIA'] = { concluido: false, data: null }
          const isHomologationApproved = !!homologationConcluded || !!homologationAccessResponseDate
          if (isHomologationApproved) acc['APROVAÇÃO DA CONCESSIONÁRIA'] = { concluido: true, data: homologationAccessResponseDate?.toISOString() || '-' }
        }
      }
      if (ProjectTypeProcesses.some((p) => SupplyProcessesIds.includes(p))) {
        const supplyConcluded = project.compra.concluido

        const supplyLiberationDate = getDateFromString(project.compra.dataLiberacao)
        const supplyOrderDate = getDateFromString(project.compra.dataPedido)
        const supplyDeliveryDate = getDateFromString(project.compra.dataEntrega)

        if (ProjectTypeProcesses.includes('supplementation_release')) {
          if (!acc['LIBERAÇÃO PARA COMPRA']) acc['LIBERAÇÃO PARA COMPRA'] = { concluido: false, data: null }
          const isSupplyReleased = !!supplyConcluded || !!supplyLiberationDate
          if (isSupplyReleased) acc['LIBERAÇÃO PARA COMPRA'] = { concluido: true, data: supplyLiberationDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('supplementation_order')) {
          if (!acc['COMPRA DE PRODUTOS']) acc['COMPRA DE PRODUTOS'] = { concluido: false, data: null }
          const isInSupplyOrdered = !!supplyConcluded || !!supplyOrderDate
          if (isInSupplyOrdered) acc['COMPRA DE PRODUTOS'] = { concluido: true, data: supplyOrderDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('supplementation_delivery')) {
          if (!acc['ENTREGA DE PRODUTOS']) acc['ENTREGA DE PRODUTOS'] = { concluido: false, data: null }
          const inSupplyDelivered = !!supplyConcluded || !!supplyDeliveryDate
          if (inSupplyDelivered) acc['ENTREGA DE PRODUTOS'] = { concluido: true, data: supplyDeliveryDate?.toISOString() || '-' }
        }
      }
      if (ProjectTypeProcesses.some((p) => ExecutionProcessesIds.includes(p))) {
        const executionConcluded = project.execucao.concluido

        const executionStartDate = getDateFromString(project.execucao.inicio)
        const executionEndDate = getDateFromString(project.execucao.fim)

        if (ProjectTypeProcesses.includes('execution_planning_post_delivery')) {
          if (!acc['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO']) acc['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'] = { concluido: false, data: null }

          const isExecutionStarted = !!executionConcluded || !!executionStartDate
          if (isExecutionStarted) acc['PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO'] = { concluido: true, data: executionStartDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('execution_planning_post_contract')) {
          if (!acc['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO']) acc['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'] = { concluido: false, data: null }

          const isExecutionStarted = !!executionConcluded || !!executionStartDate
          if (isExecutionStarted) acc['PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO'] = { concluido: true, data: executionStartDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('execution')) {
          if (!acc['EXECUÇÃO']) acc['EXECUÇÃO'] = { concluido: false, data: null }

          const isExecuted = !!executionConcluded || !!executionEndDate
          if (isExecuted) acc['EXECUÇÃO'] = { concluido: true, data: executionEndDate?.toISOString() || '-' }
        }
      }
      if (ProjectTypeProcesses.some((p) => CommissioningProcessesIds.includes(p))) {
        const homologationConcluded = project.homologacao.concluido

        const homologationVistoryRequestDate = getDateFromString(project.homologacao.dataSolicitacaoVistoria)
        const homologationVistoryApprovalDate = getDateFromString(project.homologacao.dataEfetivacaoVistoria)
        if (ProjectTypeProcesses.includes('homologation_vistory_request')) {
          if (!acc['SOLICITAÇÃO DE VISTORIA']) acc['SOLICITAÇÃO DE VISTORIA'] = { concluido: false, data: null }
          const isHomologationVistoryRequested = !!homologationConcluded || !!homologationVistoryRequestDate
          if (isHomologationVistoryRequested) acc['SOLICITAÇÃO DE VISTORIA'] = { concluido: true, data: homologationVistoryRequestDate?.toISOString() || '-' }
        }
        if (ProjectTypeProcesses.includes('homologation_vistory_approval')) {
          if (!acc['APROVAÇÃO DA VISTORIA']) acc['APROVAÇÃO DA VISTORIA'] = { concluido: false, data: null }
          const isHomologationVistoryApproved = !!homologationConcluded || !!homologationVistoryApprovalDate
          if (isHomologationVistoryApproved) acc['APROVAÇÃO DA VISTORIA'] = { concluido: true, data: homologationVistoryApprovalDate?.toISOString() || '-' }
        }
      }
      const processes = Object.entries(acc).map(([key, value]) => ({ processo: key, ...value }))
      return { ...project, processos: processes }
    })
    .filter((p) => !p.processos.every((process) => !!process.concluido))

  return res.status(200).json({ data: result })
}
export default apiHandler({ GET: getProjectsFollowUp })
type TSimplifiedProjectResult = {
  id: string
  indexador: number
  nome: string
  identificador: string | number
  tipo: TAppProject['tipoDeServico']
  cidade: TAppProject['cidade']
  idParceiro: TAppProject['idParceiro']
  idProjetoCRM: TAppProject['idProjetoCRM']
  potenciaPico: TAppProject['sistema']['potPico']
  valor: number
  contrato: {
    dataLiberacao: TAppProject['contrato']['dataLiberacao']
    dataSolicitacao: TAppProject['contrato']['dataSolicitacao']
    dataAssinatura: TAppProject['contrato']['dataAssinatura']
  }
  homologacao: {
    concluido: boolean
    dataLiberacao: TAppProject['homologacao']['dataLiberacao']
    dataInicioElaboracao: TAppProject['homologacao']['documentacao']['dataInicioElaboracao']
    dataConclusaoElaboracao: TAppProject['homologacao']['documentacao']['dataConclusaoElaboracao']
    dataSolicitacaoAcesso: TAppProject['homologacao']['acesso']['dataSolicitacao']
    dataRespostaAcesso: TAppProject['homologacao']['acesso']['dataResposta']
    dataSolicitacaoVistoria: TAppProject['homologacao']['vistoria']['dataSolicitacao']
    dataEfetivacaoVistoria: TAppProject['homologacao']['vistoria']['dataEfetivacao']
  }
  compra: {
    concluido: boolean
    dataLiberacao: TAppProject['compra']['dataLiberacao']
    dataPedido: TAppProject['compra']['dataPedido']
    dataEntrega: TAppProject['compra']['dataEntrega']
  }
  execucao: {
    concluido: boolean
    inicio: TAppProject['obra']['entrada']
    fim: TAppProject['obra']['saida']
  }
}

type GetSimplifiedProjectsProps = {
  collection: Collection<TAppProject>
  query: Filter<TAppProject>
}
async function getSimplifiedProjects({ collection, query }: GetSimplifiedProjectsProps) {
  try {
    const sort = { qtde: 1 }
    const match = { 'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' }, ...query }
    // console.log(JSON.stringify(match))
    const projection = AppProjectResultsSimplifiedProjection

    const result = await collection.find({ ...match }, { projection: projection, sort: { qtde: 1 } }).toArray()
    const projects: TSimplifiedProjectResult[] = result.map((project) => {
      const info = project as WithId<TAppProject>
      return {
        id: info._id.toString(),
        indexador: info.qtde,
        nome: info.nomeDoContrato,
        identificador: info.codigoSVB,
        tipo: info.tipoDeServico,
        cidade: info.cidade,
        idParceiro: info.idParceiro,
        idProjetoCRM: info.idProjetoCRM,
        potenciaPico: info.sistema.potPico,
        valor: getContractValue({ system: info.sistema.valorProjeto || 0, pa: info.padrao.valor || 0, structure: info.estruturaPersonalizada.valor || 0 }),
        contrato: {
          dataSolicitacao: info.contrato.dataSolicitacao,
          dataLiberacao: info.contrato.dataLiberacao,
          dataAssinatura: info.contrato.dataAssinatura,
        },
        homologacao: {
          concluido: !!info.homologacao.dataEfetivacao,
          dataLiberacao: info.homologacao.dataLiberacao,
          dataInicioElaboracao: info.homologacao.documentacao.dataInicioElaboracao,
          dataConclusaoElaboracao: info.homologacao.documentacao.dataConclusaoElaboracao,
          dataSolicitacaoAcesso: info.homologacao.acesso.dataSolicitacao,
          dataRespostaAcesso: info.homologacao.acesso.dataResposta,
          dataSolicitacaoVistoria: info.homologacao.vistoria.dataSolicitacao,
          dataEfetivacaoVistoria: info.homologacao.vistoria.dataEfetivacao,
        },
        compra: {
          concluido: info.compra.status == 'CONCLUIDA',
          dataLiberacao: info.compra.dataLiberacao,
          dataPedido: info.compra.dataPedido,
          dataEntrega: info.compra.dataEntrega,
        },
        execucao: {
          concluido: info.obra.statusDaObra == 'CONCLUIDA',
          inicio: info.obra.entrada,
          fim: info.obra.saida,
        },
      }
    })

    return projects
  } catch (error) {
    throw error
  }
}
