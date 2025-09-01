import z from 'zod';

export const GetLeadsStatsInputSchema = z.object({
  periodAfter: z
    .string({
      required_error: 'Data de início do período não informada.',
      invalid_type_error: 'Tipo não válido para a data de início do período.',
    })
    .datetime({ message: 'Tipo inválido para a data de início do período.' }),
  periodBefore: z
    .string({
      required_error: 'Data de fim do período não informada.',
      invalid_type_error: 'Tipo não válido para a data de fim do período.',
    })
    .datetime({ message: 'Tipo inválido para a data de fim do período.' }),
  qualifiersIds: z
    .string({
      required_error: 'IDs dos qualificadores não informados.',
      invalid_type_error: 'Tipo não válido para os IDs dos qualificadores.',
    })
    .transform((qualifiersIds) => qualifiersIds.split(',').filter((id) => id.trim().length > 0)),
});
