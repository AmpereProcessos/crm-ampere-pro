import { z } from "zod";
import { AuthorSchema } from "./user.schema";

export const EntityEnum = z.enum(["CLIENTES", "OPORTUNIDADES", "PROPOSTAS"]);

export const SelectOptionSchema = z.object({
	valor: z.string().min(1),
	rotulo: z.string().min(1),
	cor: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional(),
	icone: z.string().optional(),
	ordem: z.number().int().default(0),
	ativo: z.boolean().default(true),
});
export type TSelectOption = z.infer<typeof SelectOptionSchema>;

export const TextValidationSchema = z.object({
	tipo: z.literal("texto"),
	minCaracteres: z.number().int().min(0).optional(),
	maxCaracteres: z.number().int().min(1).optional(),
	padrao: z.string().optional(), // Regex pattern
	mascara: z.string().optional(), // Ex: "(##) #####-####"
});

/**
 * Validações para campos numéricos
 */
export const NumberValidationSchema = z.object({
	tipo: z.literal("numero"),
	minimo: z.number().optional(),
	maximo: z.number().optional(),
	casasDecimais: z.number().int().min(0).max(10).optional(),
	permitirNegativo: z.boolean().default(true),
});

/**
 * Validações para campos de seleção
 */
export const SelectionValidationSchema = z.object({
	tipo: z.literal("selecao"),
	opcoes: z.array(SelectOptionSchema).min(1),
	permitirOutros: z.boolean().default(false), // Permite valor não listado
	minSelecoes: z.number().int().min(0).optional(),
	maxSelecoes: z.number().int().min(1).optional(),
});

/**
 * Validações para campos de data
 */
export const DateValidationSchema = z.object({
	tipo: z.literal("data"),
	dataMinima: z.date().optional(),
	dataMaxima: z.date().optional(),
	permitirPassado: z.boolean().default(true),
	permitirFuturo: z.boolean().default(true),
});

/**
 * Validações para campos de arquivo
 */
export const FileValidationSchema = z.object({
	tipo: z.literal("arquivo"),
	tiposPermitidos: z.array(z.string()).optional(), // MIME types
	tamanhoMaximoMB: z.number().min(0.1).max(100).default(10),
	multiplosArquivos: z.boolean().default(false),
	maxArquivos: z.number().int().min(1).default(5),
});

/**
 * Validações para campos de referência
 */
export const ReferenceValidationSchema = z.object({
	tipo: z.literal("referencia"),
	entidadeReferenciada: EntityEnum,
	multiplosValores: z.boolean().default(false),
	filtros: z.record(z.unknown()).optional(), // Filtros para limitar opções
});

/**
 * União de todas as validações
 */
export const CustomFieldValidationSchema = z.discriminatedUnion("tipo", [
	TextValidationSchema,
	NumberValidationSchema,
	SelectionValidationSchema,
	DateValidationSchema,
	FileValidationSchema,
	ReferenceValidationSchema,
]);

export const CustomFieldHeritageSchema = z.object({
	/**
	 * Entidade de origem para herança
	 */
	entidadeOrigem: EntityEnum,

	/**
	 * Campo específico na entidade de origem (se diferente)
	 * Se não informado, usa o mesmo identificador
	 */
	campoOrigem: z.string().optional(),

	/**
	 * Comportamento da herança
	 */
	comportamento: z
		.enum([
			"copiar", // Copia o valor uma vez (na criação)
			"sincronizar", // Mantém sincronizado (atualiza quando origem muda)
			"sugerir", // Sugere o valor mas permite alteração
		])
		.default("copiar"),

	/**
	 * Se permite sobrescrever o valor herdado
	 */
	permitirSobrescrita: z.boolean().default(true),

	/**
	 * Condição para aplicar a herança (expressão)
	 */
	condicao: z.string().optional(),
});
export type TCustomFieldHeritage = z.infer<typeof CustomFieldHeritageSchema>;

export const CustomFieldSchema = z.object({
	ativo: z.boolean({
		required_error: "Status de ativação do campo personalizado não informado.",
		invalid_type_error: "Tipo não válido para status de ativação do campo personalizado.",
	}),
	identificador: z
		.string({
			required_error: "Identificador não informado.",
			invalid_type_error: "Tipo não válido para identificador.",
		})
		.min(2)
		.max(50)
		.regex(/^[a-z][a-z0-9_-]*$/, {
			message: "Identificador deve começar com letra e conter apenas letras minúsculas, números, underscore ou hífen (-)",
		}),
	nome: z
		.string({
			required_error: "Nome não informado.",
			invalid_type_error: "Tipo não válido para nome.",
		})
		.min(1)
		.max(100),
	descricao: z
		.string({
			invalid_type_error: "Tipo não válido para descrição.",
		})
		.max(500)
		.optional(),
	placeholder: z
		.string({
			invalid_type_error: "Tipo não válido para placeholder.",
		})
		.max(100)
		.optional(),
	tipo: z.enum(
		[
			// Texto
			"TEXTO",
			"TEXTO_LONGO",
			"EMAIL",
			"TELEFONE",
			"URL",
			"CPF",
			"CNPJ",
			"DOCUMENTO", // CPF ou CNPJ

			// Numéricos
			"NÚMERO_INTEIRO",
			"NÚMERO_DECIMAL",
			"MOEDA",
			"PERCENTUAL",

			// Seleção
			"SELEÇÃO_ÚNICA",
			"SELEÇÃO_MÚLTIPLA",
			"BOOLEAN",

			// Data/Hora
			"DATA",
			"DATA_HORA",
			"HORA",

			// Arquivos
			"ARQUIVO",
			"IMAGEM",

			// Especiais
			"COR",
			"AVALIAÇÃO", // 1-5 estrelas
			"REFERÊNCIA", // Referência a outra entidade
		],
		{
			required_error: "Tipo não informado.",
			invalid_type_error: "Tipo não válido para tipo.",
		},
	),
	tiposProjetos: z.array(
		z.string({
			required_error: "Tipos de projetos não informados.",
			invalid_type_error: "Tipo não válido para tipos de projetos.",
		}),
	),
	entidades: z.array(EntityEnum),
	obrigatorio: z.record(EntityEnum, z.boolean()).default({}),
	valorPadrao: z.unknown().optional(),
	validacao: CustomFieldValidationSchema.optional(),
	heranca: z.record(EntityEnum, CustomFieldHeritageSchema).default({}),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção não informada.",
			invalid_type_error: "Tipo não válido para data de inserção.",
		})
		.datetime({ message: "Tipo não válido para data de inserção." }),
});
export type TCustomField = z.infer<typeof CustomFieldSchema>;

export const CustomFieldReferenceValueSchema = z.object({
	campo: z.object({
		id: z.string({
			required_error: "ID do campo personalizado não informado.",
			invalid_type_error: "Tipo não válido para ID do campo personalizado.",
		}),
		identificador: z.string({
			required_error: "Identificador do campo personalizado não informado.",
			invalid_type_error: "Tipo não válido para identificador do campo personalizado.",
		}),
		nome: z.string({
			required_error: "Nome do campo personalizado não informado.",
			invalid_type_error: "Tipo não válido para nome do campo personalizado.",
		}),
	}),
	valor: z.unknown(),
	herdado: z
		.boolean({
			required_error: "Status de herdado do campo personalizado não informado.",
			invalid_type_error: "Tipo não válido para status de herdado do campo personalizado.",
		})
		.default(false),
	modificado: z
		.boolean({
			required_error: "Status de modificado do campo personalizado não informado.",
			invalid_type_error: "Tipo não válido para status de modificado do campo personalizado.",
		})
		.default(false)
		.describe("Indica se o valor foi modificado após a herança."),
	dataAtualizacao: z
		.string({
			required_error: "Data de atualização do campo personalizado não informada.",
			invalid_type_error: "Tipo não válido para data de atualização do campo personalizado.",
		})
		.datetime({ message: "Tipo não válido para data de atualização do campo personalizado." })
		.default(() => new Date().toISOString()),
});
export const CustomFieldReferenceSchema = z.record(
	z.string({
		required_error: "ID do campo personalizado não informado.",
		invalid_type_error: "Tipo não válido para ID do campo personalizado.",
	}),
	CustomFieldReferenceValueSchema,
);
export type TCustomFieldReference = z.infer<typeof CustomFieldReferenceSchema>;
