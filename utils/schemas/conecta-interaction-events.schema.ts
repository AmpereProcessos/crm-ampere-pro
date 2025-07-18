import { z } from "zod";

export const InteractionEventEnumSchema = z.enum(["VISUALIZACAO_PAGINA", "INSCRIÇÃO", "INDICAÇÃO"], {
	required_error: "Evento de interação não informado.",
	invalid_type_error: "Tipo não válido para evento de interação.",
});
export const ConectaInteractionEventsSchema = z.object({
	tipo: InteractionEventEnumSchema,
	vendedor: z
		.object({
			id: z.string({ invalid_type_error: "Tipo não válido para ID do vendedor." }),
			nome: z.string({ invalid_type_error: "Tipo não válido para nome do vendedor." }),
			avatar_url: z.string({ invalid_type_error: "Tipo não válido para avatar do vendedor." }).optional().nullable(),
		})
		.describe("Seller who is associated with the interaction event")
		.optional()
		.nullable(),
	codigoIndicacaoVendedor: z
		.string({ invalid_type_error: "Tipo não válido para código de indicação." })
		.describe("Code of the seller who is associated with the interaction event")
		.optional()
		.nullable(),
	promotor: z
		.object({
			id: z.string({ invalid_type_error: "Tipo não válido para ID do promotor." }),
			nome: z.string({ invalid_type_error: "Tipo não válido para nome do promotor." }),
			avatar_url: z.string({ invalid_type_error: "Tipo não válido para avatar do promotor." }).optional().nullable(),
		})
		.describe("Promoter who is associated with the interaction event")
		.optional()
		.nullable(),
	usuario: z
		.object({
			id: z.string({ invalid_type_error: "Tipo não válido para ID do usuário." }),
			nome: z.string({ invalid_type_error: "Tipo não válido para nome do usuário." }),
			avatar_url: z.string({ invalid_type_error: "Tipo não válido para avatar do usuário." }).optional().nullable(),
		})
		.describe("User who triggered the interaction event")
		.optional()
		.nullable(),
	localizacao: z
		.object({
			cidade: z.string({ invalid_type_error: "Tipo não válido para cidade." }).optional().nullable(),
			uf: z.string({ invalid_type_error: "Tipo não válido para UF." }).optional().nullable(),
			latitude: z.string({ invalid_type_error: "Tipo não válido para latitude." }).optional().nullable(),
			longitude: z.string({ invalid_type_error: "Tipo não válido para longitude." }).optional().nullable(),
		})
		.describe("Location from which the interaction event was triggered")
		.optional()
		.nullable(),
	data: z
		.string({ invalid_type_error: "Tipo não válido para data de interação." })
		.datetime({ message: "Tipo não válido para data de interação." })
		.describe("Date and time when the interaction event was triggered"),
});

export type TConectaInteractionEvent = z.infer<typeof ConectaInteractionEventsSchema>;
