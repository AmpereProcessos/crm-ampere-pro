import { z } from "zod";
import { OpportunitySegmentsEnumSchema } from "./opportunity.schema";

export const OpportunityViewPreferencesSchema = z.object({
	identificador: z.literal("opportunity-view-definition-v1"),
	modo: z.enum(["database", "kanban"]),
	filtrosKanban: z.object({
		status: z.enum(["ongoing", "won", "lost"]),
		parceirosIds: z.array(
			z.string({
				required_error: "ID do parceiro não informado.",
				invalid_type_error: "Tipo não válido para o ID do parceiro.",
			}),
			{ required_error: "Lista de parceiros não informada.", invalid_type_error: "Tipo não válido para lista de parceiros." },
		),
		responsaveisIds: z.array(
			z.string({
				required_error: "ID do responsável não informado.",
				invalid_type_error: "Tipo não válido para o ID do responsável.",
			}),
			{
				required_error: "Lista de responsáveis não informada.",
				invalid_type_error: "Tipo não válido para lista de responsáveis.",
			},
		),
		tiposOportunidadeIds: z.array(
			z.string({
				required_error: "ID do tipo de oportunidade não informado.",
				invalid_type_error: "Tipo não válido para o ID do tipo de oportunidade.",
			}),
			{ required_error: "Lista de tipos de oportunidade não informada.", invalid_type_error: "Tipo não válido para lista de tipos de oportunidade." },
		),
		periodo: z.object({
			parametro: z
				.enum(["dataInsercao", "dataGanho", "dataPerda", "ultimaInteracao.data"], {
					required_error: "Campo de período não informado.",
					invalid_type_error: "Tipo inválido para campo de período.",
				})
				.optional()
				.nullable(),
			depois: z
				.string({
					required_error: "Data de início do período não informada.",
					invalid_type_error: "Tipo inválido para data de início do período.",
				})
				.datetime()
				.optional()
				.nullable(),
			antes: z
				.string({
					required_error: "Data de fim do período não informada.",
					invalid_type_error: "Tipo inválido para data de fim do período.",
				})
				.datetime()
				.optional()
				.nullable(),
		}),
		segmentos: z.array(OpportunitySegmentsEnumSchema),
		viaMarketing: z.boolean({
			required_error: "Parâmetro de marketing não informado.",
			invalid_type_error: "Tipo não válido para parâmetro de marketing.",
		}),
		viaIndicacao: z.boolean({
			required_error: "Parâmetro de indicação não informado.",
			invalid_type_error: "Tipo não válido para parâmetro de indicação.",
		}),
		cidades: z.array(
			z.string({
				required_error: "ID da cidade não informado.",
				invalid_type_error: "Tipo não válido para o ID da cidade.",
			}),
			{ required_error: "Lista de cidades não informada.", invalid_type_error: "Tipo não válido para lista de cidades." },
		),
		ufs: z.array(
			z.string({
				required_error: "UF não informada.",
				invalid_type_error: "Tipo não válido para UF.",
			}),
			{ required_error: "Lista de UFs não informada.", invalid_type_error: "Tipo não válido para lista de UFs." },
		),
	}),
	usuarioId: z.string({
		required_error: "ID do usuário não informado.",
		invalid_type_error: "Tipo não válido para ID do usuário.",
	}),
});

export const UserPreferencesSchema = z.discriminatedUnion("identificador", [OpportunityViewPreferencesSchema]);

export type TUserPreferences = z.infer<typeof UserPreferencesSchema>;
