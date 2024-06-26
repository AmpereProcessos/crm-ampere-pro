import { z } from 'zod'
import { AuthorSchema } from './user.schema'

export const UnitSchema = z.enum(['UN', 'PC', 'KG', 'CX', 'M', 'M²', 'M³', 'L', 'MESA'], {
  required_error: 'Unidade não informado.',
  invalid_type_error: 'Tipo não válido para unidade.',
})

const PurchaseProjectReference = z.object({
  id: z.string({ required_error: 'ID do projeto não informado.', invalid_type_error: 'Tipo não válido para o ID do projeto.' }).optional().nullable(),
  nome: z.string({ required_error: 'Nome do projeto não informado.', invalid_type_error: 'Tipo não válido para o nome do projeto.' }).optional().nullable(),
  tipo: z.string({ required_error: 'Tipo do projeto não informado.', invalid_type_error: 'Tipo não válido para o tipo do projeto.' }).optional().nullable(),
  indexador: z
    .number({ required_error: 'Indexador do projeto não informado.', invalid_type_error: 'Tipo não válido para o indexador do projeto.' })
    .optional()
    .nullable(),
  identificador: z
    .union([
      z.string({
        required_error: 'Identificador do projeto não informado.',
        invalid_type_error: 'Tipo não válido para o identificador do projeto.',
      }),
      z.number({
        required_error: 'Identificador do projeto não informado.',
        invalid_type_error: 'Tipo não válido para o identificador do projeto.',
      }),
    ])
    .optional()
    .nullable(),
})

const PurchaseCompositionItem = z.object({
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR'), z.literal('INSUMO'), z.literal('ESTRUTURA'), z.literal('PADRÃO'), z.literal('OUTROS')]),
  descricao: z.string({
    required_error: 'Descrição do item de compra não informado.',
    invalid_type_error: 'Tipo não válido para a descrição do item de compra.',
  }),
  unidade: UnitSchema,
  valor: z.number({
    required_error: 'Valor do item unitário de compra não fornecido.',
    invalid_type_error: 'Tipo não válido para o valor do item unitário de compra.',
  }),
  qtde: z.number({
    required_error: 'Quantidade do item de compra não fornecida.',
    invalid_type_error: 'Tipo não válido para a quantidade do item de compra.',
  }),
})
export type TPurchaseCompositionItem = z.infer<typeof PurchaseCompositionItem>
const PurchaseInvoicing = z.object(
  {
    data: z
      .string({ invalid_type_error: 'Tipo não válido para a data de faturamento da compra.' })
      .datetime({ message: 'Formato inválido para data de faturamento da compra.' })
      .optional()
      .nullable(),
    codigoNotaFiscal: z
      .string({ required_error: 'Código da NF não informado.', invalid_type_error: 'Tipo não válido para o código da NF.' })
      .optional()
      .nullable(),
  },
  { required_error: 'Informações de faturamento da compra não informadas.', invalid_type_error: 'Tipo não válido para informações de faturamento da compra.' }
)

const PurchaseStatus = z.enum(
  ['AGUARDANDO LIBERAÇÃO', 'AGUARDANDO PAGAMENTO', 'PENDÊNCIA COMERCIAL', 'PENDÊNCIA OPERACIONAL', 'PENDÊNCIA EXTERNA', 'CONCLUÍDA'],
  { required_error: 'Status da compra não informado.', invalid_type_error: 'Tipo não válido para o status da compra.' }
)
export type TPurchaseStatus = z.infer<typeof PurchaseStatus>

const PurchaseLiberation = z.object({
  data: z
    .string({ invalid_type_error: 'Tipo não válido para data de liberação para compra.' })
    .datetime({ message: 'Formato inválido para data de liberação da compra.' })
    .optional()
    .nullable(),
  autor: AuthorSchema.optional().nullable(),
})
const PurchaseOrder = z.object({
  data: z
    .string({ invalid_type_error: 'Tipo não válido para a data de pedido.' })
    .datetime({ message: 'Formato inválido para data de pedido.' })
    .optional()
    .nullable(),
  fornecedor: z.object({
    nome: z.string({ required_error: 'Nome do fornecedor não informado.', invalid_type_error: 'Tipo não válido para o nome do fornecedor.' }),
    contato: z.string({ required_error: 'Contato do fornecedor não informado.', invalid_type_error: 'Tipo não válido para o contato do fornecedor.' }),
  }),
})
const PurchasePorterage = z.object({
  transportadora: z.object({
    nome: z.string({ required_error: 'Nome da transportadora não informado.', invalid_type_error: 'Tipo não válido para o nome da transportadora.' }),
    contato: z.string({ required_error: 'Contato da transportadora não informado.', invalid_type_error: 'Tipo não válido para o contato da transportadora.' }),
  }),
  linkRastreio: z
    .string({ required_error: 'Link de rastreio da compra não informado.', invalid_type_error: 'Tipo não válido para o link de rastreio da compra.' })
    .optional()
    .nullable(),
})

// Delivery
const DeliveryStatus = z.enum(['AGUARDANDO COMPRA', 'EM ROTA', 'ENTREGUE'], {
  required_error: 'Status da entrega não informado.',
  invalid_type_error: 'Tipo não válido para o status de entrega.',
})
const DeliveryLocation = z.object({
  cep: z.string({ invalid_type_error: 'Tipo não válido para o CEP da localização de entrega.' }).optional().nullable(),
  uf: z.string({
    required_error: 'UF de localização de entrega não informada.',
    invalid_type_error: 'Tipo não válido para a UF de localização de entrega.',
  }),
  cidade: z.string({
    required_error: 'Cidade de localização de entrega não informada.',
    invalid_type_error: 'Tipo não válido para a cidade de localização de entrega.',
  }),
  bairro: z.string({ invalid_type_error: 'Tipo não válido para o bairro de localização de entrega.' }).optional().nullable(),
  endereco: z.string({ invalid_type_error: 'Tipo não válido para o endereço de localização de entrega.' }).optional().nullable(),
  numeroOuIdentificador: z.string({ invalid_type_error: 'Tipo não válido para o número ou identificador da localização de entrega.' }).optional().nullable(),
  complemento: z.string({ invalid_type_error: 'Tipo não válido para o complemento da localização de entrega.' }).optional().nullable(),
  latitude: z.string({ invalid_type_error: 'Tipo não válido para latitude da localização de entrega.' }).optional().nullable(),
  longitude: z.string({ invalid_type_error: 'Tipo não válido para longitude da localização de entrega.' }).optional().nullable(),
  // distancia: z.number().optional().nullable(),
})
const PurchaseDelivery = z.object({
  status: DeliveryStatus.optional().nullable(),
  localizacao: DeliveryLocation,
  previsao: z
    .string({ invalid_type_error: 'Tipo não válido para a data de previsão de entrega.' })
    .datetime({ message: 'Formato inválido para data de previsão de entrega.' })
    .optional()
    .nullable(),
  efetivacao: z
    .string({ invalid_type_error: 'Tipo não válido para a data de entrega.' })
    .datetime({ message: 'Formato inválido para data de entrega.' })
    .optional()
    .nullable(),
})
export type TPurchaseDeliveryStatus = z.infer<typeof DeliveryStatus>

const GeneralPurchaseSchema = z.object({
  status: PurchaseStatus.optional().nullable(),
  titulo: z.string({ required_error: 'Título do registro de compra não informado.', invalid_type_error: 'Tipo não válido para o título da compra.' }),
  idParceiro: z.string({
    required_error: 'ID de referência de parceiro não informado.',
    invalid_type_error: 'Tipo não válido para o ID de referência de parceiro.',
  }),
  projeto: PurchaseProjectReference,
  anotacoes: z.string({ required_error: 'Anotações da compra não informadas.', invalid_type_error: 'Tipo não válido para anotações da compra.' }),
  composicao: z.array(PurchaseCompositionItem, {
    required_error: 'Lista dos itens de composição da compra não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da compra.',
  }),
  total: z
    .number({ required_error: 'Total da compra não informado.', invalid_type_error: 'Tipo não válido para o valor total da compra.' })
    .min(0, 'Valor total de compra inválido.'),
  liberacao: PurchaseLiberation,
  pedido: PurchaseOrder,
  transporte: PurchasePorterage,
  faturamento: PurchaseInvoicing,
  entrega: PurchaseDelivery,
  dataInsercao: z.string({ invalid_type_error: 'Tipo não válido para a data de inserção.' }).datetime({ message: 'Formato inválido para data de inserção.' }),
})

export const InsertPurchaseSchema = z.object({
  status: PurchaseStatus.optional().nullable(),
  titulo: z.string({ required_error: 'Título do registro de compra não informado.', invalid_type_error: 'Tipo não válido para o título da compra.' }),
  idParceiro: z.string({
    required_error: 'ID de referência de parceiro não informado.',
    invalid_type_error: 'Tipo não válido para o ID de referência de parceiro.',
  }),
  projeto: PurchaseProjectReference,
  anotacoes: z.string({ required_error: 'Anotações da compra não informadas.', invalid_type_error: 'Tipo não válido para anotações da compra.' }),
  composicao: z.array(PurchaseCompositionItem, {
    required_error: 'Lista dos itens de composição da compra não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da compra.',
  }),
  total: z
    .number({ required_error: 'Total da compra não informado.', invalid_type_error: 'Tipo não válido para o valor total da compra.' })
    .min(0, 'Valor total de compra inválido.'),
  liberacao: PurchaseLiberation,
  pedido: PurchaseOrder,
  transporte: PurchasePorterage,
  faturamento: PurchaseInvoicing,
  entrega: PurchaseDelivery,
  dataInsercao: z.string({ invalid_type_error: 'Tipo não válido para a data de inserção.' }).datetime({ message: 'Formato inválido para data de inserção.' }),
})

export type TPurchase = z.infer<typeof GeneralPurchaseSchema>

export type TPurchaseDTO = TPurchase & { _id: string }
