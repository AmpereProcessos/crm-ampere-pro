import z from "zod";

// Native block keys for kanban card configuration
export const KanbanCardNativeBlockKeyEnum = z.enum(["TIPO_OPORTUNIDADE", "PROPOSTA_ATIVA", "RESPONSAVEIS_E_DATA", "INFO_CLIENTE", "LOCALIZACAO", "SEGMENTO"]);

// Block entry: either native or custom field
export const KanbanCardBlockSchema = z.discriminatedUnion("tipo", [
	z.object({
		tipo: z.literal("NATIVO"),
		chave: KanbanCardNativeBlockKeyEnum,
		ativo: z.boolean().default(true),
		ordem: z.number().int().min(0),
	}),
	z.object({
		tipo: z.literal("CAMPO_PERSONALIZADO"),
		campoPersonalizadoId: z.string(),
		ativo: z.boolean().default(true),
		ordem: z.number().int().min(0),
	}),
]);

export const KanbanCardConfigSchema = z.object({
	blocos: z.array(KanbanCardBlockSchema),
});

export type TKanbanCardNativeBlockKey = z.infer<typeof KanbanCardNativeBlockKeyEnum>;
export type TKanbanCardBlock = z.infer<typeof KanbanCardBlockSchema>;
export type TKanbanCardConfig = z.infer<typeof KanbanCardConfigSchema>;

// Default config matching current card behavior
export const DEFAULT_KANBAN_CARD_BLOCKS: TKanbanCardBlock[] = [
	{ tipo: "NATIVO", chave: "TIPO_OPORTUNIDADE", ativo: true, ordem: 0 },
	{ tipo: "NATIVO", chave: "PROPOSTA_ATIVA", ativo: true, ordem: 1 },
	{ tipo: "NATIVO", chave: "RESPONSAVEIS_E_DATA", ativo: true, ordem: 2 },
];

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
	configuracaoCartao: KanbanCardConfigSchema.optional().nullable(),
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
	configuracaoCartao: KanbanCardConfigSchema.optional().nullable(),
});

const FunnelEntitySchema = z.object({
	_id: z.string(),
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
	configuracaoCartao: KanbanCardConfigSchema.optional().nullable(),
});

export type TFunnel = z.infer<typeof GeneralFunnelSchema>;

export type TFunnelEntity = z.infer<typeof FunnelEntitySchema>;
export type TFunnelDTO = TFunnel & { _id: string };
