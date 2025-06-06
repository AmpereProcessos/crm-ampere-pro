import { z } from "zod";

// Query params para dates (usado por todas as rotas)
export const QueryDatesSchema = z.object({
	after: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	before: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
});

// Query params para comparação de períodos (usado por sellers/:id)
export const QueryPeriodsComparisonSchema = z.object({
	firstPeriodAfter: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	firstPeriodBefore: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	secondPeriodAfter: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	secondPeriodBefore: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
});

// Query params específicos para sellers (userId)
export const SellersQueryParamsSchema = QueryDatesSchema.extend({
	userId: z.string({
		required_error: "ID do usuário é obrigatório.",
		invalid_type_error: "ID do usuário deve ser uma string.",
	}),
});

export type TQueryDatesInput = z.infer<typeof QueryDatesSchema>;
export type TQueryPeriodsComparisonInput = z.infer<typeof QueryPeriodsComparisonSchema>;
export type TSellersQueryParamsInput = z.infer<typeof SellersQueryParamsSchema>;
