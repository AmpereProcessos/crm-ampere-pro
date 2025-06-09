import { z } from "zod";

// Query params para busca de notifications
export const GetNotificationsQueryParams = z.object({
	id: z.string().optional().nullable(),
	recipientId: z.string().optional().nullable(),
	opportunityId: z.string().optional().nullable(),
});

export const NotificationOpportunityTopicOnTechnicalAnalysisConcludedInputSchema = z.object({
	tipo: z.enum(["TECHNICAL_ANALYSIS_CONCLUDED"]),
	payload: z.object({
		autor: z.object({
			nome: z.string({
				required_error: "O nome do autor é obrigatório",
			}),
			avatar_url: z.string({
				required_error: "A URL do avatar do autor é obrigatória",
			}),
		}),
		oportunidade: z.object({
			id: z.string({
				required_error: "O ID da oportunidade é obrigatório",
			}),
			identificador: z.string({
				required_error: "O identificador da oportunidade é obrigatório",
			}),
			nome: z.string({
				required_error: "O nome da oportunidade é obrigatório",
			}),
		}),
	}),
});
export const NotificationOpportunityNewInteractionToResponsiblesInputSchema = z.object({
	tipo: z.enum(["NEW_INTERACTION_TO_RESPONSIBLES"]),
	payload: z.object({
		autor: z.object({
			nome: z.string({
				required_error: "O nome do autor é obrigatório",
			}),
			avatar_url: z.string({
				required_error: "A URL do avatar do autor é obrigatória",
			}),
		}),
		oportunidade: z.object({
			id: z.string({
				required_error: "O ID da oportunidade é obrigatório",
			}),
			identificador: z.string({
				required_error: "O identificador da oportunidade é obrigatório",
			}),
			nome: z.string({
				required_error: "O nome da oportunidade é obrigatório",
			}),
		}),
		interacao: z.object({
			tipo: z.string({
				required_error: "O tipo da interação é obrigatório",
			}),
		}),
	}),
});
export const CreateNotificationInput = z.discriminatedUnion("tipo", [
	NotificationOpportunityTopicOnTechnicalAnalysisConcludedInputSchema,
	NotificationOpportunityNewInteractionToResponsiblesInputSchema,
]);
