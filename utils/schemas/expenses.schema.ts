import { z } from "zod";
import { AuthorSchema } from "./user.schema";
import { TProjectDTO } from "./project.schema";

const ExpenseProjectReference = z.object({
	id: z.string({ required_error: "ID do projeto não informado.", invalid_type_error: "Tipo não válido para o ID do projeto." }).optional().nullable(),
	nome: z
		.string({ required_error: "Nome do projeto não informado.", invalid_type_error: "Tipo não válido para o nome do projeto." })
		.optional()
		.nullable(),
	tipo: z
		.string({ required_error: "Tipo do projeto não informado.", invalid_type_error: "Tipo não válido para o tipo do projeto." })
		.optional()
		.nullable(),
	indexador: z
		.number({ required_error: "Indexador do projeto não informado.", invalid_type_error: "Tipo não válido para o indexador do projeto." })
		.optional()
		.nullable(),
	identificador: z
		.union([
			z.string({
				required_error: "Identificador do projeto não informado.",
				invalid_type_error: "Tipo não válido para o identificador do projeto.",
			}),
			z.number({
				required_error: "Identificador do projeto não informado.",
				invalid_type_error: "Tipo não válido para o identificador do projeto.",
			}),
		])
		.optional()
		.nullable(),
});
const ExpenseCompositionItem = z.object({
	idMaterial: z
		.string({
			required_error: "ID de referência do material não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do material.",
		})
		.optional()
		.nullable(),
	descricao: z.string({ required_error: "Descrição do item de despesa não informado." }),
	unidade: z.string({
		required_error: "Unidade do item de despesa não fornecida.",
		invalid_type_error: "Tipo não válido para a unidade do item de despesa.",
	}),
	valor: z.number({
		required_error: "Valor do item unitário de despesa não fornecido.",
		invalid_type_error: "Tipo não válido para o valor do item unitário de despesa.",
	}),
	qtde: z.number({
		required_error: "Quantidade do item de despesa não fornecida.",
		invalid_type_error: "Tipo não válido para a quantidade do item de despesa.",
	}),
});
export type TExpenseCompositionItem = z.infer<typeof ExpenseCompositionItem>;

const ExpensePaymentItem = z.object({
	valor: z.number({
		required_error: "Valor do item de pagamento não informada.",
		invalid_type_error: "Tipo não válido para valor do item de pagamento.",
	}),
	metodo: z.string({
		required_error: "Método do item de pagamento não informado.",
		invalid_type_error: "Tipo não válido para o método do item de pagamento.",
	}),
	dataPagamento: z
		.string({
			required_error: "Data de pagamento não informada.",
			invalid_type_error: "Tipo não válido para a data de pagamento.",
		})
		.datetime()
		.optional()
		.nullable(),
	efetivado: z.boolean({
		required_error: "Status de efetivação do pagamento não informado.",
		invalid_type_error: "Tipo não válido para o status de pagamento.",
	}),
});
export type TExpensePaymentItem = z.infer<typeof ExpensePaymentItem>;
const GeneralExpenseSchema = z.object({
	idParceiro: z.string({ invalid_type_error: "Tipo não válido para referência de parceiro." }).optional().nullable(),
	titulo: z
		.string({ required_error: "Título da despesa não informada.", invalid_type_error: "Tipo não válido para o título da despesa." })
		.min(5, "Preencha um título de ao menos 5 caracteres."),
	anotacoes: z.string({ required_error: "Anotações da despesa não informada.", invalid_type_error: "Tipo não válido para as anotações da despesa." }),
	categorias: z.array(
		z.string({ required_error: "Categoria da despesa não informada.", invalid_type_error: "Tipo não válido para a categoria da despesa." }),
		{
			required_error: "Lista de categorias da despesa não informada.",
			invalid_type_error: "Tipo não válido para a lista de categorias da despesa.",
		},
	),
	projeto: ExpenseProjectReference,
	composicao: z.array(ExpenseCompositionItem, {
		required_error: "Lista dos itens de composição da despesa não informada.",
		invalid_type_error: "Tipo não válido para os itens de composição da despesa.",
	}),
	total: z.number({ required_error: "Total da despesa não informado." }).min(0, "Valor de despesa inválido."),
	dataCompetencia: z.string({
		required_error: "Data de competência da despesa não informada.",
		invalid_type_error: "Tipo não válido para a data da despesa.",
	}),
	pagamentos: z.array(ExpensePaymentItem, {
		required_error: "Lista de pagamentos não informados.",
		invalid_type_error: "Tipo não válido para a lista de pagamentos.",
	}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});

export const InsertExpenseSchema = z.object({
	idParceiro: z.string({ invalid_type_error: "Tipo não válido para referência de parceiro." }).optional().nullable(),
	titulo: z
		.string({ required_error: "Título da despesa não informada.", invalid_type_error: "Tipo não válido para o título da despesa." })
		.min(5, "Preencha um título de ao menos 5 caracteres."),
	anotacoes: z.string({ required_error: "Anotações da despesa não informada.", invalid_type_error: "Tipo não válido para as anotações da despesa." }),
	categorias: z.array(
		z.string({ required_error: "Categoria da despesa não informada.", invalid_type_error: "Tipo não válido para a categoria da despesa." }),
		{
			required_error: "Lista de categorias da despesa não informada.",
			invalid_type_error: "Tipo não válido para a lista de categorias da despesa.",
		},
	),
	projeto: ExpenseProjectReference,
	composicao: z.array(ExpenseCompositionItem, {
		required_error: "Lista dos itens de composição da despesa não informada.",
		invalid_type_error: "Tipo não válido para os itens de composição da despesa.",
	}),
	total: z.number({ required_error: "Total da despesa não informado." }).min(0, "Valor de despesa inválido."),
	dataCompetencia: z.string({
		required_error: "Data de competência da despesa não informada.",
		invalid_type_error: "Tipo não válido para a data da despesa.",
	}),
	pagamentos: z.array(ExpensePaymentItem, {
		required_error: "Lista de pagamentos não informados.",
		invalid_type_error: "Tipo não válido para a lista de pagamentos.",
	}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});

export type TExpense = z.infer<typeof GeneralExpenseSchema>;
export type TExpenseWithProject = TExpense & { projetoDados?: TProjectDTO };

export type TExpenseDTO = TExpense & { _id: string };
export type TExpenseDTOWithProject = TExpenseDTO & { projetoDados?: TProjectDTO };

export type TExpenseSimplified = Pick<TExpense, "titulo" | "projeto" | "categorias" | "total" | "dataCompetencia">;
export type TExpenseDTOSimplified = TExpenseSimplified & { _id: string };

export type TPayment = { _id: string; titulo: 1; pagamentos: TExpensePaymentItem; indexPagamento: number };

export const ExpenseSimplifiedProjection = {
	titulo: 1,
	projeto: 1,
	categorias: 1,
	total: 1,
	dataCompetencia: 1,
};

const PersonalizedFieldFilters = z.enum(["dataInsercao", "dataCompetencia", "pagamentos.dataPagamento"], {
	required_error: "Filtro de campo de período não informado.",
	invalid_type_error: "Tipo não válido para o campo de filtro de período.",
});

const PersonalizedExpenseFiltersSchema = z.object({
	title: z.string({
		required_error: "Filtro de título de despesa não informado.",
		invalid_type_error: "Tipo não válido para o filtro de título de despesa.",
	}),
	category: z.string({
		required_error: "Filtro de categoria de despesa não informado.",
		invalid_type_error: "Tipo não válido para o filtro de categoria de despesa.",
	}),
	total: z.object({
		greater: z.number({ invalid_type_error: "Tipo não válido para o filtro de total maior que." }).optional().nullable(),
		less: z.number({ invalid_type_error: "Tipo não válido para o filtro de total menor que." }).optional().nullable(),
	}),
	period: z.object({
		after: z
			.string({ required_error: "Filtro de depois de não informado.", invalid_type_error: "Tipo não válido para o filtro de depois de." })
			.optional()
			.nullable(),
		before: z
			.string({ required_error: "Filtro de antes de não informado.", invalid_type_error: "Tipo não válido para o filtro de antes de." })
			.optional()
			.nullable(),
		field: PersonalizedFieldFilters.optional().nullable(),
	}),
	pendingPartialPayment: z.boolean({
		required_error: "Filtro de pagamento parcial pendente não informado.",
		invalid_type_error: "Filtro de pagamento parcial pendente não informado.",
	}),
	pendingTotalPayment: z.boolean({
		required_error: "Filtro de pagamento total pendente não informado.",
		invalid_type_error: "Filtro de pagamento total pendente não informado.",
	}),
});
export type TPersonalizedExpensesFilters = z.infer<typeof PersonalizedExpenseFiltersSchema>;

export const PersonalizedExpenseQuerySchema = z.object({
	partners: z.array(z.string({ required_error: "Parceiros não informados ou inválidos.", invalid_type_error: "Parceiros inválidos." })).nullable(),
	filters: PersonalizedExpenseFiltersSchema,
});

export const GeneralExpenseFiltersSchema = z.object({
	partners: z
		.array(z.string({ required_error: "Parceiros não informados ou inválidos.", invalid_type_error: "Parceiros inválidos." }), {
			required_error: "Lista de parceiros não informada.",
			invalid_type_error: "Tipo não válido para a lista de parceiros.",
		})
		.nullable(),
	projectTypes: z
		.array(z.string({ required_error: "Tipos de projeto não informados ou inválidos.", invalid_type_error: "Tipos de projeto inválidos." }), {
			required_error: "Lista de tipos de projetos não informada.",
			invalid_type_error: "Tipo não válido para a lista de tipos de projetos.",
		})
		.nullable(),
});
