import { TypeOf } from "zod";
import { z } from "zod";
import { AuthorSchema } from "./user.schema";
import { ObjectId } from "mongodb";

const GeneralNotificationSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro.",
		invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
	}),
	remetente: z.object({
		id: z
			.string({ required_error: "ID de referência do remetente não fornecido.", invalid_type_error: "Tipo não válido para o ID do remetente." })
			.optional()
			.nullable(),
		nome: z.string({ required_error: "Nome do remetente não fornecido.", invalid_type_error: "Tipo não válido para o nome do remetente." }),
		avatar_url: z.string({ invalid_type_error: "Avatar do remetente não fornecido." }).optional().nullable(),
	}),
	destinatarios: z.array(
		z.object({
			id: z.string({
				required_error: "ID de referência do destinatário não fornecido.",
				invalid_type_error: "Tipo não válido para o ID do destinatário.",
			}),
			nome: z.string({ required_error: "Nome do destinatário não fornecido.", invalid_type_error: "Tipo não válido para o nome do destinatário." }),
			avatar_url: z.string({ invalid_type_error: "Avatar do destinatário não fornecido." }).optional().nullable(),
		}),
	),
	oportunidade: z.object({
		id: z
			.string({
				required_error: "ID de referência da oportunidade da notificação não informada.",
				invalid_type_error: "Tipo não válido para o ID de referência da oportunidade.",
			})
			.optional()
			.nullable(),
		nome: z.string({ invalid_type_error: "Tipo não válido para o nome da oportunidade referência." }).optional().nullable(),
		identificador: z.string({ invalid_type_error: "Tipo não válido para o identificador da oportunidade referência." }).optional().nullable(),
	}),
	mensagem: z.string({
		required_error: "Mensagem da notificação não informada.",
		invalid_type_error: "Tipo não válido para  a mensagem da notificação.",
	}),
	recebimentos: z.array(
		z.object({
			id: z.string({ required_error: "ID do recebedor não informado.", invalid_type_error: "Tipo não válido para o ID do recebedor." }),
			nome: z.string({ required_error: "Nome do recebedor não informado.", invalid_type_error: "Tipo não válido para o nome do recebedor." }),
			avatar_url: z.string({ invalid_type_error: "Tipo inválido para o avatar do usuário recebedor." }).optional().nullable(),
			dataLeitura: z
				.string({ required_error: "Date de recebimento não informada.", invalid_type_error: "Tipo não válido para a data de recebimento." })
				.datetime(),
		}),
	),
	dataInsercao: z
		.string({ required_error: "Data de inserção da notificação não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime(),
});

export const InsertNotificationSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro.",
		invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
	}),
	remetente: z.object({
		id: z
			.string({ required_error: "ID de referência do remetente não fornecido.", invalid_type_error: "Tipo não válido para o ID do remetente." })
			.optional()
			.nullable(),
		nome: z.string({ required_error: "Nome do remetente não fornecido.", invalid_type_error: "Tipo não válido para o nome do remetente." }),
		avatar_url: z.string({ invalid_type_error: "Avatar do remetente não fornecido." }).optional().nullable(),
	}),
	destinatarios: z.array(
		z.object({
			id: z.string({
				required_error: "ID de referência do destinatário não fornecido.",
				invalid_type_error: "Tipo não válido para o ID do destinatário.",
			}),
			nome: z.string({ required_error: "Nome do destinatário não fornecido.", invalid_type_error: "Tipo não válido para o nome do destinatário." }),
			avatar_url: z.string({ invalid_type_error: "Avatar do destinatário não fornecido." }).optional().nullable(),
		}),
	),
	oportunidade: z.object({
		id: z
			.string({
				required_error: "ID de referência da oportunidade da notificação não informada.",
				invalid_type_error: "Tipo não válido para o ID de referência da oportunidade.",
			})
			.optional()
			.nullable(),
		nome: z.string({ invalid_type_error: "Tipo não válido para o nome da oportunidade referência." }).optional().nullable(),
		identificador: z.string({ invalid_type_error: "Tipo não válido para o identificador da oportunidade referência." }).optional().nullable(),
	}),
	mensagem: z.string({
		required_error: "Mensagem da notificação não informada.",
		invalid_type_error: "Tipo não válido para  a mensagem da notificação.",
	}),
	recebimentos: z.array(
		z.object({
			id: z.string({ required_error: "ID do recebedor não informado.", invalid_type_error: "Tipo não válido para o ID do recebedor." }),
			nome: z.string({ required_error: "Nome do recebedor não informado.", invalid_type_error: "Tipo não válido para o nome do recebedor." }),
			avatar_url: z.string({ invalid_type_error: "Tipo inválido para o avatar do usuário recebedor." }).optional().nullable(),
			dataLeitura: z
				.string({ required_error: "Date de recebimento não informada.", invalid_type_error: "Tipo não válido para a data de recebimento." })
				.datetime(),
		}),
	),
	dataInsercao: z
		.string({ required_error: "Data de inserção da notificação não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime(),
});

const NotificationEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	idParceiro: z.string({
		required_error: "ID de referência do parceiro.",
		invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
	}),
	remetente: z.object({
		id: z
			.string({ required_error: "ID de referência do remetente não fornecido.", invalid_type_error: "Tipo não válido para o ID do remetente." })
			.optional()
			.nullable(),
		nome: z.string({ required_error: "Nome do remetente não fornecido.", invalid_type_error: "Tipo não válido para o nome do remetente." }),
		avatar_url: z.string({ invalid_type_error: "Avatar do remetente não fornecido." }).optional().nullable(),
	}),
	destinatarios: z.array(
		z.object({
			id: z.string({
				required_error: "ID de referência do destinatário não fornecido.",
				invalid_type_error: "Tipo não válido para o ID do destinatário.",
			}),
			nome: z.string({ required_error: "Nome do destinatário não fornecido.", invalid_type_error: "Tipo não válido para o nome do destinatário." }),
			avatar_url: z.string({ invalid_type_error: "Avatar do destinatário não fornecido." }).optional().nullable(),
		}),
	),
	oportunidade: z.object({
		id: z
			.string({
				required_error: "ID de referência da oportunidade da notificação não informada.",
				invalid_type_error: "Tipo não válido para o ID de referência da oportunidade.",
			})
			.optional()
			.nullable(),
		nome: z.string({ invalid_type_error: "Tipo não válido para o nome da oportunidade referência." }).optional().nullable(),
		identificador: z.string({ invalid_type_error: "Tipo não válido para o identificador da oportunidade referência." }).optional().nullable(),
	}),
	mensagem: z.string({
		required_error: "Mensagem da notificação não informada.",
		invalid_type_error: "Tipo não válido para  a mensagem da notificação.",
	}),
	recebimentos: z.array(
		z.object({
			id: z.string({ required_error: "ID do recebedor não informado.", invalid_type_error: "Tipo não válido para o ID do recebedor." }),
			nome: z.string({ required_error: "Nome do recebedor não informado.", invalid_type_error: "Tipo não válido para o nome do recebedor." }),
			avatar_url: z.string({ invalid_type_error: "Tipo inválido para o avatar do usuário recebedor." }).optional().nullable(),
			dataLeitura: z
				.string({ required_error: "Date de recebimento não informada.", invalid_type_error: "Tipo não válido para a data de recebimento." })
				.datetime(),
		}),
	),
	dataInsercao: z
		.string({ required_error: "Data de inserção da notificação não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime(),
});

export type TNotification = z.infer<typeof GeneralNotificationSchema>;
export type TNotificationDTO = TNotification & { _id: string };
