import { LeadSchema } from "@/utils/schemas/leads.schema";
import { ObjectId } from "mongodb";
import z from "zod";

export const GetManyLeadsInputSchema = z.object({
	page: z
		.string({
			required_error: "Página não informada.",
			invalid_type_error: "Tipo não válido para a página.",
		})
		.transform((page) => parseInt(page)),
	search: z
		.string({
			required_error: "Busca não informada.",
			invalid_type_error: "Tipo não válido para a busca.",
		})
		.optional()
		.nullable(),
	periodAfter: z
		.string({
			required_error: "Data de início do período não informada.",
			invalid_type_error: "Tipo não válido para a data de início do período.",
		})
		.datetime({ message: "Tipo inválido para a data de início do período." })
		.optional()
		.nullable(),
	periodBefore: z
		.string({
			required_error: "Data de fim do período não informada.",
			invalid_type_error: "Tipo não válido para a data de fim do período.",
		})
		.datetime({ message: "Tipo inválido para a data de fim do período." })
		.optional()
		.nullable(),
	periodField: z
		.enum(["dataInsercao", "dataUltimoContato", "dataProximoContato", "conversao.data", "ganho.data", "perda.data"], {
			required_error: "Campo de período não informado.",
			invalid_type_error: "Tipo inválido para o campo de período.",
		})
		.optional()
		.nullable(),
	qualifiersIds: z
		.string({
			required_error: "IDs dos qualificadores não informados.",
			invalid_type_error: "Tipo não válido para os IDs dos qualificadores.",
		})
		.transform((ids) => ids.split(",").filter((id) => id.trim().length > 0))
		.optional()
		.nullable(),
	ufs: z
		.string({
			required_error: "UF não informadas.",
			invalid_type_error: "Tipo não válido para as UFs.",
		})
		.transform((ufs) => ufs.split(",").filter((uf) => uf.trim().length > 0))
		.optional()
		.nullable(),
	cities: z
		.string({
			required_error: "Cidades não informadas.",
			invalid_type_error: "Tipo não válido para as cidades.",
		})
		.transform((cities) => cities.split(",").filter((city) => city.trim().length > 0))
		.optional()
		.nullable(),
	pendingQualification: z
		.string({
			required_error: "Filtro de qualificação pendente não informado.",
			invalid_type_error: "Tipo não válido para o filtro de qualificação pendente.",
		})
		.transform((pendingQualification) => pendingQualification === "true")
		.optional()
		.nullable(),
	pendingContact: z
		.string({
			required_error: "Filtro de contato pendente não informado.",
			invalid_type_error: "Tipo não válido para o filtro de contato pendente.",
		})
		.transform((pendingContact) => pendingContact === "true")
		.optional()
		.nullable(),
});
export const GetLeadByIdInputSchema = z.object({
	id: z
		.string({
			required_error: "ID do lead não informado.",
			invalid_type_error: "Tipo não válido para o ID do lead.",
		})
		.refine((id) => ObjectId.isValid(id), {
			message: "O ID do lead não é válido.",
		}),
});
export const GetLeadsInputSchema = z.union([GetLeadByIdInputSchema, GetManyLeadsInputSchema]);

export const CreateOneLeadInputSchema = z.object({
	type: z.literal("single"),
	lead: LeadSchema,
});
export const CreateManyLeadInputSchema = z.object({
	type: z.literal("multiple"),
	leads: z.array(LeadSchema),
});
export const CreateLeadInputSchema = z.union([CreateOneLeadInputSchema, CreateManyLeadInputSchema]);

export const UpdateLeadInputSchema = z.object({
	id: z
		.string({
			required_error: "ID do lead não informado.",
			invalid_type_error: "Tipo não válido para o ID do lead.",
		})
		.refine((id) => ObjectId.isValid(id), {
			message: "O ID do lead não é válido.",
		}),
	lead: LeadSchema.partial(),
});
