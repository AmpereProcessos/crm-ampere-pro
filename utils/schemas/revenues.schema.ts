import { z } from 'zod'
import { AuthorSchema } from './user.schema'
import { TProjectDTO } from './project.schema'

const RevenueProjectReference = z.object({
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
const RevenueCompositionItem = z.object({
  idProduto: z
    .string({
      required_error: 'ID de referência de produto não informado.',
      invalid_type_error: 'Tipo não válido para o ID de referência de produto.',
    })
    .optional()
    .nullable(),
  idServico: z
    .string({
      required_error: 'ID de referência de serviço não informado.',
      invalid_type_error: 'Tipo não válido para o ID de referência de serviço.',
    })
    .optional()
    .nullable(),
  descricao: z.string({ required_error: 'Descrição do item de receita não informado.' }),
  unidade: z.string({
    required_error: 'Unidade do item de receita não fornecida.',
    invalid_type_error: 'Tipo não válido para a unidade do item de receita.',
  }),
  valor: z.number({
    required_error: 'Valor do item unitário de receita não fornecido.',
    invalid_type_error: 'Tipo não válido para o valor do item unitário de receita.',
  }),
  qtde: z.number({
    required_error: 'Quantidade do item de receita não fornecida.',
    invalid_type_error: 'Tipo não válido para a quantidade do item de receita.',
  }),
})
const RevenueReceiptItem = z.object({
  porcentagem: z.number({
    required_error: 'Porcentagem do item de recebimento não informada.',
    invalid_type_error: 'Tipo não válido para porcentagem do item de recebimento.',
  }),
  valor: z.number({
    required_error: 'Valor do item de recebimento não informada.',
    invalid_type_error: 'Tipo não válido para valor do item de recebimento.',
  }),
  metodo: z.string({
    required_error: 'Método do item de recebimento não informado.',
    invalid_type_error: 'Tipo não válido para o método do item de recebimento.',
  }),
  dataRecebimento: z
    .string({
      required_error: 'Data de recebimento não informada.',
      invalid_type_error: 'Tipo não válido para a data de recebimento.',
    })
    .datetime()
    .optional()
    .nullable(),
  efetivado: z.boolean({
    required_error: 'Status de efetivação do recebimento não informado.',
    invalid_type_error: 'Tipo não válido para o status de recebimento.',
  }),
})

export const GeneralRevenueSchema = z.object({
  idParceiro: z.string({ invalid_type_error: 'Tipo não válido para referência de parceiro.' }).optional().nullable(),
  titulo: z
    .string({ required_error: 'Título da receita não informada.', invalid_type_error: 'Tipo não válido para o título da receita.' })
    .min(5, 'Preencha um título de ao menos 5 caracteres.'),
  categorias: z.array(z.string({ required_error: 'Categoria da receita não informada.', invalid_type_error: 'Tipo não válido para a categoria da receita.' }), {
    required_error: 'Lista de categorias da receita não informada.',
    invalid_type_error: 'Tipo não válido para a lista de categorias da receita.',
  }),
  projeto: RevenueProjectReference,
  composicao: z.array(RevenueCompositionItem, {
    required_error: 'Lista dos itens de composição da receita não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da receita.',
  }),
  total: z.number({ required_error: 'Total da receita não informado.' }).min(0, 'Valor de receita inválido.'),
  dataCompetencia: z.string({
    required_error: 'Data de competência da receita não informada.',
    invalid_type_error: 'Tipo não válido para a data da receita.',
  }),
  recebimentos: z.array(RevenueReceiptItem),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})
export const InsertRevenueSchema = z.object({
  idParceiro: z.string({ invalid_type_error: 'Tipo não válido para referência de parceiro.' }).optional().nullable(),
  titulo: z
    .string({ required_error: 'Título da receita não informada.', invalid_type_error: 'Tipo não válido para o título da receita.' })
    .min(5, 'Preencha um título de ao menos 5 caracteres.'),
  categorias: z.array(z.string({ required_error: 'Categoria da receita não informada.', invalid_type_error: 'Tipo não válido para a categoria da receita.' }), {
    required_error: 'Lista de categorias da receita não informada.',
    invalid_type_error: 'Tipo não válido para a lista de categorias da receita.',
  }),
  projeto: RevenueProjectReference,
  composicao: z.array(RevenueCompositionItem, {
    required_error: 'Lista dos itens de composição da receita não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da receita.',
  }),
  total: z.number({ required_error: 'Total da receita não informado.' }).min(0, 'Valor de receita inválido.'),
  dataCompetencia: z.string({
    required_error: 'Data de competência da receita não informada.',
    invalid_type_error: 'Tipo não válido para a data da receita.',
  }),
  recebimentos: z.array(RevenueReceiptItem, {
    required_error: 'Lista de recebimentos não informados.',
    invalid_type_error: 'Tipo não válido para a lista de recebimentos.',
  }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})
export type TRevenue = z.infer<typeof GeneralRevenueSchema>
export type TRevenueWithProject = TRevenue & { projetoDados: TProjectDTO }

export type TRevenueDTO = TRevenue & { _id: string }
export type TRevenueWithProjectDTO = TRevenueWithProject & { _id: string }

const PersonalizedFieldFilters = z.enum(['dataInsercao', 'dataCompetencia', 'recebimentos.dataRecebimento'], {
  required_error: 'Filtro de campo de período não informado.',
  invalid_type_error: 'Tipo não válido para o campo de filtro de período.',
})

const PersonalizedRevenueFiltersSchema = z.object({
  title: z.string({ required_error: 'Filtro de título de receita não informado.', invalid_type_error: 'Tipo não válido para o filtro de título de receita.' }),
  category: z.string({
    required_error: 'Filtro de categoria de receita não informado.',
    invalid_type_error: 'Tipo não válido para o filtro de categoria de receita.',
  }),
  total: z.object({
    greater: z.number({ invalid_type_error: 'Tipo não válido para o filtro de total maior que.' }).optional().nullable(),
    less: z.number({ invalid_type_error: 'Tipo não válido para o filtro de total menor que.' }).optional().nullable(),
  }),
  period: z.object({
    after: z
      .string({ required_error: 'Filtro de depois de não informado.', invalid_type_error: 'Tipo não válido para o filtro de depois de.' })
      .optional()
      .nullable(),
    before: z
      .string({ required_error: 'Filtro de antes de não informado.', invalid_type_error: 'Tipo não válido para o filtro de antes de.' })
      .optional()
      .nullable(),
    field: PersonalizedFieldFilters.optional().nullable(),
  }),
  pendingPartialReceipt: z.boolean({
    required_error: 'Filtro de recebimento parcial pendente não informado.',
    invalid_type_error: 'Filtro de recebimento parcial pendente não informado.',
  }),
  pendingTotalReceipt: z.boolean({
    required_error: 'Filtro de recebimento total pendente não informado.',
    invalid_type_error: 'Filtro de recebimento total pendente não informado.',
  }),
})

export type TPersonalizedRevenuesFilters = z.infer<typeof PersonalizedRevenueFiltersSchema>

export const PersonalizedRevenueQuerySchema = z.object({
  partners: z.array(z.string({ required_error: 'Parceiros não informados ou inválidos.', invalid_type_error: 'Parceiros inválidos.' })).nullable(),
  filters: PersonalizedRevenueFiltersSchema,
})
