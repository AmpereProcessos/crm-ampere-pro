import { z } from "zod";
import { AuthorSchema } from "./user.schema";

const FieldUpdateLogSchema = z.object({
	identificador: z.literal("ATUALIZAÇÃO-CAMPO", {
		required_error: "Identificador da operação de atualização.",
		invalid_type_error: "Tipo não válido para o identificador da operação de atualização.",
	}),
	idOportunidade: z.string({ invalid_type_error: "Tipo não válido para a referência de oportunidade." }).optional().nullable(),
	idCliente: z.string({ invalid_type_error: "Tipo não válido para a referência de cliente." }).optional().nullable(),
	idAnaliseTecnica: z
		.string({
			required_error: "Referência de análise técnica não informada.",
			invalid_type_error: "Tipo não válido para a referência de análise técnica.",
		})
		.optional()
		.nullable(),
	idHomologacao: z
		.string({
			required_error: "Referência de homologação não informada.",
			invalid_type_error: "Tipo não válido para a referência de homologação.",
		})
		.optional()
		.nullable(),
	campo: z.string({ required_error: "Campo de alteração não informado.", invalid_type_error: "Tipo não válido para o campo de alteração." }),
	nomeCampo: z.string({ required_error: "Nome do campo não informado.", invalid_type_error: "Tipo não válido para o nome do campo." }),
	valorAnterior: z.union([z.string(), z.number(), z.boolean()], {
		required_error: "Valor anterior do campo não informado.",
		invalid_type_error: "Tipo não válido para o valor anterior do campo.",
	}),
	valorNovo: z.union([z.string(), z.number(), z.boolean()], {
		required_error: "Valor novo do campo não informado.",
		invalid_type_error: "Tipo não válido para o valor novo do campo.",
	}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido." }),
});
export type TFieldUpdateLog = z.infer<typeof FieldUpdateLogSchema>;

const FileAttachmentLogSchema = z.object({
	identificador: z.literal("ANEXO-ARQUIVO", {
		required_error: "Identificador da operação de atualização.",
		invalid_type_error: "Tipo não válido para o identificador da operação de atualização.",
	}),
	idOportunidade: z.string({ invalid_type_error: "Tipo não válido para a referência de oportunidade." }).optional().nullable(),
	idCliente: z.string({ invalid_type_error: "Tipo não válido para a referência de cliente." }).optional().nullable(),
	idAnaliseTecnica: z
		.string({
			required_error: "Referência de análise técnica não informada.",
			invalid_type_error: "Tipo não válido para a referência de análise técnica.",
		})
		.optional()
		.nullable(),
	idHomologacao: z
		.string({
			required_error: "Referência de homologação não informada.",
			invalid_type_error: "Tipo não válido para a referência de homologação.",
		})
		.optional()
		.nullable(),
	tituloArquivo: z
		.string({ required_error: "Titulo do arquivo não informado.", invalid_type_error: "Tipo não válido para titulo do arquivo." })
		.min(2, "É necessário que o titulo do arquivo tenha ao menos 2 caracteres."),
	formatoArquivo: z.string({ required_error: "Formato do arquivo não informado.", invalid_type_error: "Tipo não válido para o formato do arquivo." }),
	urlArquivo: z.string({ required_error: "URL do arquivo não informada.", invalid_type_error: "Tipo válido para a URL do arquivo." }),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido." }),
});

export type TFileAttachmentLog = z.infer<typeof FileAttachmentLogSchema>;

const FileDeletionLogSchema = z.object({
	identificador: z.literal("EXCLUSÃO-ARQUIVO", {
		required_error: "Identificador da operação de atualização.",
		invalid_type_error: "Tipo não válido para o identificador da operação de atualização.",
	}),
	idOportunidade: z.string({ invalid_type_error: "Tipo não válido para a referência de oportunidade." }).optional().nullable(),
	idCliente: z.string({ invalid_type_error: "Tipo não válido para a referência de cliente." }).optional().nullable(),
	idAnaliseTecnica: z
		.string({
			required_error: "Referência de análise técnica não informada.",
			invalid_type_error: "Tipo não válido para a referência de análise técnica.",
		})
		.optional()
		.nullable(),
	idHomologacao: z
		.string({
			required_error: "Referência de homologação não informada.",
			invalid_type_error: "Tipo não válido para a referência de homologação.",
		})
		.optional()
		.nullable(),
	tituloArquivo: z
		.string({ required_error: "Titulo do arquivo não informado.", invalid_type_error: "Tipo não válido para titulo do arquivo." })
		.min(2, "É necessário que o titulo do arquivo tenha ao menos 2 caracteres."),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido." }),
});

export type TFileDeletionLog = z.infer<typeof FileDeletionLogSchema>;
