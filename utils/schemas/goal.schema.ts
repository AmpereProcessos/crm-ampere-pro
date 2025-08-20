import { z } from "zod";

export const GoalValuesSchema = z.object({
	oportunidadesCriadas: z
		.number({
			required_error: "O número de oportunidades criadas não informado.",
			invalid_type_error: "O número de oportunidades criadas inválido.",
		})
		.min(0, "O número de oportunidades criadas não pode ser negativo."),
	oportunidadesEnviadas: z
		.number({
			required_error: "O número de oportunidades enviadas não informado.",
			invalid_type_error: "O número de oportunidades enviadas inválido.",
		})
		.min(0, "O número de oportunidades enviadas não pode ser negativo."),
	oportunidadesEnviadasGanhas: z.number({
		required_error: "O número de oportunidades enviadas ganhas não informado.",
		invalid_type_error: "O número de oportunidades enviadas ganhas inválido.",
	}),
	oportunidadesEnviadasConversao: z
		.number({
			required_error: "A conversão de oportunidades enviadas não informada.",
			invalid_type_error: "A conversão de oportunidades enviadas inválida.",
		})
		.min(0, "A conversão de oportunidades enviadas não pode ser negativa."),
	oportunidadesEnviadasGanhasConversao: z.number({
		required_error: "A conversão de oportunidades enviadas ganhas não informada.",
		invalid_type_error: "A conversão de oportunidades enviadas ganhas inválida.",
	}),
	oportunidadesGanhas: z
		.number({
			required_error: "O número de oportunidades ganhas não informado.",
			invalid_type_error: "O número de oportunidades ganhas inválido.",
		})
		.min(0, "O número de oportunidades ganhas não pode ser negativo."),
	oportunidadesGanhasConversao: z.number({
		required_error: "A conversão de oportunidades ganhas não informada.",
		invalid_type_error: "A conversão de oportunidades ganhas inválida.",
	}),
	valorVendido: z
		.number({
			required_error: "O valor vendido não informado.",
			invalid_type_error: "O valor vendido inválido.",
		})
		.min(0, "O valor vendido não pode ser negativo."),
	potenciaVendida: z
		.number({
			required_error: "A potência vendida não informada.",
			invalid_type_error: "A potência vendida inválida.",
		})
		.min(0, "A potência vendida não pode ser negativo."),
});
export type TGoalKeys = keyof typeof GoalValuesSchema.shape;

export const GoalIdSchema = z.string({
	required_error: "O id da meta não informado.",
	invalid_type_error: "O id da meta inválido.",
});

export const GoalSchema = z.object({
	tipo: z.literal("META-COMERCIAL"),
	idParceiro: z
		.string({
			required_error: "O id do parceiro não informado.",
			invalid_type_error: "O id do parceiro inválido.",
		})
		.optional()
		.nullable(),
	periodo: z.object({
		inicio: z
			.string({
				required_error: "Data de início não informada.",
				invalid_type_error: "Data de início inválida.",
			})
			.datetime(),
		fim: z
			.string({
				required_error: "Data de fim não informada.",
				invalid_type_error: "Data de fim inválida.",
			})
			.datetime(),
	}),
	objetivo: GoalValuesSchema,
	alcancado: GoalValuesSchema.optional().nullable(),
	usuarios: z.array(
		z.object({
			id: z.string({
				required_error: "O id do usuário não informado.",
				invalid_type_error: "O id do usuário inválido.",
			}),
			nome: z.string({
				required_error: "O nome do usuário não informado.",
				invalid_type_error: "O nome do usuário inválido.",
			}),
			avatar_url: z
				.string({
					required_error: "O avatar do usuário não informado.",
					invalid_type_error: "O avatar do usuário inválido.",
				})
				.optional()
				.nullable(),
			objetivo: GoalValuesSchema,
			alcancado: GoalValuesSchema.optional().nullable(),
		}),
	),
	// Refers to the date when calculation of "alcancado" values was last made
	dataCalculo: z
		.string({
			required_error: "A data de cálculo não informada.",
			invalid_type_error: "A data de cálculo inválida.",
		})
		.datetime()
		.optional()
		.nullable(),
	dataInsercao: z
		.string({
			required_error: "A data de inserção não informada.",
			invalid_type_error: "A data de inserção inválida.",
		})
		.optional()
		.nullable(),
});

export type TGoal = z.infer<typeof GoalSchema>;
export type TGoalDTO = TGoal & { _id: string };
