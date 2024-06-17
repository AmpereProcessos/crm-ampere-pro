import { z } from 'zod'
import { ProcessAutomationConditionTypes, ProcessAutomationEntities } from '../process-settings'

export const GeneralProjectTypeProcessSetting = z.object({
  id: z.string(),
  idTipoProjeto: z.string({}),
  idConfiguracaoDependencia: z.string().optional().nullable(),
  referencia: z.object({
    entidade: ProcessAutomationEntities,
  }),
  gatilho: z.object({
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
  }),
  retorno: z.object({
    entidade: ProcessAutomationEntities,
  }),
})

export type TProjectTypeProcessSetting = z.infer<typeof GeneralProjectTypeProcessSetting>
