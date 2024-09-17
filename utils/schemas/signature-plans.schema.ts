import { z } from 'zod'
import { AuthorSchema } from './user.schema'
import { ProductItemSchema, ServiceItemSchema } from './kits.schema'
import { PricingMethodologyReferenceSchema, TPricingMethodDTO } from './pricing-method.schema'
import { PaymentMethodReferenceSchema } from './payment-methods'

export const PlanDescriptiveItemSchema = z.object(
  {
    descricao: z.string({ required_error: 'Item do descritivo não informado.', invalid_type_error: 'Tipo não válido para o item do descritivo do plano.' }),
  },
  {
    required_error: 'Informações do descritivo do plano não informadas.',
    invalid_type_error: 'Tipo não válido para as informações do item de descritivo do plano.',
  }
)

export const PlanIntervalSchema = z.object({
  tipo: z.union([z.literal('DIÁRIO'), z.literal('SEMANAL'), z.literal('MENSAL'), z.literal('SEMESTRAL'), z.literal('ANUAL')]),
  espacamento: z.number().default(1),
})
const GeneralSignaturePlanSchema = z.object({
  ativo: z.boolean({ required_error: 'Status de ativação do plano não informado.', invalid_type_error: 'Tipo não válido para o status de ativação do plano.' }),
  nome: z.string({ description: 'Nome do item de plano comercial.' }),
  idParceiro: z
    .string({ required_error: 'ID de referência do parceiro não informado.', invalid_type_error: 'ID de referência do parceiro não informado.' })
    .optional()
    .nullable(),
  idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
  idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
  descricao: z.string({ description: 'Descrição do plano não informada.', invalid_type_error: 'Tipo não válido para a descrição do plano.' }),
  intervalo: PlanIntervalSchema,
  descritivo: z.array(PlanDescriptiveItemSchema, {
    required_error: 'Lista do descritivo do plano não informada.',
    invalid_type_error: 'Tipo não válido para a lista do descritivo do plano.',
  }),
  produtos: z.array(ProductItemSchema),
  servicos: z.array(ServiceItemSchema),
  preco: z.number({ required_error: 'Valor fixo do plano não informado.', invalid_type_error: 'Tipo não válido para o valor fixo do plano.' }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para data de inserção.' }),
})

export const InsertSignaturePlanSchema = z.object({
  ativo: z.boolean({ required_error: 'Status de ativação do plano não informado.', invalid_type_error: 'Tipo não válido para o status de ativação do plano.' }),
  nome: z.string({ description: 'Nome do item de plano comercial.' }),
  idParceiro: z
    .string({ required_error: 'ID de referência do parceiro não informado.', invalid_type_error: 'ID de referência do parceiro não informado.' })
    .optional()
    .nullable(),
  idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
  idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
  descricao: z.string({ description: 'Descrição do plano não informada.', invalid_type_error: 'Tipo não válido para a descrição do plano.' }),
  intervalo: PlanIntervalSchema,
  descritivo: z.array(PlanDescriptiveItemSchema, {
    required_error: 'Lista do descritivo do plano não informada.',
    invalid_type_error: 'Tipo não válido para a lista do descritivo do plano.',
  }),
  produtos: z.array(ProductItemSchema),
  servicos: z.array(ServiceItemSchema),
  preco: z.number({ required_error: 'Valor fixo do plano não informado.', invalid_type_error: 'Tipo não válido para o valor fixo do plano.' }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para data de inserção.' }),
})

export type TSignaturePlan = z.infer<typeof GeneralSignaturePlanSchema>
export type TSignaturePlanWithPricingMethod = TSignaturePlan & { metodologia: TPricingMethodDTO }

export type TSignaturePlanDTO = TSignaturePlan & { _id: string }
export type TSignaturePlanDTOWithPricingMethod = TSignaturePlanDTO & { metodologia: TPricingMethodDTO }
