import { z } from 'zod'
import { AuthorSchema } from '../user.schema'

const EquipmentSchema = z.object({
  identificador: z.literal('EQUIPMENT'),
  idMaterial: z.string({
    required_error: "ID do material não informado.",
    invalid_type_error: 'Tipo não válido para o ID do material.',
  }).optional().nullable(),
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR')]),
  fabricante: z.string({
    required_error: 'Fabricante do produto não informado.',
    invalid_type_error: 'Tipo não válido para o fabricante do produto.',
  }),
  modelo: z.string({ required_error: 'Modelo do produto não informado.', invalid_type_error: 'Tipo não válido para o modelo do produto.' }),
  potencia: z
    .number({ required_error: 'Potência do produto não informada.', invalid_type_error: 'Tipo não válido para a potência do produto.' })
    .optional()
    .nullable(),
  garantia: z.number({ required_error: 'Garantia do produto não informada.', invalid_type_error: 'Tipo não válido para a garantia do produto.' }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para data de inserção.' }),
})
export type TEquipment = z.infer<typeof EquipmentSchema>
export type TEquipmentDTO = TEquipment & { _id: string }

const CreditorSchema = z.object({
  identificador: z.literal('CREDITOR'),
  valor: z.string({ required_error: 'Nome do credor não informado.', invalid_type_error: 'Tipo não válido para o nome do credor.' }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para data de inserção.' }),
})

export type TCreditor = z.infer<typeof CreditorSchema>
export type TCreditorDTO = TCreditor & { _id: string }
