import { z } from "zod";
import { AuthorSchema } from "./user.schema";

const ComissionProjectReference = z.object({
	id: z.string({ required_error: "ID do projeto não informado.", invalid_type_error: "Tipo não válido para o ID do projeto." }).optional().nullable(),
	nome: z.string({ required_error: "Nome do projeto não informado.", invalid_type_error: "Tipo não válido para o nome do projeto." }).optional().nullable(),
	tipo: z.string({ required_error: "Tipo do projeto não informado.", invalid_type_error: "Tipo não válido para o tipo do projeto." }),
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

const GeneralComissionSchema = z.object({
	favorecido: AuthorSchema,
	valor: z.number({ required_error: "Valor da comissão não informado.", invalid_type_error: "Tipo não válido para o valor da comissão." }),
	projeto: ComissionProjectReference,
	formulaArr: z
		.array(
			z.string({
				required_error: "Item da fórmula de cálculo da comissão não informada.",
				invalid_type_error: "Tipo não válido para item da fórmula de cálculo da comissão.",
			}),
		)
		.optional()
		.nullable(),
	validacao: z.object({
		data: z
			.string({ invalid_type_error: "Tipo não válido para a data de validação da comissão." })
			.datetime({ message: "Formato inválido para data de validação da comissão." })
			.optional()
			.nullable(),
		responsavel: AuthorSchema,
	}),
	efetivacao: z.object({
		data: z
			.string({ invalid_type_error: "Tipo não válido para a data de efetivação da comissão." })
			.datetime({ message: "Formato inválido para data de efetivação da comissão." })
			.optional()
			.nullable(),
		responsavel: AuthorSchema,
	}),
	dataInsercao: z
		.string({ invalid_type_error: "Tipo não válido para a data de inserção da comissão." })
		.datetime({ message: "Formato inválido para data de inserção da comissão." }),
});

export const InsertComissionSchema = z.object({
	favorecido: AuthorSchema,
	valor: z.number({ required_error: "Valor da comissão não informado.", invalid_type_error: "Tipo não válido para o valor da comissão." }),
	projeto: ComissionProjectReference,
	formulaArr: z
		.array(
			z.string({
				required_error: "Item da fórmula de cálculo da comissão não informada.",
				invalid_type_error: "Tipo não válido para item da fórmula de cálculo da comissão.",
			}),
		)
		.optional()
		.nullable(),
	validacao: z.object({
		data: z
			.string({ invalid_type_error: "Tipo não válido para a data de validação da comissão." })
			.datetime({ message: "Formato inválido para data de validação da comissão." })
			.optional()
			.nullable(),
		responsavel: AuthorSchema,
	}),
	efetivacao: z.object({
		data: z
			.string({ invalid_type_error: "Tipo não válido para a data de efetivação da comissão." })
			.datetime({ message: "Formato inválido para data de efetivação da comissão." })
			.optional()
			.nullable(),
		responsavel: AuthorSchema,
	}),
	dataInsercao: z
		.string({ invalid_type_error: "Tipo não válido para a data de inserção da comissão." })
		.datetime({ message: "Formato inválido para data de inserção da comissão." }),
});

export type TComission = z.infer<typeof GeneralComissionSchema>;

export type TComissionDTO = TComission & { _id: string };
