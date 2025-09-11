import { z } from "zod";
import { AuthorSchema } from "../user.schema";

export const UtilsIdentifierSchema = z.enum(
	["EQUIPMENT", "CREDITOR", "ACQUISITION_CHANNEL"],
	{
		required_error: "Identificador não informado.",
		invalid_type_error: "Tipo inválido para identificador.",
	},
);

const EquipmentSchema = z.object({
	identificador: z.literal("EQUIPMENT"),
	idMaterial: z
		.string({
			required_error: "ID do material não informado.",
			invalid_type_error: "Tipo não válido para o ID do material.",
		})
		.optional()
		.nullable(),
	categoria: z.union([z.literal("MÓDULO"), z.literal("INVERSOR")]),
	fabricante: z.string({
		required_error: "Fabricante do produto não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do produto.",
	}),
	modelo: z.string({
		required_error: "Modelo do produto não informado.",
		invalid_type_error: "Tipo não válido para o modelo do produto.",
	}),
	potencia: z
		.number({
			required_error: "Potência do produto não informada.",
			invalid_type_error: "Tipo não válido para a potência do produto.",
		})
		.optional()
		.nullable(),
	garantia: z.number({
		required_error: "Garantia do produto não informada.",
		invalid_type_error: "Tipo não válido para a garantia do produto.",
	}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção.",
		})
		.datetime({ message: "Formato inválido para data de inserção." }),
});
export type TEquipment = z.infer<typeof EquipmentSchema>;
export type TEquipmentDTO = TEquipment & { _id: string };

const CreditorSchema = z.object({
	identificador: z.literal("CREDITOR"),
	valor: z.string({
		required_error: "Nome do credor não informado.",
		invalid_type_error: "Tipo não válido para o nome do credor.",
	}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção.",
		})
		.datetime({ message: "Formato inválido para data de inserção." }),
});
export type TCreditor = z.infer<typeof CreditorSchema>;
export type TCreditorDTO = TCreditor & { _id: string };

export const AcquisitionChannelSchema = z.object({
	identificador: z.literal("ACQUISITION_CHANNEL"),
	valor: z.string({
		required_error: "Canal de aquisição não informado.",
		invalid_type_error: "Tipo não válido para o canal de aquisição.",
	}),
	slug: z.string({
		required_error: "Slug do canal de aquisição não informado.",
		invalid_type_error: "Tipo não válido para o slug do canal de aquisição.",
	}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção.",
		})
		.datetime({ message: "Formato inválido para data de inserção." }),
});
export type TAcquisitionChannel = z.infer<typeof AcquisitionChannelSchema>;
export type TAcquisitionChannelDTO = TAcquisitionChannel & { _id: string };

export const GeneralUtilSchema = z.discriminatedUnion("identificador", [
	EquipmentSchema,
	CreditorSchema,
	AcquisitionChannelSchema,
]);

export type TUtil = TEquipment | TCreditor | TAcquisitionChannel;

export const AttachmentStateSchema = z.object({
	titulo: z.string({
		required_error: "Título do arquivo não informado.",
		invalid_type_error: "Tipo não válido para o título do arquivo.",
	}),
	identificador: z.string({
		required_error: "ID do arquivo não informado.",
		invalid_type_error: "Tipo não válido para o ID do arquivo.",
	}),
	arquivos: z.array(
		z.object({
			arquivo: z
				.instanceof(File, { message: "Arquivo não informado." })
				.nullable(),
			previewUrl: z
				.string({
					required_error: "URL do arquivo não informada.",
					invalid_type_error: "Tipo não válido para a URL do arquivo.",
				})
				.nullable(),
			tipo: z
				.string({
					required_error: "Formato do arquivo não informado.",
					invalid_type_error: "Tipo não válido para o formato do arquivo.",
				})
				.nullable(),
		}),
	),
});
export type TAttachmentState = z.infer<typeof AttachmentStateSchema>;
