import { z } from 'zod'
import { ProcessAutomationConditionTypes, ProcessAutomationEntities } from '../process-settings'

const ProcessFlowTrigger = z.object({
  tipo: ProcessAutomationConditionTypes,
  variavel: z.string(),
  igual: z
    .string({
      required_error: 'Valor de comparação de igualdade da condição não informado.',
      invalid_type_error: 'Tipo não válido para o valor de comparação de igualdade da condição.',
    })
    .optional()
    .nullable(),
  maiorQue: z
    .number({
      required_error: 'Valor de comparação de maior que não informado.',
      invalid_type_error: 'Tipo não válido para valor de comparação de maior que.',
    })
    .optional()
    .nullable(),
  menorQue: z
    .number({
      required_error: 'Valor de comparação de menor que não informado.',
      invalid_type_error: 'Tipo não válido para valor de comparação de menor que.',
    })
    .optional()
    .nullable(),
  entre: z
    .object({
      minimo: z.number({
        required_error: 'Valor mínimo do intervalo de comparação númerico não informado.',
        invalid_type_error: 'Tipo não válido para o valor mínimo do invervalo de comparação númerico.',
      }),
      maximo: z.number({
        required_error: 'Valor máximo do intervalo de comparação númerico não informado.',
        invalid_type_error: 'Tipo não válido para o valor máximo do invervalo de comparação númerico.',
      }),
    })
    .optional()
    .nullable(),
  inclui: z
    .array(
      z.string({
        required_error: 'Texto de comparação da lista de opções da condição não informado.',
        invalid_type_error: 'Tipo não válido para texto de comparação da lista de opções da condição.',
      }),
      { required_error: 'Lista de opções de comparação não informada.', invalid_type_error: 'Tipo não válido para lista de opções de comparação.' }
    )
    .optional()
    .nullable(),
})
export type TProcessFlowTrigger = z.infer<typeof ProcessFlowTrigger>
const GeneralProcessFlowReferenceSchema = z.object({
  idProjeto: z.string({
    required_error: 'ID de referência do projeto não informado.',
    invalid_type_error: 'Tipo não válido para o ID de referência do projeto.',
  }),
  idProcesso: z.string({ invalid_type_error: 'Tipo não válido para o ID do processo.' }),
  idProcessoPai: z.string({ invalid_type_error: 'Tipo não válido para a referência de processo pai.' }).optional().nullable(),
  idProcessoReferenciaPai: z.string({ invalid_type_error: 'Tipo não válido para a referência de processo pai.' }).optional().nullable(),
  referencia: z.object({
    entidade: ProcessAutomationEntities,
    id: z
      .string({ required_error: 'ID da entidade de referência não informado.', invalid_type_error: 'Tipo não válido para o ID da entidade de referência.' })
      .optional()
      .nullable(),
  }),
  gatilho: ProcessFlowTrigger,
  retorno: z.object({
    entidade: ProcessAutomationEntities.optional().nullable(),
    id: z
      .string({ required_error: 'ID da entidade de retorno não informado.', invalid_type_error: 'Tipo não válido para o ID da entidade de retorno.' })
      .optional()
      .nullable(),
    customizacao: z.record(z.any()),
  }),
  canvas: z.object({
    id: z.string({ required_error: 'ID de referência do canvas.', invalid_type_error: 'Tipo inválido para o ID do canvas.' }).optional().nullable(),
    posX: z
      .number({
        required_error: 'Coordenada da posição X do processo no canvas não informada.',
        invalid_type_error: 'Tipo não válido para a coordenada da posição X no canvas.',
      })
      .optional()
      .nullable(),
    posY: z
      .number({
        required_error: 'Coordenada da posição Y do processo no canvas não informada.',
        invalid_type_error: 'Tipo não válido para a coordenada da posição Y no canvas.',
      })
      .optional()
      .nullable(),
  }),
  dataExecucao: z.string({ invalid_type_error: 'Tipo não válido para a data de execução da automação de processo.' }).optional().nullable(),
  dataInsercao: z.string({
    required_error: 'Data de inserção da referência de automação de processo não informada.',
    invalid_type_error: 'Tipo não válido para a data de inserção  referência de automação de processo',
  }),
})

export type TProcessFlowReference = z.infer<typeof GeneralProcessFlowReferenceSchema>
export type TProcessFlowReferenceDTO = TProcessFlowReference & { _id: string }
