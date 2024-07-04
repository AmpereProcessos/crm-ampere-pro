// FIELDS
// qtde
// nome
// identificador
// idCRM
// valor do contrato (sistema, padrão, estrutura)
// potencia pico
// data pedido
// data liberacao do parecer de acesso
// data solicitacao contrato
// data liberacao contrato
// data assinatura contrato
// data liberacao compra
// data de previsao de entrega
// data de entrega
// data entrada na obra
// data saida de obra
// data de assinatura das documentacoes
// data vistoria

// const afterDate = ''
// const beforeDate = ''

// const orQuery: Filter<TAppProject> = {
//   $or: [
//     { $and: [{ 'contrato.dataLiberacao': { $gte: afterDate } }, { 'contrato.dataLiberacao': { $lte: beforeDate } }] },
//     { $and: [{ 'contrato.dataAssinatura': { $gte: afterDate } }, { 'contrato.dataAssinatura': { $lte: beforeDate } }] },
//     { $and: [{ 'compra.dataLiberacao': { $gte: afterDate } }, { 'compra.dataLiberacao': { $lte: beforeDate } }] },
//     { $and: [{ 'compra.dataPedido': { $gte: afterDate } }, { 'compra.dataPedido': { $lte: beforeDate } }] },
//     { $and: [{ 'compra.dataEntrega': { $gte: afterDate } }, { 'compra.dataEntrega': { $lte: beforeDate } }] },
//     { $and: [{ 'parecer.dataParecerDeAcesso': { $gte: afterDate } }, { 'parecer.dataParecerDeAcesso': { $lte: beforeDate } }] },
//     { $and: [{ 'obra.entrada': { $gte: afterDate } }, { 'obra.entrada': { $lte: beforeDate } }] },
//     { $and: [{ 'obra.saida': { $gte: afterDate } }, { 'obra.saida': { $lte: beforeDate } }] },
//   ],
// }

import { getHoursDiff } from '@/lib/methods/dates'
import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection'
import { apiHandler, validateAuthorization } from '@/utils/api'
import { AppProjectResultsSimplifiedProjection, TAppProject } from '@/utils/schemas/integrations/app-ampere/projects.schema'
import dayjs from 'dayjs'
import { Collection, Filter, WithId } from 'mongodb'
import { NextApiHandler } from 'next'
import { z } from 'zod'

function getContractValue({ system, pa, structure }: { system: number | string; pa: number | string; structure: number | string }) {
  var totalSum = 0

  const projeto = !isNaN(Number(system)) ? Number(system) : 0
  const padrao = !isNaN(Number(pa)) ? Number(pa) : 0
  const estrutura = !isNaN(Number(structure)) ? Number(structure) : 0

  return projeto + padrao + estrutura
}

export type TOperationProjectsResults = {
  projetosVendidos: number
  valorVendido: number
  potenciaVendida: number
  contratosElaborados: {
    qtde: number
    tempoTotal: number
    tempoMedio: number
  }
  homologacoes: {
    qtde: number
    tempoTotal: number
    tempoMedio: number
  }
  liberacaoCompras: {
    qtde: number
    tempoTotal: number
    tempoMedio: number
  }
  pedidos: {
    qtde: number
    tempoTotal: number
    tempoMedio: number
  }
  entregas: {
    qtde: number
    tempoTotal: number
    tempoMedio: number
  }
  execucao: {
    qtde: number
    tempoTotal: number
    tempoMedio: number
  }
}

type TOperationProjectsReduced = {
  projetosVendidos: number
  valorVendido: number
  potenciaVendida: number
  contratosElaborados: {
    qtde: number
    tempoTotal: number
  }
  homologacoes: {
    qtde: number
    tempoTotal: number
  }
  liberacaoCompras: {
    qtde: number
    tempoTotal: number
  }
  pedidos: {
    qtde: number
    tempoTotal: number
  }
  entregas: {
    qtde: number
    tempoTotal: number
  }
  execucao: {
    qtde: number
    tempoTotal: number
  }
}
const initialReduceInfo: TOperationProjectsReduced = {
  projetosVendidos: 0,
  valorVendido: 0,
  potenciaVendida: 0,
  contratosElaborados: {
    qtde: 0,
    tempoTotal: 0,
  },
  homologacoes: {
    qtde: 0,
    tempoTotal: 0,
  },
  liberacaoCompras: {
    qtde: 0,
    tempoTotal: 0,
  },
  pedidos: {
    qtde: 0,
    tempoTotal: 0,
  },
  entregas: {
    qtde: 0,
    tempoTotal: 0,
  },
  execucao: {
    qtde: 0,
    tempoTotal: 0,
  },
}

type PostResponse = any

const QueryDatesSchema = z.object({
  after: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
  before: z
    .string({
      required_error: 'Parâmetros de período não fornecidos ou inválidos.',
      invalid_type_error: 'Parâmetros de período não fornecidos ou inválidos.',
    })
    .datetime({ message: 'Tipo inválido para parâmetro de período.' }),
})
const getGeneralOperationDataRoute: NextApiHandler<PostResponse> = async (req, res) => {
  const session = await validateAuthorization(req, res, 'resultados', 'visualizarOperacional', true)
  const partnerId = session.user.idParceiro
  const partnerScope = session.user.permissoes.parceiros.escopo
  const { after, before } = QueryDatesSchema.parse(req.query)

  const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI)
  const collection: Collection<TAppProject> = db.collection('dados')
  const afterDate = dayjs(after).startOf('day').subtract(3, 'hour').toDate()
  const beforeDate = dayjs(before).endOf('day').subtract(3, 'hour').toDate()

  const afterDateStr = afterDate.toISOString()
  const beforeDateStr = beforeDate.toISOString()
  const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope] } } : {}
  const orQuery: Filter<TAppProject> = {
    $or: [
      { $and: [{ 'contrato.dataAssinatura': { $gte: afterDateStr } }, { 'contrato.dataAssinatura': { $lte: beforeDateStr } }] },
      { $and: [{ 'contrato.dataLiberacao': { $gte: afterDateStr } }, { 'contrato.dataLiberacao': { $lte: beforeDateStr } }] },
      { $and: [{ 'compra.dataLiberacao': { $gte: afterDateStr } }, { 'compra.dataLiberacao': { $lte: beforeDateStr } }] },
      { $and: [{ 'compra.dataPedido': { $gte: afterDateStr } }, { 'compra.dataPedido': { $lte: beforeDateStr } }] },
      { $and: [{ 'compra.dataEntrega': { $gte: afterDateStr } }, { 'compra.dataEntrega': { $lte: beforeDateStr } }] },
      { $and: [{ 'parecer.dataParecerDeAcesso': { $gte: afterDateStr } }, { 'parecer.dataParecerDeAcesso': { $lte: beforeDateStr } }] },
      { $and: [{ 'obra.saida': { $gte: afterDateStr } }, { 'obra.saida': { $lte: beforeDateStr } }] },
    ],
  }

  const query = { ...partnerQuery, ...orQuery }

  const projects = await getSimplifiedProjects({ collection, query })
  console.log(projects)
  const reduced = projects.reduce((acc, current) => {
    // Contract related information
    const contractRequestDate = current.contrato.dataSolicitacao ? new Date(current.contrato.dataSolicitacao) : null
    const contractReleasedDate = current.contrato.dataLiberacao ? new Date(current.contrato.dataLiberacao) : null
    const contractSignatureDate = current.contrato.dataAssinatura ? new Date(current.contrato.dataAssinatura) : null

    const wasSignedWithinPeriod = !!contractSignatureDate && contractSignatureDate >= afterDate && contractSignatureDate <= beforeDate
    if (!!wasSignedWithinPeriod) {
      acc.projetosVendidos += 1
      acc.valorVendido += current.valor
      acc.potenciaVendida += current.potenciaPico
    }

    const wasReleasedWithinPeriod = !!contractReleasedDate && contractReleasedDate >= afterDate && contractReleasedDate <= beforeDate
    if (!!wasReleasedWithinPeriod) {
      const contractFormulationTime =
        !!contractRequestDate && !!contractReleasedDate ? getHoursDiff({ start: contractRequestDate, finish: contractReleasedDate }) : 0

      acc.contratosElaborados.qtde += 1
      acc.contratosElaborados.tempoTotal + contractFormulationTime
    }

    // Homologation related information
    const homologationFormulationDate = current.homologacao.dataAssinaturaDocumentacoes ? new Date(current.homologacao.dataAssinaturaDocumentacoes) : null
    const homologationConclusionDate = current.homologacao.dataLiberacaoAcesso ? new Date(current.homologacao.dataLiberacaoAcesso) : null

    const wasHomologatedWithinPeriod = !!homologationConclusionDate && homologationConclusionDate >= afterDate && homologationConclusionDate <= beforeDate
    if (!!wasHomologatedWithinPeriod) {
      const homologationTime =
        !!homologationFormulationDate && !!homologationConclusionDate
          ? getHoursDiff({ start: homologationFormulationDate, finish: homologationConclusionDate })
          : 0

      acc.homologacoes.qtde += 1
      acc.homologacoes.tempoTotal += homologationTime
    }

    // Purchase release order and delivery related information
    const purchaseReleaseDate = current.compra.dataLiberacao ? new Date(current.compra.dataLiberacao) : null
    const purchaseOrderDate = current.compra.dataPedido ? new Date(current.compra.dataPedido) : null
    const purchaseDeliveryDate = current.compra.dataEntrega ? new Date(current.compra.dataEntrega) : null

    const wasReleasedForPurchaseWithinPeriod = !!purchaseReleaseDate && purchaseReleaseDate >= afterDate && purchaseReleaseDate <= beforeDate
    if (!!wasReleasedForPurchaseWithinPeriod) {
      const releaseTime = getHoursDiff({ start: contractSignatureDate as Date, finish: purchaseReleaseDate })

      acc.liberacaoCompras.qtde += 1
      acc.liberacaoCompras.tempoTotal += releaseTime
    }
    const wasOrderedWithinPeriod = !!purchaseOrderDate && purchaseOrderDate >= afterDate && purchaseOrderDate <= beforeDate
    if (!!wasOrderedWithinPeriod) {
      const orderTime = getHoursDiff({ start: contractSignatureDate as Date, finish: purchaseOrderDate })
      acc.pedidos.qtde += 1
      acc.pedidos.tempoTotal += orderTime

      const wasDeliveredWithinPeriod = !!purchaseDeliveryDate && purchaseDeliveryDate >= afterDate && purchaseDeliveryDate <= beforeDate
      if (!!wasDeliveredWithinPeriod) {
        const deliveryTime = getHoursDiff({ start: purchaseOrderDate, finish: purchaseDeliveryDate })
        acc.entregas.qtde += 1
        acc.entregas.tempoTotal += deliveryTime
      }
    }

    // Execution related information
    const executionStartDate = current.execucao.inicio ? new Date(current.execucao.inicio) : null
    const executionEndDate = current.execucao.fim ? new Date(current.execucao.fim) : null

    const wasExecutedWithinPeriod = !!executionStartDate && !!executionEndDate && executionEndDate >= afterDate && executionEndDate <= beforeDate
    if (!!wasExecutedWithinPeriod) {
      const executionTime = getHoursDiff({ start: executionStartDate, finish: executionEndDate })

      acc.execucao.qtde += 1
      acc.execucao.tempoTotal += executionTime
    }
    return acc
  }, initialReduceInfo)

  const result: TOperationProjectsResults = {
    projetosVendidos: reduced.projetosVendidos,
    valorVendido: reduced.valorVendido,
    potenciaVendida: reduced.potenciaVendida,
    contratosElaborados: {
      qtde: reduced.contratosElaborados.qtde,
      tempoTotal: reduced.contratosElaborados.tempoTotal,
      tempoMedio: reduced.contratosElaborados.tempoTotal / reduced.contratosElaborados.tempoTotal,
    },
    homologacoes: {
      qtde: reduced.homologacoes.qtde,
      tempoTotal: reduced.homologacoes.tempoTotal,
      tempoMedio: reduced.homologacoes.tempoTotal / reduced.homologacoes.tempoTotal,
    },
    liberacaoCompras: {
      qtde: reduced.liberacaoCompras.qtde,
      tempoTotal: reduced.liberacaoCompras.tempoTotal,
      tempoMedio: reduced.liberacaoCompras.tempoTotal / reduced.liberacaoCompras.tempoTotal,
    },
    pedidos: {
      qtde: reduced.pedidos.qtde,
      tempoTotal: reduced.pedidos.tempoTotal,
      tempoMedio: reduced.pedidos.tempoTotal / reduced.pedidos.tempoTotal,
    },
    entregas: {
      qtde: reduced.entregas.qtde,
      tempoTotal: reduced.entregas.tempoTotal,
      tempoMedio: reduced.entregas.tempoTotal / reduced.entregas.tempoTotal,
    },
    execucao: {
      qtde: reduced.execucao.qtde,
      tempoTotal: reduced.execucao.tempoTotal,
      tempoMedio: reduced.execucao.tempoTotal / reduced.execucao.tempoTotal,
    },
  }

  return res.status(200).json({ data: result })
}

export default apiHandler({ POST: getGeneralOperationDataRoute })

type TSimplifiedProjectResult = {
  id: string
  indexador: number
  nome: string
  identificador: string | number
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
    dataAssinaturaDocumentacoes: TAppProject['projeto']['dataAssDocumentacao']
    dataLiberacaoAcesso: TAppProject['parecer']['dataParecerDeAcesso']
  }
  compra: {
    dataLiberacao: TAppProject['compra']['dataLiberacao']
    dataPedido: TAppProject['compra']['dataPedido']
    dataEntrega: TAppProject['compra']['dataEntrega']
  }
  execucao: {
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
    const match = { 'contrato.status': { $ne: 'RESCISÃO DE CONTRATO' }, ...query }
    // console.log(JSON.stringify(match))
    const projection = AppProjectResultsSimplifiedProjection

    const result = await collection.find({ ...match }, { projection: projection }).toArray()
    const projects: TSimplifiedProjectResult[] = result.map((project) => {
      const info = project as WithId<TAppProject>
      return {
        id: info._id.toString(),
        indexador: info.qtde,
        nome: info.nomeDoContrato,
        identificador: info.codigoSVB,
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
          dataAssinaturaDocumentacoes: info.projeto.dataAssDocumentacao,
          dataLiberacaoAcesso: info.parecer.dataParecerDeAcesso,
        },
        compra: {
          dataLiberacao: info.compra.dataLiberacao,
          dataPedido: info.compra.dataPedido,
          dataEntrega: info.compra.dataEntrega,
        },
        execucao: {
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
