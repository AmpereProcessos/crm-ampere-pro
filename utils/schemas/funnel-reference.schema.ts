import { ObjectId } from "mongodb";
import { z } from "zod";

const StagesInformationSchema = z.record(
	z.object({
		entrada: z
			.string({ required_error: "Data de entrada no estágio não informada.", invalid_type_error: "Tipo não válido para data de entrada no estágio." })
			.optional()
			.nullable(),
		saida: z
			.string({ required_error: "Data de saída no estágio não informada.", invalid_type_error: "Tipo não válido para data de saída no estágio." })
			.optional()
			.nullable(),
	}),
);

const GeneralFunnelReferenceSchema = z.object({
	idParceiro: z.string(),
	idOportunidade: z.string(),
	idFunil: z.string(),
	idEstagioFunil: z.union([z.string(), z.number()]),
	estagios: StagesInformationSchema,
	dataInsercao: z.string().datetime(),
});

export const InsertFunnelReferenceSchema = z.object({
	idParceiro: z.string({
		required_error: "Referência ao parceiro não informada.",
		invalid_type_error: "Tipo não válido para referência ao parceiro.",
	}),
	idOportunidade: z.string({
		required_error: "Referência a oportunidade não informada.",
		invalid_type_error: "Tipo não válido para referência a oportunidade.",
	}),
	idFunil: z
		.string({
			required_error: "Referência a funil não informada.",
			invalid_type_error: "Tipo não válido para referência a funil.",
		})
		.min(15, "Funil inválido."),
	idEstagioFunil: z.union([z.string(), z.number()], {
		required_error: "Referência a estagio do funil não informada.",
		invalid_type_error: "Tipo não válido para referência a estagio do funil.",
	}),
	estagios: StagesInformationSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para data de inserção." })
		.datetime({ message: "Formato de date inválido." }),
});

const FunnelReferenceEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	idParceiro: z.string(),
	idOportunidade: z.string(),
	idFunil: z.string(),
	idEstagioFunil: z.union([z.string(), z.number()]),
	estagios: StagesInformationSchema,
	dataInsercao: z.string().datetime(),
});

export type TFunnelReference = z.infer<typeof GeneralFunnelReferenceSchema>;
export type TFunnelReferenceDTO = TFunnelReference & { _id: string };
export type TFunnelReferenceEntity = z.infer<typeof FunnelReferenceEntitySchema>;
