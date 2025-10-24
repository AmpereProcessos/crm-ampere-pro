import { ObjectId } from "mongodb";
import z from "zod";
const GeneralFunnelSchema = z.object({
	nome: z.string(),
	descricao: z.string(),
	idParceiro: z.string().optional().nullable(),
	etapas: z.array(
		z.object({
			id: z.union([z.string(), z.number()]),
			nome: z.string(),
		}),
	),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string(),
});

export const InsertFunnelSchema = z.object({
	nome: z
		.string({ required_error: "Nome do funil não informado.", invalid_type_error: "Tipo não válido para o nome do funil." })
		.min(3, "É necessário um nome de ao menos 3 letras para o funil."),
	descricao: z.string({ required_error: "Descrição do funil não informada.", invalid_type_error: "Tipo não válido para a descrição do funil." }),
	idParceiro: z
		.string({
			required_error: "Identificação do parceiro não informado.",
			invalid_type_error: "Tipo não válido para a identificação do parceiro.",
		})
		.optional()
		.nullable(),
	etapas: z
		.array(
			z.object({
				id: z.union([z.string(), z.number()]),
				nome: z.string(),
			}),
		)
		.nonempty({ message: "É necessário ao menos duas etapas para criação do funil." })
		.min(2, "É necessário ao menos duas etapas para criação do funil."),
	autor: z.object({
		id: z.string({ required_error: "ID do autor não informado.", invalid_type_error: "Tipo não válido para ID do autor." }),
		nome: z.string({ required_error: "Nome do autor não informado.", invalid_type_error: "Tipo não válido para o nome do autor." }),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." }),
});

const FunnelEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	nome: z.string(),
	descricao: z.string(),
	idParceiro: z.string().optional().nullable(),
	etapas: z.array(
		z.object({
			id: z.union([z.string(), z.number()]),
			nome: z.string(),
		}),
	),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string(),
});

export type TFunnel = z.infer<typeof GeneralFunnelSchema>;

export type TFunnelEntity = z.infer<typeof FunnelEntitySchema>;
export type TFunnelDTO = TFunnel & { _id: string };
