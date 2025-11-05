import z from "zod";
import { PricingMethodologyReferenceSchema, TPricingMethodDTO } from "./pricing-method.schema";
import { PaymentMethodReferenceSchema } from "./payment-methods";

export const ModuleSchema = z.object({
	id: z.string({ invalid_type_error: "Tipo não válido para ID do módulo." }).optional().nullable(),
	fabricante: z.string({ required_error: "Fabricante do módulo não informado.", invalid_type_error: "Tipo não válido para o fabricante do módulo." }),
	modelo: z.string({ required_error: "Modelo do módulo não informado.", invalid_type_error: "Tipo não válido para o modelo do módulo." }),
	qtde: z.number({ required_error: "Quantidade do módulo não informada.", invalid_type_error: "Tipo não válido para a quantidade do módulo." }),
	potencia: z.number({ required_error: "Potência do módulo não informada.", invalid_type_error: "Tipo não válido para a potência do módulo." }),
	garantia: z.number({ required_error: "Garantia do módulo não informado.", invalid_type_error: "Tipo não válido para a garantia do módulo." }),
});
export type TModule = z.infer<typeof ModuleSchema>;

export const InverterSchema = z.object({
	id: z.string({ invalid_type_error: "Tipo não válido para ID do módulo." }).optional().nullable(),
	fabricante: z.string({
		required_error: "Fabricante do inversor não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do inversor.",
	}),
	modelo: z.string({ required_error: "Modelo do inversor não informado.", invalid_type_error: "Tipo não válido para o modelo do inversor." }),
	qtde: z.number({ required_error: "Quantidade do inversor não informada.", invalid_type_error: "Tipo não válido para a quantidade do inversor." }),
	potencia: z.number({ required_error: "Potência do inversor não informada.", invalid_type_error: "Tipo não válido para a potência do inversor." }),
	garantia: z.number({ required_error: "Garantia do inversor não informado.", invalid_type_error: "Tipo não válido para a garantia do inversor." }),
});
export type TInverter = z.infer<typeof InverterSchema>;

export const ProductItemSchema = z.object({
	id: z.string({ invalid_type_error: "Tipo não válido para ID do módulo." }).optional().nullable(),
	categoria: z.union([z.literal("MÓDULO"), z.literal("INVERSOR"), z.literal("INSUMO"), z.literal("ESTRUTURA"), z.literal("PADRÃO"), z.literal("OUTROS")]),
	fabricante: z.string({
		required_error: "Fabricante do produto não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do produto.",
	}),
	modelo: z.string({ required_error: "Modelo do produto não informado.", invalid_type_error: "Tipo não válido para o modelo do produto." }),
	qtde: z.number({ required_error: "Quantidade do produto não informada.", invalid_type_error: "Tipo não válido para a quantidade do produto." }),
	potencia: z
		.number({ required_error: "Potência do produto não informada.", invalid_type_error: "Tipo não válido para a potência do produto." })
		.optional()
		.nullable(),
	garantia: z.number({ required_error: "Garantia do produto não informada.", invalid_type_error: "Tipo não válido para a garantia do produto." }),
	valor: z.number({ required_error: "Valor do produto não informado.", invalid_type_error: "Tipo não válido para o valor do produto." }).optional().nullable(),
});
export type TProductItem = z.infer<typeof ProductItemSchema>;

export const ServiceItemSchema = z.object({
	id: z.string({ invalid_type_error: "Tipo não válido para ID do módulo." }).optional().nullable(),
	descricao: z.string({ required_error: "Descrição do serviço não informada.", invalid_type_error: "Tipo não válido para a descrição do serviço." }),
	observacoes: z.string({ required_error: "Observações do serviço não informadas.", invalid_type_error: "Tipo não válido para observações " }),
	garantia: z.number({ required_error: "Garantia do serviço não fornecida.", invalid_type_error: "Tipo não válido para garantia do serviço." }),
	valor: z.number({ required_error: "Valor do serviço não informado.", invalid_type_error: "Tipo não válido para o valor do serviço." }).optional().nullable(),
});

export type TServiceItem = z.infer<typeof ServiceItemSchema>;
const GeneralNewKitSchema = z.object({
	nome: z.string(),
	idParceiro: z.string().optional().nullable(),
	idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
	idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
	ativo: z.boolean(),
	topologia: z.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")]),
	potenciaPico: z.number(),
	preco: z.number(),
	estruturasCompativeis: z.array(z.string()),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	dataValidade: z.string().datetime().optional().nullable(),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});
export const InsertNewKitSchema = z.object({
	nome: z
		.string({ required_error: "Nome do kit não informado.", invalid_type_error: "Tipo não válido para o nome do kit." })
		.min(3, "É necessário que o nome do kit tenha ao menos 3 letras."),
	idParceiro: z.string({ required_error: "ID do parceiro não informado.", invalid_type_error: "Tipo não válido para o ID do parceiro." }).optional().nullable(),
	idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
	idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
	ativo: z.boolean({
		required_error: "Status de ativação do kit não informado.",
		invalid_type_error: "Tipo não válido para o status de ativação do kit.",
	}),
	topologia: z.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")], {
		required_error: "Topologia do kit não informada.",
		invalid_type_error: "Tipo não válido para a topologia do kit.",
	}),
	potenciaPico: z.number({
		required_error: "Potência pico do kit não informada.",
		invalid_type_error: "Tipo não válido para a potência pico do kit.",
	}),
	preco: z
		.number({ required_error: "Preço do kit não informado.", invalid_type_error: "Tipo não válido para o preço do kit." })
		.min(0, "É necessário que o preço do kit seja maior do 0."),
	estruturasCompativeis: z.array(z.string(), {
		required_error: "Estruturas compatíveis com o kit não informadas.",
		invalid_type_error: "Tipo não válido para as estruturas compatíveis com o kit.",
	}),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	dataValidade: z.string().datetime({ message: "Formato inválido para a data de validade do kit." }).optional().nullable(),
	autor: z.object({
		id: z.string({ required_error: "ID do autor não informado.", invalid_type_error: "Tipo não válido para ID do autor." }),
		nome: z.string({ required_error: "Nome do autor não informado.", invalid_type_error: "Tipo não válido para o nome do autor." }),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});
export const KitDTOSchema = z.object({
	_id: z.string(),
	nome: z
		.string({ required_error: "Nome do kit não informado.", invalid_type_error: "Tipo não válido para o nome do kit." })
		.min(3, "É necessário que o nome do kit tenha ao menos 3 letras."),
	idParceiro: z.string({ required_error: "ID do parceiro não informado.", invalid_type_error: "Tipo não válido para o ID do parceiro." }).optional().nullable(),
	idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
	idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
	ativo: z.boolean({
		required_error: "Status de ativação do kit não informado.",
		invalid_type_error: "Tipo não válido para o status de ativação do kit.",
	}),
	topologia: z.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")], {
		required_error: "Topologia do kit não informada.",
		invalid_type_error: "Tipo não válido para a topologia do kit.",
	}),
	potenciaPico: z.number({
		required_error: "Potência pico do kit não informada.",
		invalid_type_error: "Tipo não válido para a potência pico do kit.",
	}),
	preco: z
		.number({ required_error: "Preço do kit não informado.", invalid_type_error: "Tipo não válido para o preço do kit." })
		.min(0, "É necessário que o preço do kit seja maior do 0."),
	estruturasCompativeis: z.array(z.string(), {
		required_error: "Estruturas compatíveis com o kit não informadas.",
		invalid_type_error: "Tipo não válido para as estruturas compatíveis com o kit.",
	}),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	dataValidade: z.string().datetime({ message: "Formato inválido para a data de validade do kit." }).optional().nullable(),
	autor: z.object({
		id: z.string({ required_error: "ID do autor não informado.", invalid_type_error: "Tipo não válido para ID do autor." }),
		nome: z.string({ required_error: "Nome do autor não informado.", invalid_type_error: "Tipo não válido para o nome do autor." }),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});

export type TKit = z.infer<typeof GeneralNewKitSchema>;

export type TKitDTO = TKit & { _id: string };

export type TKitDTOWithPricingMethod = TKitDTO & { metodologia: TPricingMethodDTO };

export const KitsBulkOperationItemSchema = z.object({
	ID: z
		.string({ required_error: "ID de referência do kit não informado.", invalid_type_error: "Tipo não válido para o ID de referência do kit." })
		.optional()
		.nullable(),
	ATIVO: z.union([z.literal("SIM"), z.literal("NÃO")], {
		required_error: "Status de ativação não informado.",
		invalid_type_error: "Tipo não válido para o status de ativação do kit.",
	}),
	NOME: z.string({ required_error: "Nome do kit não informado.", invalid_type_error: "Tipo não válido para o nome do kit." }),
	TOPOLOGIA: z.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")], {
		required_error: "Topologia não informada.",
		invalid_type_error: "Tipo não válido para a topologia do kit.",
	}),
	PREÇO: z.number({ required_error: "Preço do kit não informado.", invalid_type_error: "Tipo não válido para o preço do kit." }),
	"VISIBILIDADE DE PARCEIRO": z.string({
		required_error: "Visibilidade de parceiro do kit não informada..",
		invalid_type_error: "Tipo não válido para a visibilidade de parceiro do kit.",
	}),
	"METODOLOGIA DE PRECIFICAÇÃO": z.string({
		required_error: "Metodologia de precificação do kit não informada..",
		invalid_type_error: "Tipo não válido para a metodologia de precificação do kit.",
	}),
	"DATA DE VALIDADE": z
		.union([z.string(), z.number()], {
			required_error: "Data de validade do kit não informada.",
			invalid_type_error: "Tipo não válido para a data de validade do kit.",
		})
		.optional()
		.nullable(),
	"TIPO DE ESTRUTURA": z.string({
		required_error: "Tipo de estrutura do kit não informada.",
		invalid_type_error: "Tipo não válido para o tipo de estrutura do kit.",
	}),
	"CATEGORIA PRODUTO 1": z.union(
		[z.literal("MÓDULO"), z.literal("INVERSOR"), z.literal("INSUMO"), z.literal("ESTRUTURA"), z.literal("PADRÃO"), z.literal("OUTROS")],
		{ required_error: "Categoria do produto 1 não informada.", invalid_type_error: "Tipo não válido para a categoria do produto 1." },
	),
	"FABRICANTE PRODUTO 1": z.string({
		required_error: "Fabricante do produto 1 não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do produto 1.",
	}),
	"MODELO PRODUTO 1": z.string({
		required_error: "Modelo do produto 1 não informado.",
		invalid_type_error: "Tipo não válido para o modelo do produto 1.",
	}),
	"POTÊNCIA PRODUTO 1": z
		.number({
			required_error: "Potência do produto 1 não informado.",
			invalid_type_error: "Tipo não válido para a potência do produto 1.",
		})
		.optional()
		.nullable(),
	"QUANTIDADE PRODUTO 1": z.number({
		required_error: "Quantidade do produto 1 não informado.",
		invalid_type_error: "Tipo não válido para a quantidade do produto 1.",
	}),
	"GARANTIA PRODUTO 1": z.number({
		required_error: "Garantia do produto 1 não informado.",
		invalid_type_error: "Tipo não válido para a garantia do produto 1.",
	}),
	"CATEGORIA PRODUTO 2": z
		.union([z.literal("MÓDULO"), z.literal("INVERSOR"), z.literal("INSUMO"), z.literal("ESTRUTURA"), z.literal("PADRÃO"), z.literal("OUTROS")], {
			required_error: "Categoria do produto 2 não informada.",
			invalid_type_error: "Tipo não válido para a categoria do produto 2.",
		})
		.optional()
		.nullable(),
	"FABRICANTE PRODUTO 2": z
		.string({
			required_error: "Fabricante do produto 2 não informado.",
			invalid_type_error: "Tipo não válido para o fabricante do produto 2.",
		})
		.optional()
		.nullable(),
	"MODELO PRODUTO 2": z
		.string({
			required_error: "Modelo do produto 2 não informado.",
			invalid_type_error: "Tipo não válido para o modelo do produto 2.",
		})
		.optional()
		.nullable(),
	"POTÊNCIA PRODUTO 2": z
		.number({
			required_error: "Potência do produto 2 não informado.",
			invalid_type_error: "Tipo não válido para a potência do produto 2.",
		})
		.optional()
		.nullable(),
	"QUANTIDADE PRODUTO 2": z
		.number({
			required_error: "Quantidade do produto 2 não informado.",
			invalid_type_error: "Tipo não válido para a quantidade do produto 2.",
		})
		.optional()
		.nullable(),
	"GARANTIA PRODUTO 2": z
		.number({
			required_error: "Garantia do produto 2 não informado.",
			invalid_type_error: "Tipo não válido para a garantia do produto 2.",
		})
		.optional()
		.nullable(),
	"DESCRIÇÃO SERVIÇO 1": z
		.string({
			required_error: "Descrição do serviço 1 não informada.",
			invalid_type_error: "Tipo não válido para a descrição do serviço 1.",
		})
		.optional()
		.nullable(),
	"GARANTIA SERVIÇO 1": z
		.number({
			required_error: "Garantia do serviço 1 não informada.",
			invalid_type_error: "Tipo não válido para a garantia do serviço 1.",
		})
		.optional()
		.nullable(),
	"DESCRIÇÃO SERVIÇO 2": z
		.string({
			required_error: "Descrição do serviço 2 não informada.",
			invalid_type_error: "Tipo não válido para a descrição do serviço 2.",
		})
		.optional()
		.nullable(),
	"GARANTIA SERVIÇO 2": z
		.number({
			required_error: "Garantia do serviço 2 não informada.",
			invalid_type_error: "Tipo não válido para a garantia do serviço 2.",
		})
		.optional()
		.nullable(),
	EXCLUIR: z.union([z.literal("SIM"), z.literal("NÃO")], {
		required_error: "Operação de exclusão não informada não informado.",
		invalid_type_error: "Tipo não válido para a operação de exclusão.",
	}),
});

export type TBulkOperationKit = z.infer<typeof KitsBulkOperationItemSchema>;
