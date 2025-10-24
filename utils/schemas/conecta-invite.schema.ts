import { z } from "zod";

export const InvitesSchema = z.object({
	promotor: z.object({
		tipo: z.enum(["VENDEDOR", "CLIENTE"], {
			required_error: "Tipo do promotor do convite não informado.",
			invalid_type_error: "Tipo não válido para o promotor do convite.",
		}),
		id: z.string({
			required_error: "ID do vendedor promotor do convite não informado.",
			invalid_type_error: "Tipo não válido para o ID do vendedor promotor do convite.",
		}),
		nome: z.string({
			required_error: "Nome do vendedor promotor do convite não informado.",
			invalid_type_error: "Tipo não válido para o nome do vendedor promotor do convite.",
		}),
		avatar_url: z
			.string({
				required_error: "Avatar do vendedor promotor do convite não informado.",
				invalid_type_error: "Tipo não válido para o avatar do vendedor promotor do convite.",
			})
			.optional()
			.nullable(),
		codigoIndicacao: z.string({
			required_error: "Código de indicação do vendedor promotor do convite não informado.",
			invalid_type_error: "Tipo não válido para o código de indicação do vendedor promotor do convite.",
		}),
	}),
	convidado: z.object({
		id: z
			.string({
				required_error: "ID do convidado não informado.",
				invalid_type_error: "Tipo não válido para o ID do convidado.",
			})
			.optional()
			.nullable(),
		nome: z
			.string({
				required_error: "Nome do convidado não informado.",
				invalid_type_error: "Tipo não válido para o nome do convidado.",
			})
			.optional()
			.nullable(),
		telefone: z
			.string({
				required_error: "Telefone do convidado não informado.",
				invalid_type_error: "Tipo não válido para o telefone do convidado.",
			})
			.optional()
			.nullable(),
		email: z
			.string({
				required_error: "Email do convidado não informado.",
				invalid_type_error: "Tipo não válido para o email do convidado.",
			})
			.optional()
			.nullable(),
		uf: z
			.string({
				required_error: "UF do convidado não informado.",
				invalid_type_error: "Tipo não válido para o UF do convidado.",
			})
			.optional()
			.nullable(),
		cidade: z
			.string({
				required_error: "Cidade do convidado não informado.",
				invalid_type_error: "Tipo não válido para a cidade do convidado.",
			})
			.optional()
			.nullable(),
	}),
	dataExpiracao: z
		.string({
			required_error: "Data de expiração do convite não informada.",
			invalid_type_error: "Tipo não válido para a data de expiração do convite.",
		})
		.datetime({
			message: "Formato inválido para data de expiração do convite.",
		}),
	dataAceite: z
		.string({
			invalid_type_error: "Tipo não válido para a data de aceite do convite",
		})
		.datetime({
			message: "Formato inválido para a data de aceite do convite.",
		})
		.optional()
		.nullable(),
	dataInsercao: z
		.string({
			required_error: "Data de criação do convite não informada.",
			invalid_type_error: "Tipo não válido para a data de criação do convite.",
		})
		.datetime({ message: "Formato inválido para data de criação do convite." }),
});
export type TInvite = z.infer<typeof InvitesSchema>;
export type TInviteDTO = TInvite & { _id: string };
