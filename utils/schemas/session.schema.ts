import { z } from "zod";

export const SessionSchema = z.object({
	sessaoId: z.string({
		required_error: "O ID da sessão não informado.",
		invalid_type_error: "Tipo não válido para o ID da sessão.",
	}),
	usuarioId: z.string({
		required_error: "O ID do usuário não informado.",
		invalid_type_error: "Tipo não válido para o ID do usuário.",
	}),
	usuarioAgente: z
		.string({
			invalid_type_error: "Tipo não válido para o agente do usuário.",
		})
		.optional()
		.nullable(),
	usuarioDispositivo: z
		.string({
			invalid_type_error: "Tipo não válido para o dispositivo do usuário.",
		})
		.optional()
		.nullable(),
	usuarioNavegador: z
		.string({
			invalid_type_error: "Tipo não válido para o navegador do usuário.",
		})
		.optional()
		.nullable(),
	usuarioEnderecoIp: z
		.string({
			invalid_type_error: "Tipo não válido para o endereço IP do usuário.",
		})
		.optional()
		.nullable(),
	dataExpiracao: z.string({
		required_error: "A data de expiração não informada.",
		invalid_type_error: "Tipo não válido para a data de expiração.",
	}),
});
export type TSession = z.infer<typeof SessionSchema>;
