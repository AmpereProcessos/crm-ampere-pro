import { z } from 'zod'
import { AuthorSchema } from './user.schema'

const ExpenseProjectReference = z.object({
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
const ExpenseCompositionItem = z.object({
  idMaterial: z
    .string({
      required_error: 'ID de referência do material não informado.',
      invalid_type_error: 'Tipo não válido para o ID de referência do material.',
    })
    .optional()
    .nullable(),
  descricao: z.string({ required_error: 'Descrição do item de despesa não informado.' }),
  unidade: z.string({
    required_error: 'Unidade do item de despesa não fornecida.',
    invalid_type_error: 'Tipo não válido para a unidade do item de despesa.',
  }),
  valor: z.number({
    required_error: 'Valor do item unitário de despesa não fornecido.',
    invalid_type_error: 'Tipo não válido para o valor do item unitário de despesa.',
  }),
  qtde: z.number({
    required_error: 'Quantidade do item de despesa não fornecida.',
    invalid_type_error: 'Tipo não válido para a quantidade do item de despesa.',
  }),
})
const ExpensePaymentItem = z.object({
  valor: z.number({
    required_error: 'Valor do item de pagamento não informada.',
    invalid_type_error: 'Tipo não válido para valor do item de pagamento.',
  }),
  metodo: z.string({
    required_error: 'Método do item de pagamento não informado.',
    invalid_type_error: 'Tipo não válido para o método do item de pagamento.',
  }),
  dataPagamento: z
    .string({
      required_error: 'Data de pagamento não informada.',
      invalid_type_error: 'Tipo não válido para a data de pagamento.',
    })
    .datetime()
    .optional()
    .nullable(),
  efetivado: z.boolean({
    required_error: 'Status de efetivação do pagamento não informado.',
    invalid_type_error: 'Tipo não válido para o status de pagamento.',
  }),
})

const GeneralExpenseSchema = z.object({
  idParceiro: z.string({ invalid_type_error: 'Tipo não válido para referência de parceiro.' }).optional().nullable(),
  titulo: z
    .string({ required_error: 'Título da despesa não informada.', invalid_type_error: 'Tipo não válido para o título da despesa.' })
    .min(5, 'Preencha um título de ao menos 5 caracteres.'),
  categorias: z.array(z.string({ required_error: 'Categoria da receita não informada.', invalid_type_error: 'Tipo não válido para a categoria da receita.' }), {
    required_error: 'Lista de categorias da receita não informada.',
    invalid_type_error: 'Tipo não válido para a lista de categorias da receita.',
  }),
  projeto: ExpenseProjectReference,
  composicao: z.array(ExpenseCompositionItem, {
    required_error: 'Lista dos itens de composição da despesa não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da despesa.',
  }),
  total: z.number({ required_error: 'Total da receita não informado.' }).min(0, 'Valor de receita inválido.'),
  dataCompetencia: z.string({
    required_error: 'Data de competência da receita não informada.',
    invalid_type_error: 'Tipo não válido para a data da receita.',
  }),
  pagamentos: z.array(ExpensePaymentItem, {
    required_error: 'Lista de pagamentos não informados.',
    invalid_type_error: 'Tipo não válido para a lista de pagamentos.',
  }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})

export const InsertExpenseSchema = z.object({
  idParceiro: z.string({ invalid_type_error: 'Tipo não válido para referência de parceiro.' }).optional().nullable(),
  titulo: z
    .string({ required_error: 'Título da despesa não informada.', invalid_type_error: 'Tipo não válido para o título da despesa.' })
    .min(5, 'Preencha um título de ao menos 5 caracteres.'),
  categorias: z.array(z.string({ required_error: 'Categoria da receita não informada.', invalid_type_error: 'Tipo não válido para a categoria da receita.' }), {
    required_error: 'Lista de categorias da receita não informada.',
    invalid_type_error: 'Tipo não válido para a lista de categorias da receita.',
  }),
  projeto: ExpenseProjectReference,
  composicao: z.array(ExpenseCompositionItem, {
    required_error: 'Lista dos itens de composição da despesa não informada.',
    invalid_type_error: 'Tipo não válido para os itens de composição da despesa.',
  }),
  total: z.number({ required_error: 'Total da receita não informado.' }).min(0, 'Valor de receita inválido.'),
  dataCompetencia: z.string({
    required_error: 'Data de competência da receita não informada.',
    invalid_type_error: 'Tipo não válido para a data da receita.',
  }),
  pagamentos: z.array(ExpensePaymentItem, {
    required_error: 'Lista de pagamentos não informados.',
    invalid_type_error: 'Tipo não válido para a lista de pagamentos.',
  }),
  autor: AuthorSchema,
  dataInsercao: z
    .string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para a data de inserção.' })
    .datetime({ message: 'Formato inválido para a data de inserção.' }),
})

export type TExpense = z.infer<typeof GeneralExpenseSchema>

export type TExpenseDTO = z.infer<typeof InsertExpenseSchema>
