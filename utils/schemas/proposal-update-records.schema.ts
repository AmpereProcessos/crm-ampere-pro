import { z } from "zod";
import { GeneralProposalSchema, InsertProposalSchema, TProposal } from "./proposal.schema";
import { AuthorSchema } from "./user.schema";

// Define a function to generate the schema for alteracoes

const GeneralProposalUpdateRecordSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
	}),
	oportunidade: z.object({
		id: z.string({ invalid_type_error: "Tipo não válido para a referência de oportunidade." }).optional().nullable(),
		nome: z.string({ invalid_type_error: "Tipo não válido para o nome da oportunidade referência." }).optional().nullable(),
	}),
	proposta: z.object({
		id: z.string({
			required_error: "ID da proposta de referência não informado.",
			invalid_type_error: "Tipo não válido para o ID da proposta de referência.",
		}),
		nome: z.string({
			required_error: "Nome da proposta de referência não informado.",
			invalid_type_error: "Tipo não válido para o nome da proposta de referência.",
		}),
	}),
	anterior: GeneralProposalSchema.partial(),
	novo: GeneralProposalSchema.partial(),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção da proposta não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção da proposta.",
		})
		.datetime(),
});

export const InsertProposalUpdateRecordSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
	}),
	oportunidade: z.object({
		id: z.string({ invalid_type_error: "Tipo não válido para a referência de oportunidade." }).optional().nullable(),
		nome: z.string({ invalid_type_error: "Tipo não válido para o nome da oportunidade referência." }).optional().nullable(),
	}),
	proposta: z.object({
		id: z.string({
			required_error: "ID da proposta de referência não informado.",
			invalid_type_error: "Tipo não válido para o ID da proposta de referência.",
		}),
		nome: z.string({
			required_error: "Nome da proposta de referência não informado.",
			invalid_type_error: "Tipo não válido para o nome da proposta de referência.",
		}),
	}),
	anterior: GeneralProposalSchema.partial(),
	novo: GeneralProposalSchema.partial(),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção da proposta não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção da proposta.",
		})
		.datetime(),
});

export type TProposalUpdateRecord = z.infer<typeof GeneralProposalUpdateRecordSchema>;

export type TProposalUpdateRecordDTO = TProposalUpdateRecord & { _id: string };
