import { z } from "zod";
import { UnitSchema } from "./purchase.schema";
import { AuthorSchema } from "./user.schema";

const StockMaterialNoteSchema = z.object({
	data: z
		.string({ required_error: "Data da atualização não informada.", invalid_type_error: "Tipo inválido para a data de atualização." })
		.datetime({ message: "Formato inválido para a data da atualização." }),
	descricao: z.string({
		required_error: "Descrição da atualização não informada.",
		invalid_type_error: "Tipo não válido para a descrição da atualização.",
	}),
	autor: AuthorSchema,
});

const GeneralStockMaterialSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro não informado.",
		invalid_type_error: "Tipo não válido para ID de referência do parceiro.",
	}),
	nome: z.string({ required_error: "Nome do material não informado.", invalid_type_error: "Tipo não válido para o nome do material." }),
	nomeTecnico: z.string({
		required_error: "Nome técnico do material não informado.",
		invalid_type_error: "Tipo não válido para o nome técnico do material.",
	}),
	qtde: z.number({ required_error: "Quantidade do material não informada.", invalid_type_error: "Tipo não válido para a quantidade do material." }),
	qtdeMinima: z
		.number({
			required_error: "Quantidade mínima do material não informada.",
			invalid_type_error: "Tipo não válido para a quantidade mínima do material.",
		})
		.optional()
		.nullable(),
	qtdeMaxima: z
		.number({
			required_error: "Quantidade máxima do material não informada.",
			invalid_type_error: "Tipo não válido para a quantidade máxima do material.",
		})
		.optional()
		.nullable(),
	unidade: UnitSchema,
	localizacao: z.string({
		required_error: "Localização do material não informada.",
		invalid_type_error: "Tipo não válido para a localização do material.",
	}),
	codigo: z.string({ required_error: "Código do material não informado.", invalid_type_error: "Tipo não válido para o código do material." }),
	precoUnitario: z.number({
		required_error: "Preço unitário do material não informado.",
		invalid_type_error: "Tipo não válido para o preço unitário do material.",
	}),
	anotacoes: z.array(StockMaterialNoteSchema),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});

export const InsertStockMaterialSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro não informado.",
		invalid_type_error: "Tipo não válido para ID de referência do parceiro.",
	}),
	nome: z.string({ required_error: "Nome do material não informado.", invalid_type_error: "Tipo não válido para o nome do material." }),
	nomeTecnico: z.string({
		required_error: "Nome técnico do material não informado.",
		invalid_type_error: "Tipo não válido para o nome técnico do material.",
	}),
	qtde: z.number({ required_error: "Quantidade do material não informada.", invalid_type_error: "Tipo não válido para a quantidade do material." }),
	qtdeMinima: z
		.number({
			required_error: "Quantidade mínima do material não informada.",
			invalid_type_error: "Tipo não válido para a quantidade mínima do material.",
		})
		.optional()
		.nullable(),
	qtdeMaxima: z
		.number({
			required_error: "Quantidade máxima do material não informada.",
			invalid_type_error: "Tipo não válido para a quantidade máxima do material.",
		})
		.optional()
		.nullable(),
	unidade: UnitSchema,
	localizacao: z.string({
		required_error: "Localização do material não informada.",
		invalid_type_error: "Tipo não válido para a localização do material.",
	}),
	codigo: z.string({ required_error: "Código do material não informado.", invalid_type_error: "Tipo não válido para o código do material." }),
	precoUnitario: z.number({
		required_error: "Preço unitário do material não informado.",
		invalid_type_error: "Tipo não válido para o preço unitário do material.",
	}),
	anotacoes: z.array(StockMaterialNoteSchema),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});

export type TStockMaterial = z.infer<typeof GeneralStockMaterialSchema>;
export type TStockMaterialDTO = TStockMaterial & { _id: string };
