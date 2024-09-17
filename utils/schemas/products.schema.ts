import { z } from 'zod'
import { PricingMethodologyReferenceSchema, TPricingMethodDTO } from './pricing-method.schema'
import { AuthorSchema } from './user.schema'
import { PaymentMethodReferenceSchema } from './payment-methods'

export const GeneralProductSchema = z.object({
  idParceiro: z
    .string({ required_error: 'ID de referência do parceiro não informado.', invalid_type_error: 'ID de referência do parceiro não informado.' })
    .optional()
    .nullable(),
  idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
  idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
  ativo: z.boolean({
    required_error: 'Status de ativação do serviço não informado.',
    invalid_type_error: 'Tipo não válido para o status de ativação do produto.',
  }),
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR'), z.literal('INSUMO'), z.literal('ESTRUTURA'), z.literal('PADRÃO'), z.literal('OUTROS')]),
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
  preco: z.number({ required_error: 'Valor do produto não informado.', invalid_type_error: 'Tipo não válido para o valor do produto.' }).optional().nullable(),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não fornecida.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})
export const InsertProductSchema = z.object({
  idParceiro: z
    .string({ required_error: 'ID de referência do parceiro não informado.', invalid_type_error: 'ID de referência do parceiro não informado.' })
    .optional()
    .nullable(),
  idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
  idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
  ativo: z.boolean({
    required_error: 'Status de ativação do serviço não informado.',
    invalid_type_error: 'Tipo não válido para o status de ativação do produto.',
  }),
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR'), z.literal('INSUMO'), z.literal('ESTRUTURA'), z.literal('PADRÃO'), z.literal('OUTROS')]),
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
  preco: z.number({ required_error: 'Valor do produto não informado.', invalid_type_error: 'Tipo não válido para o valor do produto.' }).optional().nullable(),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não fornecida.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})
export const ProductSchema = z.object({
  idParceiro: z
    .string({ required_error: 'ID de referência do parceiro não informado.', invalid_type_error: 'ID de referência do parceiro não informado.' })
    .optional()
    .nullable(),
  idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
  idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
  ativo: z.boolean({
    required_error: 'Status de ativação do serviço não informado.',
    invalid_type_error: 'Tipo não válido para o status de ativação do produto.',
  }),
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR'), z.literal('INSUMO'), z.literal('ESTRUTURA'), z.literal('PADRÃO'), z.literal('OUTROS')]),
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
  preco: z.number({ required_error: 'Valor do produto não informado.', invalid_type_error: 'Tipo não válido para o valor do produto.' }).optional().nullable(),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não fornecida.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})

export type TProduct = z.infer<typeof GeneralProductSchema>
export type TProductWithPricingMethod = TProduct & { metodologia: TPricingMethodDTO }

export type TProductDTO = TProduct & { _id: string }

export type TProductDTOWithPricingMethod = TProductDTO & { metodologia: TPricingMethodDTO }
