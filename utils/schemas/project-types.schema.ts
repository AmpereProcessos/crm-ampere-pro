import { z } from "zod";
import { SaleCategorySchema } from "./opportunity.schema";
import { GeneralPaymentMethodSchema } from "./payment-methods";
import { AuthorSchema } from "./user.schema";

const SizingSpecificationSchema = z.object({
	titulo: z.string({
		required_error: "Título da seção de dimensionamento não informada.",
		invalid_type_error: "Tipo não válido para o título da seção de dimensionamento.",
	}),
	campos: z.array(
		z.string({
			required_error: "Item da lista de dimensionamento não informado.",
			invalid_type_error: "Tipo não válido para o item de campo de dimensionamento.",
		}),
		{
			required_error: "Lista dos campos de dimensionamento não informado.",
			invalid_type_error: "Tipo não válido para a lista dos campos de dimensionamento.",
		},
	),
});
const ProposalModelReferenceSchema = z.object({
	titulo: z.string({ required_error: "Título do modelo de proposta não informado." }),
	idAnvil: z.string({ required_error: "ID de referência da integração do modelo não fornecido." }),
});
const DocumentSpecificationSchema = z.object({
	obrigatorio: z.boolean({
		required_error: "Obrigatoriedade do documento não informada.",
		invalid_type_error: "Tipo não válido para a obrigatoriedade do documento.",
	}),
	titulo: z.string({
		required_error: "Título do documento necessário não específicado.",
		invalid_type_error: "Tipo não válido para título do documento necessário.",
	}),
	descricao: z.string({ required_error: "Descrição do documento não informada." }),
	multiplo: z.boolean({
		required_error: "Possibilidade de adição de múltiplos arquivos não informada.",
		invalid_type_error: "Tipo não válido para a possibilidade de adição de múltiplos arquivos.",
	}),
	condicao: z.object({
		aplicavel: z.boolean({
			required_error: "Aplicabilidade de condição no resultado não informada.",
			invalid_type_error: "Tipo não válido para aplicabilidade de condição no resultado.",
		}),
		variavel: z
			.string({
				required_error: "Variável de condição no resultado não informada.",
				invalid_type_error: "Tipo não válido para variável de condição no resultado.",
			})
			.optional()
			.nullable(),
		igual: z
			.string({
				required_error: "Valor de comparação de igualdade da condição não informado.",
				invalid_type_error: "Tipo não válido para o valor de comparação de igualdade da condição.",
			})
			.optional()
			.nullable(),
	}),
});

const GeneralProjectTypeSchema = z.object({
	idParceiro: z
		.string({
			required_error: "ID de referência do parceiro não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
		})
		.optional()
		.nullable(),
	nome: z.string({ required_error: "Nome do tipo de projeto não informado.", invalid_type_error: "Tipo não válido para o nome do tipo de projeto." }),
	categoriaVenda: SaleCategorySchema,
	dimensionamento: z.array(SizingSpecificationSchema),
	modelosProposta: z.array(ProposalModelReferenceSchema),
	documentacao: z.array(DocumentSpecificationSchema),
	metodosPagamento: z.array(
		GeneralPaymentMethodSchema.pick({ nome: true }).extend({
			id: z.string({
				required_error: "ID do método de pagamento não informado.",
				invalid_type_error: "Tipo não válido para o ID do método de pagamento.",
			}),
		}),
	),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Tipo inválido para data de inserção." }),
});

export const InsertProjectTypeSchema = z.object({
	idParceiro: z
		.string({
			required_error: "ID de referência do parceiro não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
		})
		.optional()
		.nullable(),
	nome: z.string({ required_error: "Nome do tipo de projeto não informado.", invalid_type_error: "Tipo não válido para o nome do tipo de projeto." }),
	categoriaVenda: SaleCategorySchema,
	dimensionamento: z.array(SizingSpecificationSchema),
	modelosProposta: z.array(ProposalModelReferenceSchema),
	metodosPagamento: z.array(
		GeneralPaymentMethodSchema.pick({ nome: true }).extend({
			id: z.string({
				required_error: "ID do método de pagamento não informado.",
				invalid_type_error: "Tipo não válido para o ID do método de pagamento.",
			}),
		}),
	),
	documentacao: z.array(DocumentSpecificationSchema),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Tipo inválido para data de inserção." }),
});

export type TProjectType = z.infer<typeof GeneralProjectTypeSchema>;
export type TProjectTypeDTO = TProjectType & { _id: string };

export type TProjectTypeSimplified = Pick<TProjectType, "nome" | "idParceiro" | "autor" | "dataInsercao">;

export type TProjectTypeDTOSimplified = TProjectTypeSimplified & { _id: string };

export const ProjectTypeSimplifiedProjection = {
	_id: 1,
	nome: 1,
	idParceiro: 1,
	autor: 1,
	dataInsercao: 1,
};
