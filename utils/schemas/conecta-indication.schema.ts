import { z } from "zod";
import { SaleCategorySchema } from "./opportunity.schema";

export const IndicationSchema = z.object({
	nome: z.string({ required_error: "Nome do indicado não informado.", invalid_type_error: "Tipo não válido para o nome do indicado." }),
	telefone: z.string({ required_error: "Telefone do indicado não informado.", invalid_type_error: "Tipo não válido para o telefone do indicado." }),
	uf: z.string({ required_error: "UF do indicado não informado.", invalid_type_error: "Tipo não válido para o UF do indicado." }),
	cidade: z.string({ required_error: "Cidade do indicado não informado.", invalid_type_error: "Tipo não válido para a cidade do indicado." }),
	tipo: z.object({
		id: z.string({
			required_error: "ID de referência do tipo de projeto não encontrado.",
			invalid_type_error: "Tipo não válido para o ID de referência do tipo de projeto.",
		}),
		titulo: z.string({
			required_error: "Titulo do tipo de projeto não encontrado.",
			invalid_type_error: "Tipo não válido para o titulo do tipo de projeto.",
		}),
		categoriaVenda: SaleCategorySchema,
	}),
	oportunidade: z.object({
		id: z.string({
			required_error: "ID de referência da oportunidade não encontrado.",
			invalid_type_error: "Tipo não válido para o ID de referência da oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para nome da oportunidade.",
		}),
		identificador: z.string({
			required_error: "Identificador da oportunidade não informado.",
			invalid_type_error: "Tipo inválido para identificador da oportunidade.",
		}),
		dataGanho: z
			.string({ invalid_type_error: "Tipo não válido para data de ganho." })
			.datetime({ message: "Formato inválido para data de ganho." })
			.optional()
			.nullable(),
		dataPerda: z
			.string({ invalid_type_error: "Tipo não válido para data de perda." })
			.datetime({ message: "Formato inválido para data de perda." })
			.optional()
			.nullable(),
		dataInteracao: z
			.string({ invalid_type_error: "Tipo não válido para data de interação." })
			.datetime({ message: "Formato inválido para data de interação." })
			.optional()
			.nullable(),
	}),
	dataInsercao: z.string({ invalid_type_error: "Tipo não válido para data de inserção." }).datetime({ message: "Formato inválido para data de inserção." }),
	creditosRecebidos: z.number({ invalid_type_error: "Tipo não válido para o número de créditos recebidos." }).optional().nullable(),
	autor: z.object({
		id: z.string({
			required_error: "ID do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para id do criador da oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome do indicador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para nome do indicador da oportunidade.",
		}),
		avatar_url: z.string({ invalid_type_error: "Tipo não válido para o avatar do indicador da oportunidade." }).optional().nullable(),
	}),
});

export type TConectaIndication = z.infer<typeof IndicationSchema>;
export type TConectaIndicationDTO = TConectaIndication & { _id: string };
