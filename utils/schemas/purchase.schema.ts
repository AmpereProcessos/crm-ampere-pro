import { z } from 'zod'

const PurchaseProjectReference = z.object({
  id: z.string({ required_error: 'ID do projeto não informado.', invalid_type_error: 'Tipo não válido para o ID do projeto.' }).optional().nullable(),
  nome: z.string({ required_error: 'Nome do projeto não informado.', invalid_type_error: 'Tipo não válido para o nome do projeto.' }).optional().nullable(),
  tipo: z.string({ required_error: 'Tipo do projeto não informado.', invalid_type_error: 'Tipo não válido para o tipo do projeto.' }),
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
  unidade: z.string({
    required_error: 'Unidade do item de compra não fornecida.',
    invalid_type_error: 'Tipo não válido para a unidade do item de compra.',
  }),
  valor: z.number({
    required_error: 'Valor do item unitário de compra não fornecido.',
    invalid_type_error: 'Tipo não válido para o valor do item unitário de compra.',
  }),
  qtde: z.number({
    required_error: 'Quantidade do item de compra não fornecida.',
    invalid_type_error: 'Tipo não válido para a quantidade do item de compra.',
  }),
})

const PurchaseInvoicing = z.object(
  {
    data: z
      .string({ invalid_type_error: 'Tipo não válido para a data de faturamento da compra.' })
      .datetime({ message: 'Formato inválido para data de faturamento da compra.' })
      .optional()
      .nullable(),
    codigoNotaFiscal: z.string({ required_error: 'Código da NF não informado.', invalid_type_error: 'Tipo não válido para o código da NF.' }),
  },
  { required_error: 'Informações de faturamento da compra não informadas.', invalid_type_error: 'Tipo não válido para informações de faturamento da compra.' }
)

const GeneralPurchaseSchema = z.object({
  titulo: z.string({ required_error: 'Título do registro de compra não informado.', invalid_type_error: 'Tipo não válido para o título da compra.' }),
  projeto: PurchaseProjectReference,
  composicao: z.array(PurchaseCompositionItem, {
    required_error: 'Lista dos itens de composição da compra não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da compra.',
  }),
  total: z
    .number({ required_error: 'Total da compra não informado.', invalid_type_error: 'Tipo não válido para o valor total da compra.' })
    .min(0, 'Valor total de compra inválido.'),
  fornecedor: z.object({
    nome: z.string({ required_error: 'Nome do fornecedor não informado.', invalid_type_error: 'Tipo não válido para o nome do fornecedor.' }),
    contato: z.string({ required_error: 'Contato do fornecedor não informado.', invalid_type_error: 'Tipo não válido para o contato do fornecedor.' }),
  }),
  linkRastreio: z
    .string({ required_error: 'Link de rastreio da compra não informado.', invalid_type_error: 'Tipo não válido para o link de rastreio da compra.' })
    .optional()
    .nullable(),
  dataLiberacao: z
    .string({ invalid_type_error: 'Tipo não válido para data de liberação para compra.' })
    .datetime({ message: 'Formato inválido para data de liberação da compra.' })
    .optional()
    .nullable(),
  dataPedido: z
    .string({ invalid_type_error: 'Tipo não válido para a data de pedido.' })
    .datetime({ message: 'Formato inválido para data de pedido.' })
    .optional()
    .nullable(),
  faturamento: PurchaseInvoicing,
  entrega: z.object({
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
  }),
  dataInsercao: z.string({ invalid_type_error: 'Tipo não válido para a data de inserção.' }).datetime({ message: 'Formato inválido para data de inserção.' }),
})

export const InsertPurchaseSchema = z.object({
  titulo: z.string({ required_error: 'Título do registro de compra não informado.', invalid_type_error: 'Tipo não válido para o título da compra.' }),
  projeto: PurchaseProjectReference,
  composicao: z.array(PurchaseCompositionItem, {
    required_error: 'Lista dos itens de composição da compra não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da compra.',
  }),
  total: z
    .number({ required_error: 'Total da compra não informado.', invalid_type_error: 'Tipo não válido para o valor total da compra.' })
    .min(0, 'Valor total de compra inválido.'),
  fornecedor: z.object({
    nome: z.string({ required_error: 'Nome do fornecedor não informado.', invalid_type_error: 'Tipo não válido para o nome do fornecedor.' }),
    contato: z.string({ required_error: 'Contato do fornecedor não informado.', invalid_type_error: 'Tipo não válido para o contato do fornecedor.' }),
  }),
  linkRastreio: z
    .string({ required_error: 'Link de rastreio da compra não informado.', invalid_type_error: 'Tipo não válido para o link de rastreio da compra.' })
    .optional()
    .nullable(),
  dataLiberacao: z
    .string({ invalid_type_error: 'Tipo não válido para data de liberação para compra.' })
    .datetime({ message: 'Formato inválido para data de liberação da compra.' })
    .optional()
    .nullable(),
  dataPedido: z
    .string({ invalid_type_error: 'Tipo não válido para a data de pedido.' })
    .datetime({ message: 'Formato inválido para data de pedido.' })
    .optional()
    .nullable(),
  faturamento: PurchaseInvoicing,
  entrega: z.object({
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
  }),
  dataInsercao: z.string({ invalid_type_error: 'Tipo não válido para a data de inserção.' }).datetime({ message: 'Formato inválido para data de inserção.' }),
})

export type TPurchase = z.infer<typeof GeneralPurchaseSchema>

export type TPurchaseDTO = TPurchase & { _id: string }
