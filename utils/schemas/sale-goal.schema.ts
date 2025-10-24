import { z } from "zod";
import { AuthorSchema } from "./user.schema";
import { ObjectId } from "mongodb";

const GeneralSaleGoalSchema = z.object({
	periodo: z.string(),
	periodoFim: z.string(),
	periodoInicio: z.string(),
	periodoDias: z.number(),
	idParceiro: z.string(),
	usuario: AuthorSchema,
	metas: z.object({
		projetosCriados: z.number().optional().nullable(),
		potenciaVendida: z.number().optional().nullable(),
		valorVendido: z.number().optional().nullable(),
		projetosVendidos: z.number().optional().nullable(),
		projetosEnviados: z.number().optional().nullable(),
		conversao: z.number().optional().nullable(),
	}),
	autor: AuthorSchema,
	dataInsercao: z.string().datetime(),
});

export const InsertSaleGoalSchema = z.object({
	periodo: z.string({ required_error: "Período de meta não informado.", invalid_type_error: "Tipo não válido para período de meta." }),
	periodoFim: z.string(),
	periodoInicio: z.string(),
	periodoDias: z.number(),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	usuario: AuthorSchema,
	metas: z.object({
		projetosCriados: z
			.number({ required_error: "Meta de projetos criados não informada.", invalid_type_error: "Tipo não válido para meta de projetos criados." })
			.optional()
			.nullable(),
		potenciaVendida: z
			.number({ required_error: "Meta de potência vendida não informada.", invalid_type_error: "Tipo não válido para meta de potência vendida." })
			.optional()
			.nullable(),
		valorVendido: z
			.number({ required_error: "Meta de valor vendido não informada.", invalid_type_error: "Tipo não válido para meta de valor vendido." })
			.optional()
			.nullable(),
		projetosVendidos: z
			.number({ required_error: "Meta de projetos vendidos não informada.", invalid_type_error: "Tipo não válido para meta de projetos vendidos." })
			.optional()
			.nullable(),
		projetosEnviados: z
			.number({ required_error: "Meta de projetos enviados não informada.", invalid_type_error: "Tipo não válido para meta de projetos enviados." })
			.optional()
			.nullable(),
		conversao: z
			.number({ required_error: "Meta de conversão não informada.", invalid_type_error: "Tipo não válido para meta de conversão." })
			.optional()
			.nullable(),
	}),
	autor: AuthorSchema,
	dataInsercao: z.string().datetime(),
});

const SaleGoalEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	periodo: z.string(),
	periodoFim: z.string(),
	periodoInicio: z.string(),
	periodoDias: z.number(),
	idParceiro: z.string(),
	usuario: AuthorSchema,
	metas: z.object({
		projetosCriados: z.number().optional().nullable(),
		potenciaVendida: z.number().optional().nullable(),
		valorVendido: z.number().optional().nullable(),
		projetosVendidos: z.number().optional().nullable(),
		projetosEnviados: z.number().optional().nullable(),
		conversao: z.number().optional().nullable(),
	}),
	autor: AuthorSchema,
	dataInsercao: z.string().datetime(),
});

export type TSaleGoal = z.infer<typeof GeneralSaleGoalSchema>;

export type TSaleGoalDTO = TSaleGoal & { _id: string };
