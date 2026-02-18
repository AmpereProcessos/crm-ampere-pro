import { ObjectId } from "mongodb";
import z from "zod";

const GeneralFileReferenceSchema = z.object({
	idCliente: z.string().optional().nullable(),
	idOportunidade: z.string().optional().nullable(),
	idProjeto: z.string({}).optional().nullable(),
	idAnaliseTecnica: z.string().optional().nullable(),
	idHomologacao: z.string().optional().nullable(),
	idCompra: z.string().optional().nullable(),
	idReceita: z.string().optional().nullable(),
	idDespesa: z.string().optional().nullable(),
	idOrdemServico: z.string().optional().nullable(),
	idParceiro: z.string(),
	titulo: z.string(),
	formato: z.string(),
	url: z.string(),
	tamanho: z.number().optional().nullable(),
	categorias: z.array(z.string({})).optional().nullable(),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});

export const InsertFileReferenceSchema = z.object({
	idOportunidade: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de oportunidade.",
		})
		.optional()
		.nullable(),
	idCliente: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de cliente.",
		})
		.optional()
		.nullable(),
	idProjeto: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de projeto.",
		})
		.optional()
		.nullable(),
	idCompra: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de compra.",
		})
		.optional()
		.nullable(),
	idReceita: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de receita.",
		})
		.optional()
		.nullable(),
	idDespesa: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de despesa.",
		})
		.optional()
		.nullable(),
	idOrdemServico: z
		.string({
			invalid_type_error: "Tipo não válido para a referência de ordem de serviço.",
		})
		.optional()
		.nullable(),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informada.",
		invalid_type_error: "Tipo não válida para referência a parceiro.",
	}),
	idAnaliseTecnica: z
		.string({
			required_error: "Referência de análise técnica não informada.",
			invalid_type_error: "Tipo não válido para a referência de análise técnica.",
		})
		.optional()
		.nullable(),
	idHomologacao: z
		.string({
			required_error: "Referência de homologação não informada.",
			invalid_type_error: "Tipo não válido para a referência de homologação.",
		})
		.optional()
		.nullable(),
	titulo: z
		.string({
			required_error: "Titulo do arquivo não informado.",
			invalid_type_error: "Tipo não válido para titulo do arquivo.",
		})
		.min(2, "É necessário que o titulo do arquivo tenha ao menos 2 caracteres."),
	formato: z.string({
		required_error: "Formato do arquivo não informado.",
		invalid_type_error: "Tipo não válido para o formato do arquivo.",
	}),
	url: z.string({
		required_error: "URL do arquivo não informada.",
		invalid_type_error: "Tipo válido para a URL do arquivo.",
	}),
	tamanho: z
		.number({
			required_error: "Tamanho do arquivo não informado.",
			invalid_type_error: "Tipo não válido para o tamanho do arquivo.",
		})
		.optional()
		.nullable(),
	categorias: z
		.array(
			z.string({
				required_error: "Categoria do arquivo não informada.",
				invalid_type_error: "Tipo não válido para a categoria do arquivo.",
			}),
		)
		.optional()
		.nullable(),

	autor: z.object({
		id: z.string({
			required_error: "ID do criador do arquivo não informado.",
			invalid_type_error: "Tipo não válido para id do criador do arquivo.",
		}),
		nome: z.string({
			required_error: "Nome do criador do arquivo não informado.",
			invalid_type_error: "Tipo não válido para nome do criador do arquivo.",
		}),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});

const FileReferenceEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	idCliente: z.string().optional().nullable(),
	idOportunidade: z.string().optional().nullable(),
	idAnaliseTecnica: z.string().optional().nullable(),
	idHomologacao: z.string().optional().nullable(),
	idProjeto: z.string().optional().nullable(),
	idCompra: z.string().optional().nullable(),
	idReceita: z.string().optional().nullable(),
	idDespesa: z.string().optional().nullable(),
	idOrdemServico: z.string().optional().nullable(),
	idParceiro: z.string(),
	titulo: z.string(),
	formato: z.string(),
	url: z.string(),
	tamanho: z.number().optional().nullable(),
	categorias: z.array(z.string()).optional().nullable(),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});

export type TFileReference = z.infer<typeof GeneralFileReferenceSchema>;

export type TFileReferenceEntity = z.infer<typeof FileReferenceEntitySchema>;

export type TFileReferenceDTO = TFileReference & { _id: string };

export type TFileHolder = { [key: string]: File | string | null };
export type TFileListHolder = { [key: string]: FileList | string | null };

export const FileReferencesQueryParamsSchema = z.object({
	clientId: z.string({ invalid_type_error: "Tipo inválido para referência de cliente." }).optional().nullable(),
	opportunityId: z
		.string({
			invalid_type_error: "Tipo inválido para referência de oportunidade.",
		})
		.optional()
		.nullable(),
	analysisId: z
		.string({
			invalid_type_error: "Tipo inválido para referência de análise técnica.",
		})
		.optional()
		.nullable(),
	homologationId: z
		.string({
			invalid_type_error: "Tipo inválido para referência de homologação.",
		})
		.optional()
		.nullable(),
	projectId: z.string({ invalid_type_error: "Tipo inválido para referência de projeto." }).optional().nullable(),
	purchaseId: z.string({ invalid_type_error: "Tipo inválido para referência de compra." }).optional().nullable(),
	revenueId: z.string({ invalid_type_error: "Tipo inválido para referência de receita." }).optional().nullable(),
	expenseId: z.string({ invalid_type_error: "Tipo inválido para referência de despesa." }).optional().nullable(),
	serviceOrderId: z
		.string({
			invalid_type_error: "Tipo inválido para referência de ordem de serviço.",
		})
		.optional()
		.nullable(),
});

export type TFileReferencesQueryParams = z.infer<typeof FileReferencesQueryParamsSchema>;
export type TFileReferenceVinculations = {
	userId?: {
		blocked: boolean;
		value: string;
	};
	clientId?: {
		blocked: boolean;
		value: string;
	};
	opportunityId?: {
		blocked: boolean;
		value: string;
	};
	technicalAnalysisId?: {
		blocked: boolean;
		value: string;
	};
	homologationId?: {
		blocked: boolean;
		value: string;
	};
	projectId?: {
		blocked: boolean;
		value: string;
	};
	purchaseId?: {
		blocked: boolean;
		value: string;
	};
	revenueId?: {
		blocked: boolean;
		value: string;
	};
	expenseId?: {
		blocked: boolean;
		value: string;
	};
	serviceOrderId?: {
		blocked: boolean;
		value: string;
	};
};
