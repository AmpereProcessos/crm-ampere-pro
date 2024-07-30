import { z } from 'zod'
import { TActivityDTO } from './activities.schema'

export const ResponsiblesBodySchema = z.object({
  responsibles: z
    .array(z.string({ required_error: 'Responsáveis não informados ou inválidos.', invalid_type_error: 'Responsáveis inválidos.' }), {
      required_error: 'Lista de responsáveis não informada.',
      invalid_type_error: 'Tipo não válido para a lista de responsáveis.',
    })
    .nullable(),
  partners: z
    .array(z.string({ required_error: 'Parceiros não informados ou inválidos.', invalid_type_error: 'Parceiros inválidos.' }), {
      required_error: 'Lista de parceiros não informada.',
      invalid_type_error: 'Tipo não válido para a lista de parceiros.',
    })
    .nullable(),
})
export const QueryDatesSchema = z.object({
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
export const GeneralStatsFiltersSchema = z.object({
  responsibles: z
    .array(z.string({ required_error: 'Responsáveis não informados ou inválidos.', invalid_type_error: 'Responsáveis inválidos.' }), {
      required_error: 'Lista de responsáveis não informada.',
      invalid_type_error: 'Tipo não válido para a lista de responsáveis.',
    })
    .nullable(),
  partners: z
    .array(z.string({ required_error: 'Parceiros não informados ou inválidos.', invalid_type_error: 'Parceiros inválidos.' }), {
      required_error: 'Lista de parceiros não informada.',
      invalid_type_error: 'Tipo não válido para a lista de parceiros.',
    })
    .nullable(),
  projectTypes: z
    .array(z.string({ required_error: 'Tipos de projeto não informados ou inválidos.', invalid_type_error: 'Tipos de projeto inválidos.' }), {
      required_error: 'Lista de tipos de projetos não informada.',
      invalid_type_error: 'Tipo não válido para a lista de tipos de projetos.',
    })
    .nullable(),
})

export type TGeneralStats = {
  simplificado: {
    ANTERIOR: {
      projetosCriados: number
      projetosGanhos: number
      projetosPerdidos: number
      totalVendido: number
      potenciaVendida: number
    }
    ATUAL: {
      projetosCriados: number
      projetosGanhos: number
      projetosPerdidos: number
      totalVendido: number
      potenciaVendida: number
    }
  }
  ganhos: {
    _id: string
    nome: string
    responsaveis: {
      nome: string
      id: string
      papel: string
      avatar_url?: string | null | undefined
      telefone?: string | null | undefined
    }[]
    idMarketing: string | null | undefined
    proposta: {
      _id: string
      nome: string
      valor: number
      potenciaPico: number | null | undefined
    } | null
    dataGanho: string
  }[]
  ganhosPendentes: {
    _id: string
    nome: string
    idMarketing: string | null | undefined
    responsaveis: {
      nome: string
      id: string
      papel: string
      avatar_url?: string | null | undefined
      telefone?: string | null | undefined
    }[]
    proposta: {
      _id: string
      nome: string
      valor: number
      potenciaPico: number | null | undefined
    } | null
    dataSolicitacao: string
  }[]
  atividades: TActivityDTO[]
}
