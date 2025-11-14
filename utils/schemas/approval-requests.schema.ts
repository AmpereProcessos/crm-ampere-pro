import z from "zod";

export const ApprovalRequestsSchema = z.object({
	oportunidade: z.object({
		id: z.string({
			required_error: "ID da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o ID da oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o nome da oportunidade.",
		}),
		identificador: z.string({
			required_error: "Identificador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o identificador da oportunidade.",
		}),
	}),
	requisicao: z.discriminatedUnion("tipo", [
		z.object({
			tipo: z.literal("OPORTUNIDADE-TRANSFERÊNCIA-RESPONSAVEL"),
			responsavelAtual: z.object({
				papel: z.string({
					required_error: "Papel do responsável atual não informado.",
					invalid_type_error: "Tipo não válido para o papel do responsável atual.",
				}),
				id: z.string({
					required_error: "ID do responsável atual não informado.",
					invalid_type_error: "Tipo não válido para o ID do responsável atual.",
				}),
				nome: z.string({
					required_error: "Nome do responsável atual não informado.",
					invalid_type_error: "Tipo não válido para o nome do responsável atual.",
				}),
				avatarUrl: z
					.string({
						required_error: "URL do avatar do responsável atual não informado.",
						invalid_type_error: "Tipo não válido para a URL do avatar do responsável atual.",
					})
					.optional()
					.nullable(),
			}),
			responsavelNovo: z.object({
				papel: z.string({
					required_error: "Papel do responsável novo não informado.",
					invalid_type_error: "Tipo não válido para o papel do responsável novo.",
				}),
				id: z.string({
					required_error: "ID do responsável novo não informado.",
					invalid_type_error: "Tipo não válido para o ID do responsável novo.",
				}),
				nome: z.string({
					required_error: "Nome do responsável novo não informado.",
					invalid_type_error: "Tipo não válido para o nome do responsável novo.",
				}),
				avatarUrl: z
					.string({
						required_error: "URL do avatar do responsável novo não informado.",
						invalid_type_error: "Tipo não válido para a URL do avatar do responsável novo.",
					})
					.optional()
					.nullable(),
			}),
		}),
	]),
	requerente: z.object({
		id: z.string({
			required_error: "ID do requerente não informado.",
			invalid_type_error: "Tipo não válido para o ID do requerente.",
		}),
		nome: z.string({
			required_error: "Nome do requerente não informado.",
			invalid_type_error: "Tipo não válido para o nome do requerente.",
		}),
		avatarUrl: z
			.string({
				required_error: "URL do avatar do requerente não informado.",
				invalid_type_error: "Tipo não válido para a URL do avatar do requerente.",
			})
			.optional()
			.nullable(),
	}),
	autorizador: z
		.object({
			id: z.string({
				required_error: "ID do autorizador não informado.",
				invalid_type_error: "Tipo não válido para o ID do autorizador.",
			}),
			nome: z.string({
				required_error: "Nome do autorizador não informado.",
				invalid_type_error: "Tipo não válido para o nome do autorizador.",
			}),
			avatarUrl: z
				.string({
					required_error: "URL do avatar do autorizador não informado.",
					invalid_type_error: "Tipo não válido para a URL do avatar do autorizador.",
				})
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	comentarios: z
		.string({
			required_error: "Comentário não informado.",
			invalid_type_error: "Tipo não válido para o comentário.",
		})
		.optional()
		.nullable(),
	dataSolicitacao: z.string({
		required_error: "Data de solicitação não informada.",
		invalid_type_error: "Tipo não válido para a data de solicitação.",
	}),
	dataAprovacao: z
		.string({
			required_error: "Data de aprovação não informada.",
			invalid_type_error: "Tipo não válido para a data de aprovação.",
		})
		.optional()
		.nullable(),
});
export type TApprovalRequests = z.infer<typeof ApprovalRequestsSchema>;
