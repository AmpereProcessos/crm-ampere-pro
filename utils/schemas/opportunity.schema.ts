import z from "zod";
import { GeneralClientSchema, type TClientDTO } from "./client.schema";

import type { ActivitiesByStatus } from "@/pages/api/opportunities";
import type { TActivityDTO } from "./activities.schema";
import type { TFunnelReference, TFunnelReferenceDTO } from "./funnel-reference.schema";
import { OpportunityInteractionTypesEnum } from "./opportunity-history.schema";
import type { TPartnerSimplifiedDTO } from "./partner.schema";
import type { TProposal } from "./proposal.schema";
export const ElectricalInstallationGroupsSchema = z.union(
	[z.literal("RESIDENCIAL"), z.literal("COMERCIAL"), z.literal("INDUSTRIAL"), z.literal("RURAL")],
	{
		required_error: "Grupo da instalação elétrica não informado.",
		invalid_type_error: "Tipo não válido para grupo da instalação elétrica.",
	},
);
export type TElectricalInstallationGroups = z.infer<typeof ElectricalInstallationGroupsSchema>;

const ElectricalInstallationLigationTypesSchema = z.union([z.literal("NOVA"), z.literal("EXISTENTE")], {
	required_error: "Tipo da ligação da instalação não informado.",
	invalid_type_error: "Tipo não válido para o tipo da ligação da instalação.",
});

const ElectricalInstallationOwnerTypeSchema = z.union([z.literal("PESSOA FÍSICA"), z.literal("PESSOA JURÍDICA")]);
export type TElectricalInstallationOwnerTypes = z.infer<typeof ElectricalInstallationOwnerTypeSchema>;
export type TElectricalInstallationLigationTypes = z.infer<typeof ElectricalInstallationLigationTypesSchema>;
export const SaleCategorySchema = z.enum(["KIT", "PLANO", "PRODUTOS", "SERVIÇOS"], {
	required_error: "Categoria de venda não fornecida.",
	invalid_type_error: "Tipo não válido para categoria de venda.",
});
export const OpportunityResponsibleSchema = z.object({
	id: z.string({
		required_error: "ID do responsável da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o ID do responsável.",
	}),
	nome: z.string({
		required_error: "Nome do responsável da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o nome do responsável.",
	}),
	papel: z.string({
		required_error: "Papel do responsável da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o papel do responsável.",
	}),
	avatar_url: z
		.string({
			required_error: "Avatar do responsável da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o avatar do responsável.",
		})
		.optional()
		.nullable(),
	telefone: z
		.string({
			required_error: "Telefone do responsável da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o Telefone do responsável.",
		})
		.optional()
		.nullable(),
	dataInsercao: z
		.string({
			required_error: "Data de inserção do responsável da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para a data de inserção do responsável.",
		})
		.datetime(),
});
export type TOpportunityResponsible = z.infer<typeof OpportunityResponsibleSchema>;
export type TSaleCategory = z.infer<typeof SaleCategorySchema>;
export const OpportunitySegmentsEnumSchema = z.enum(["RESIDENCIAL", "RURAL", "COMERCIAL", "INDUSTRIAL"]);

export const EmbeddedOpportunityClientSchema = z.object({
	nome: z.string({ required_error: "Nome do cliente não informado.", invalid_type_error: "Tipo não válido para nome do cliente." }),
	cpfCnpj: z
		.string({ required_error: "CPF ou CNPJ do cliente não informado.", invalid_type_error: "Tipo não válido para CPF ou CNPJ do cliente." })
		.optional()
		.nullable(),
	telefonePrimario: z.string({
		required_error: "Telefone do cliente não informado.",
		invalid_type_error: "Tipo não válido para telefone do cliente.",
	}),
	email: z
		.string({ required_error: "Email do cliente não informado.", invalid_type_error: "Tipo não válido para email do cliente." })
		.optional()
		.nullable(),
	canalAquisicao: z.string({
		required_error: "Canal de aquisição do cliente não informado.",
		invalid_type_error: "Tipo não válido para canal de aquisição do cliente.",
	}),
});
export const EmbeddedOpportunityProposalSchema = z.object({
	nome: z.string({ required_error: "Nome da proposta não informado.", invalid_type_error: "Tipo não válido para nome da proposta." }),
	valor: z.number({ required_error: "Valor da proposta não informado.", invalid_type_error: "Tipo não válido para valor da proposta." }),
	potenciaPico: z
		.number({
			required_error: "Potência pico da proposta não informada.",
			invalid_type_error: "Tipo não válido para potência pico da proposta.",
		})
		.optional()
		.nullable(),
	urlArquivo: z
		.string({
			required_error: "URL do arquivo da proposta não informada.",
			invalid_type_error: "Tipo não válido para URL do arquivo da proposta.",
		})
		.optional()
		.nullable(),
});

export const GeneralOpportunitySchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência do parceiro.",
	}),
	nome: z.string({
		required_error: "Nome da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o nome da oportunidade.",
	}),
	tipo: z.object({
		id: z
			.string({
				required_error: "ID de referência do tipo de projeto não encontrado.",
				invalid_type_error: "Tipo não válido para o ID de referência do tipo de projeto.",
			})
			.min(12, "Tipo inválido de projeto."),
		titulo: z.string({
			required_error: "Titulo do tipo de projeto não encontrado.",
			invalid_type_error: "Tipo não válido para o titulo do tipo de projeto.",
		}),
	}),
	categoriaVenda: SaleCategorySchema,
	descricao: z.string({
		required_error: "Descrição da oportunidade não informada.",
		invalid_type_error: "Tipo não válido para a descrição da oportunidade.",
	}),
	identificador: z.string({
		required_error: "Identificador da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o identificador da oportunidade.",
	}),
	responsaveis: z
		.array(OpportunityResponsibleSchema, {
			required_error: "Responsável(is) da oportunidade não informados.",
			invalid_type_error: "Tipo não válido para responsáveis da oportunidade.",
		})
		.min(1, "É necessário ao menos 1 responsável."),
	// Embedding lead sending date to make it easier to get stats via aggregation pipeline
	dataEnvioLead: z
		.string({
			invalid_type_error: "Tipo não válido para data de envio do lead.",
		})
		.datetime({ message: "Formato inválido para data de envio do lead." })
		.optional()
		.nullable(),
	segmento: z
		.union([z.literal("RESIDENCIAL"), z.literal("RURAL"), z.literal("COMERCIAL"), z.literal("INDUSTRIAL")])
		.optional()
		.nullable(),
	idCliente: z.string({
		required_error: "ID de referência do cliente não informado.",
		invalid_type_error: "Tipo não válido para ID de referência do cliente.",
	}),
	cliente: z.object({
		nome: z.string({ required_error: "Nome do cliente não informado.", invalid_type_error: "Tipo não válido para nome do cliente." }),
		cpfCnpj: z
			.string({ required_error: "CPF ou CNPJ do cliente não informado.", invalid_type_error: "Tipo não válido para CPF ou CNPJ do cliente." })
			.optional()
			.nullable(),
		telefonePrimario: z.string({
			required_error: "Telefone do cliente não informado.",
			invalid_type_error: "Tipo não válido para telefone do cliente.",
		}),
		email: z
			.string({ required_error: "Email do cliente não informado.", invalid_type_error: "Tipo não válido para email do cliente." })
			.optional()
			.nullable(),
		canalAquisicao: z.string({
			required_error: "Canal de aquisição do cliente não informado.",
			invalid_type_error: "Tipo não válido para canal de aquisição do cliente.",
		}),
	}),
	proposta: EmbeddedOpportunityProposalSchema.optional().nullable(),
	idPropostaAtiva: z.string({ invalid_type_error: "Tipo não válido para ID de referência da proposta ativa." }).optional().nullable(),
	localizacao: z.object({
		cep: z.string().optional().nullable(),
		uf: z.string(),
		cidade: z.string(),
		bairro: z.string().optional().nullable(),
		endereco: z.string().optional().nullable(),
		numeroOuIdentificador: z.string().optional().nullable(),
		complemento: z.string().optional().nullable(),
		latitude: z.string().optional().nullable(),
		longitude: z.string().optional().nullable(),
		// distancia: z.number().optional().nullable(),
	}),
	perda: z.object({
		idMotivo: z.string().optional().nullable(),
		descricaoMotivo: z.string().optional().nullable(),
		data: z.string().optional().nullable(),
	}),
	ganho: z.object({
		idProposta: z.string().optional().nullable(),
		idProjeto: z.string().optional().nullable(),
		data: z.string().datetime().optional().nullable(),
		idSolicitacao: z.string().optional().nullable(),
		dataSolicitacao: z.string().datetime({ message: "Formato inválido para data de solicitação de contrato." }).optional().nullable(),
	}),
	instalacao: z.object({
		concessionaria: z.string().optional().nullable(),
		numero: z.string().optional().nullable(),
		grupo: ElectricalInstallationGroupsSchema.optional().nullable(),
		tipoLigacao: ElectricalInstallationLigationTypesSchema.optional().nullable(),
		tipoTitular: z
			.union([z.literal("PESSOA FÍSICA"), z.literal("PESSOA JURÍDICA")])
			.optional()
			.nullable(),
		nomeTitular: z.string().optional().nullable(),
	}),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	idIndicacao: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de referência da indicação.",
		})
		.optional()
		.nullable(),
	idMarketing: z.string().optional().nullable(),
	interacoesConfiguracao: z
		.object({
			taxaValor: z
				.number({
					invalid_type_error: "Tipo não válido para a taxa de valor.",
				})
				.optional()
				.nullable(),
			taxaMedida: z
				.enum(["DIAS", "SEMANAS", "MESES"], {
					invalid_type_error: "Tipo não válido para a taxa de medida.",
				})
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	ultimaInteracao: z
		.object({
			tipo: OpportunityInteractionTypesEnum,
			data: z
				.string({ invalid_type_error: "Tipo não válido para data de última interação." })
				.datetime({ message: "Tipo não válido para data de última interação." })
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	proximaInteracao: z.string().datetime().optional().nullable(),
	dataExclusao: z.string().datetime().optional().nullable(),
	dataInsercao: z.string().datetime(),
	// adicionar contrato e solicitação de contrato futuramente
});
export const InsertOpportunitySchema = z.object({
	nome: z
		.string({ required_error: "Nome da oportunidade não informado.", invalid_type_error: "Tipo não válido para nome da oportunidade." })
		.min(3, "É necessário um nome de ao menos 3 caractéres para a oportunidade."),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	tipo: z.object({
		id: z
			.string({
				required_error: "ID de referência do tipo de projeto não encontrado.",
				invalid_type_error: "Tipo não válido para o ID de referência do tipo de projeto.",
			})
			.min(12, "Tipo inválido para ID de tipo deprojeto."),
		titulo: z.string({
			required_error: "Titulo do tipo de projeto não encontrado.",
			invalid_type_error: "Tipo não válido para o titulo do tipo de projeto.",
		}),
	}),
	categoriaVenda: SaleCategorySchema,
	descricao: z.string({
		required_error: "Descrição da oportunidade não informada.",
		invalid_type_error: "Tipo não válido para descrição da oportunidade.",
	}),
	identificador: z.string({
		required_error: "Identificador da oportunidade não informado.",
		invalid_type_error: "Tipo inválido para identificador da oportunidade.",
	}),
	responsaveis: z
		.array(OpportunityResponsibleSchema, {
			required_error: "Responsável(is) da oportunidade não informados.",
			invalid_type_error: "Tipo não válido para responsáveis da oportunidade.",
		})
		.min(1, "É necessário ao menos 1 responsável."),
	// Embedding lead sending date to make it easier to get stats via aggregation pipeline
	dataEnvioLead: z
		.string({
			invalid_type_error: "Tipo não válido para data de envio do lead.",
		})
		.datetime({ message: "Formato inválido para data de envio do lead." })
		.optional()
		.nullable(),
	segmento: z
		.union([z.literal("RESIDENCIAL"), z.literal("RURAL"), z.literal("COMERCIAL"), z.literal("INDUSTRIAL")], {
			required_error: "Segmento da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o segmento da oportunidade.",
		})
		.optional()
		.nullable(),
	idCliente: z.string({ required_error: "Vínculo de cliente não informado.", invalid_type_error: "Tipo não válido para vínculo de cliente." }),
	proposta: EmbeddedOpportunityProposalSchema.optional().nullable(),
	idPropostaAtiva: z.string().optional().nullable(),
	localizacao: z.object({
		cep: z.string().optional().nullable(),
		uf: z.string({
			required_error: "UF de localização da oportunidade não informada.",
			invalid_type_error: "Tipo não válido para a UF de localização da oportunidade.",
		}),
		cidade: z.string({
			required_error: "Cidade de localização da oportunidade não informada.",
			invalid_type_error: "Tipo não válido para a cidade de localização da oportunidade.",
		}),
		bairro: z.string().optional().nullable(),
		endereco: z.string().optional().nullable(),
		numeroOuIdentificador: z.string().optional().nullable(),
		complemento: z.string().optional().nullable(),
		latitude: z.string({ invalid_type_error: "Tipo não válido para latitude da localização da oportunidade." }).optional().nullable(),
		longitude: z.string({ invalid_type_error: "Tipo não válido para longitude da localização da oportunidade." }).optional().nullable(),
		// distancia: z.number().optional().nullable(),
	}),
	perda: z.object({
		idMotivo: z.string().optional().nullable(),
		descricaoMotivo: z.string().optional().nullable(),
		data: z.string().datetime({ message: "Formato inválido para data de perda." }).optional().nullable(),
	}),
	ganho: z.object({
		idProposta: z.string().optional().nullable(),
		idProjeto: z.string().optional().nullable(),
		data: z.string().datetime({ message: "Formato inválido para data de ganho." }).optional().nullable(),
		idSolicitacao: z.string().optional().nullable(),
		dataSolicitacao: z.string().datetime({ message: "Formato inválido para data de solicitação de contrato." }).optional().nullable(),
	}),
	instalacao: z.object({
		concessionaria: z.string().optional().nullable(),
		numero: z.string().optional().nullable(),
		grupo: ElectricalInstallationGroupsSchema.optional().nullable(),
		tipoLigacao: ElectricalInstallationLigationTypesSchema.optional().nullable(),
		tipoTitular: z
			.union([z.literal("PESSOA FÍSICA"), z.literal("PESSOA JURÍDICA")])
			.optional()
			.nullable(),
		nomeTitular: z.string().optional().nullable(),
	}),
	autor: z.object({
		id: z.string({
			required_error: "ID do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para id do criador da oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para nome do criador da oportunidade.",
		}),
		avatar_url: z.string().optional().nullable(),
	}),
	idIndicacao: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de referência da indicação.",
		})
		.optional()
		.nullable(),
	idMarketing: z
		.string({
			required_error: "ID de referência do Lead Marketing não fornecido.",
			invalid_type_error: "Tipo não válido para o ID de referência do Lead Marketing",
		})
		.optional()
		.nullable(),
	interacoesConfiguracao: z
		.object({
			taxaValor: z
				.number({
					invalid_type_error: "Tipo não válido para a taxa de valor.",
				})
				.optional()
				.nullable(),
			taxaMedida: z
				.enum(["DIAS", "SEMANAS", "MESES"], {
					invalid_type_error: "Tipo não válido para a taxa de medida.",
				})
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	ultimaInteracao: z
		.object({
			tipo: OpportunityInteractionTypesEnum,
			data: z
				.string({ invalid_type_error: "Tipo não válido para data de última interação." })
				.datetime({ message: "Tipo não válido para data de última interação." })
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	proximaInteracao: z.string().datetime().optional().nullable(),
	dataExclusao: z
		.string({ invalid_type_error: "Tipo não válido para data de exclusão." })
		.datetime({ message: "Tipo não válido para data de exclusão." })
		.optional()
		.nullable(),
	dataInsercao: z.string().datetime(),
});
export const UpdateOpportunitySchema = z.object({
	_id: z.string({
		required_error: "ID de referência da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência da oportunidade.",
	}),
	nome: z
		.string({ required_error: "Nome da oportunidade não informado.", invalid_type_error: "Tipo não válido para nome da oportunidade." })
		.min(3, "É necessário um nome de ao menos 3 caractéres para a oportunidade."),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	tipo: z.object({
		id: z
			.string({
				required_error: "ID de referência do tipo de projeto não encontrado.",
				invalid_type_error: "Tipo não válido para o ID de referência do tipo de projeto.",
			})
			.min(12, "Tipo inválido para ID de tipo deprojeto."),
		titulo: z.string({
			required_error: "Titulo do tipo de projeto não encontrado.",
			invalid_type_error: "Tipo não válido para o titulo do tipo de projeto.",
		}),
	}),
	categoriaVenda: SaleCategorySchema,
	descricao: z.string({
		required_error: "Descrição da oportunidade não informada.",
		invalid_type_error: "Tipo não válido para descrição da oportunidade.",
	}),
	identificador: z.string({
		required_error: "Identificador da oportunidade não informado.",
		invalid_type_error: "Tipo inválido para identificador da oportunidade.",
	}),
	responsaveis: z
		.array(OpportunityResponsibleSchema, {
			required_error: "Responsável(is) da oportunidade não informados.",
			invalid_type_error: "Tipo não válido para responsáveis da oportunidade.",
		})
		.min(1, "É necessário ao menos 1 responsável."),
	// Embedding lead sending date to make it easier to get stats via aggregation pipeline
	dataEnvioLead: z
		.string({
			invalid_type_error: "Tipo não válido para data de envio do lead.",
		})
		.datetime({ message: "Formato inválido para data de envio do lead." })
		.optional()
		.nullable(),
	segmento: z
		.union([z.literal("RESIDENCIAL"), z.literal("RURAL"), z.literal("COMERCIAL"), z.literal("INDUSTRIAL")], {
			required_error: "Segmento da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o segmento da oportunidade.",
		})
		.optional()
		.nullable(),
	idCliente: z.string({ required_error: "Vínculo de cliente não informado.", invalid_type_error: "Tipo não válido para vínculo de cliente." }),
	proposta: EmbeddedOpportunityProposalSchema.optional().nullable(),
	idPropostaAtiva: z.string().optional().nullable(),
	localizacao: z.object({
		cep: z.string().optional().nullable(),
		uf: z.string({
			required_error: "UF de localização da oportunidade não informada.",
			invalid_type_error: "Tipo não válido para a UF de localização da oportunidade.",
		}),
		cidade: z.string({
			required_error: "Cidade de localização da oportunidade não informada.",
			invalid_type_error: "Tipo não válido para a cidade de localização da oportunidade.",
		}),
		bairro: z.string().optional().nullable(),
		endereco: z.string().optional().nullable(),
		numeroOuIdentificador: z.string().optional().nullable(),
		complemento: z.string().optional().nullable(),
		latitude: z.string({ invalid_type_error: "Tipo não válido para latitude da localização da oportunidade." }).optional().nullable(),
		longitude: z.string({ invalid_type_error: "Tipo não válido para longitude da localização da oportunidade." }).optional().nullable(),
		// distancia: z.number().optional().nullable(),
	}),
	perda: z.object({
		idMotivo: z.string().optional().nullable(),
		descricaoMotivo: z.string().optional().nullable(),
		data: z.string().datetime({ message: "Formato inválido para data de perda." }).optional().nullable(),
	}),
	ganho: z.object({
		idProposta: z.string().optional().nullable(),
		idProjeto: z.string().optional().nullable(),
		data: z.string().datetime({ message: "Formato inválido para data de ganho." }).optional().nullable(),
		idSolicitacao: z.string().optional().nullable(),
		dataSolicitacao: z.string().datetime({ message: "Formato inválido para data de solicitação de contrato." }).optional().nullable(),
	}),
	instalacao: z.object({
		concessionaria: z.string().optional().nullable(),
		numero: z.string().optional().nullable(),
		grupo: ElectricalInstallationGroupsSchema.optional().nullable(),
		tipoLigacao: ElectricalInstallationLigationTypesSchema.optional().nullable(),
		tipoTitular: z
			.union([z.literal("PESSOA FÍSICA"), z.literal("PESSOA JURÍDICA")])
			.optional()
			.nullable(),
		nomeTitular: z.string().optional().nullable(),
	}),
	autor: z.object({
		id: z.string({
			required_error: "ID do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para id do criador da oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para nome do criador da oportunidade.",
		}),
		avatar_url: z.string().optional().nullable(),
	}),
	idIndicacao: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de referência da indicação.",
		})
		.optional()
		.nullable(),
	idMarketing: z
		.string({
			required_error: "ID de referência do Lead Marketing não fornecido.",
			invalid_type_error: "Tipo não válido para o ID de referência do Lead Marketing",
		})
		.optional()
		.nullable(),
	interacoesConfiguracao: z
		.object({
			taxaValor: z
				.number({
					invalid_type_error: "Tipo não válido para a taxa de valor.",
				})
				.optional()
				.nullable(),
			taxaMedida: z
				.enum(["DIAS", "SEMANAS", "MESES"], {
					invalid_type_error: "Tipo não válido para a taxa de medida.",
				})
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	ultimaInteracao: z
		.object({
			tipo: OpportunityInteractionTypesEnum,
			data: z
				.string({ invalid_type_error: "Tipo não válido para data de última interação." })
				.datetime({ message: "Tipo não válido para data de última interação." })
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	proximaInteracao: z.string().datetime().optional().nullable(),
	dataExclusao: z
		.string({ invalid_type_error: "Tipo não válido para data de exclusão." })
		.datetime({ message: "Tipo não válido para data de exclusão." })
		.optional()
		.nullable(),
	dataInsercao: z.string().datetime(),
});

export const OpportunityWithClientSchema = z.object({
	_id: z.string({
		required_error: "ID de referência da oportunidade não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência da oportunidade.",
	}),
	nome: z
		.string({ required_error: "Nome da oportunidade não informado.", invalid_type_error: "Tipo não válido para nome da oportunidade." })
		.min(3, "É necessário um nome de ao menos 3 caractéres para a oportunidade."),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	tipo: z.object({
		id: z
			.string({
				required_error: "ID de referência do tipo de projeto não encontrado.",
				invalid_type_error: "Tipo não válido para o ID de referência do tipo de projeto.",
			})
			.min(12, "Tipo inválido para ID de tipo deprojeto."),
		titulo: z.string({
			required_error: "Titulo do tipo de projeto não encontrado.",
			invalid_type_error: "Tipo não válido para o titulo do tipo de projeto.",
		}),
	}),
	categoriaVenda: SaleCategorySchema,
	descricao: z.string({
		required_error: "Descrição da oportunidade não informada.",
		invalid_type_error: "Tipo não válido para descrição da oportunidade.",
	}),
	identificador: z.string({
		required_error: "Identificador da oportunidade não informado.",
		invalid_type_error: "Tipo inválido para identificador da oportunidade.",
	}),
	responsaveis: z
		.array(OpportunityResponsibleSchema, {
			required_error: "Responsável(is) da oportunidade não informados.",
			invalid_type_error: "Tipo não válido para responsáveis da oportunidade.",
		})
		.min(1, "É necessário ao menos 1 responsável."),
	// Embedding lead sending date to make it easier to get stats via aggregation pipeline
	dataEnvioLead: z
		.string({
			invalid_type_error: "Tipo não válido para data de envio do lead.",
		})
		.datetime({
			message: "Formato inválido para data de envio do lead.",
		})
		.optional()
		.nullable(),
	segmento: OpportunitySegmentsEnumSchema.optional().nullable(),
	idCliente: z.string({ required_error: "Vínculo de cliente não informado.", invalid_type_error: "Tipo não válido para vínculo de cliente." }),
	cliente: GeneralClientSchema,
	proposta: EmbeddedOpportunityProposalSchema.optional().nullable(),
	idPropostaAtiva: z.string().optional().nullable(),
	localizacao: z.object({
		cep: z.string().optional().nullable(),
		uf: z.string({
			required_error: "UF de localização da oportunidade não informada.",
			invalid_type_error: "Tipo não válido para a UF de localização da oportunidade.",
		}),
		cidade: z.string({
			required_error: "Cidade de localização da oportunidade não informada.",
			invalid_type_error: "Tipo não válido para a cidade de localização da oportunidade.",
		}),
		bairro: z.string().optional().nullable(),
		endereco: z.string().optional().nullable(),
		numeroOuIdentificador: z.string().optional().nullable(),
		complemento: z.string().optional().nullable(),
		latitude: z.string({ invalid_type_error: "Tipo não válido para latitude da localização da oportunidade." }).optional().nullable(),
		longitude: z.string({ invalid_type_error: "Tipo não válido para longitude da localização da oportunidade." }).optional().nullable(),
		// distancia: z.number().optional().nullable(),
	}),
	perda: z.object({
		idMotivo: z.string().optional().nullable(),
		descricaoMotivo: z.string().optional().nullable(),
		data: z.string().datetime({ message: "Formato inválido para data de perda." }).optional().nullable(),
	}),
	ganho: z.object({
		idProposta: z.string().optional().nullable(),
		idProjeto: z.string().optional().nullable(),
		data: z.string().datetime({ message: "Formato inválido para data de ganho." }).optional().nullable(),
		idSolicitacao: z.string().optional().nullable(),
		dataSolicitacao: z.string().datetime({ message: "Formato inválido para data de solicitação de contrato." }).optional().nullable(),
	}),
	instalacao: z.object({
		concessionaria: z.string().optional().nullable(),
		numero: z.string().optional().nullable(),
		grupo: ElectricalInstallationGroupsSchema.optional().nullable(),
		tipoLigacao: ElectricalInstallationLigationTypesSchema.optional().nullable(),
		tipoTitular: z
			.union([z.literal("PESSOA FÍSICA"), z.literal("PESSOA JURÍDICA")])
			.optional()
			.nullable(),
		nomeTitular: z.string().optional().nullable(),
	}),
	autor: z.object({
		id: z.string({
			required_error: "ID do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para id do criador da oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome do criador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para nome do criador da oportunidade.",
		}),
		avatar_url: z.string().optional().nullable(),
	}),
	idMarketing: z
		.string({
			required_error: "ID de referência do Lead Marketing não fornecido.",
			invalid_type_error: "Tipo não válido para o ID de referência do Lead Marketing",
		})
		.optional()
		.nullable(),
	interacoesConfiguracao: z
		.object({
			taxaValor: z
				.number({
					invalid_type_error: "Tipo não válido para a taxa de valor.",
				})
				.optional()
				.nullable(),
			taxaMedida: z
				.enum(["DIAS", "SEMANAS", "MESES"], {
					invalid_type_error: "Tipo não válido para a taxa de medida.",
				})
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	ultimaInteracao: z
		.object({
			tipo: OpportunityInteractionTypesEnum,
			data: z
				.string({ invalid_type_error: "Tipo não válido para data de última interação." })
				.datetime({ message: "Tipo não válido para data de última interação." })
				.optional()
				.nullable(),
		})
		.optional()
		.nullable(),
	proximaInteracao: z.string().datetime().optional().nullable(),
	idIndicacao: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de referência da indicação.",
		})
		.optional()
		.nullable(),
	dataExclusao: z
		.string({ invalid_type_error: "Tipo não válido para data de exclusão." })
		.datetime({ message: "Tipo não válido para data de exclusão." })
		.optional()
		.nullable(),
	dataInsercao: z.string().datetime(),
});

export type TOpportunity = z.infer<typeof GeneralOpportunitySchema>;
export type TOpportunitySimplified = Pick<
	TOpportunity,
	| "nome"
	| "idParceiro"
	| "identificador"
	| "tipo"
	| "proposta"
	| "idMarketing"
	| "idIndicacao"
	| "responsaveis"
	| "cliente"
	| "ganho"
	| "perda"
	| "dataInsercao"
>;
export const SimplifiedOpportunityProjection = {
	_id: 1,
	nome: 1,
	identificador: 1,
	tipo: 1,
	idParceiro: 1,
	proposta: 1,
	idMarketing: 1,
	idIndicacao: 1,
	responsaveis: 1,
	cliente: 1,
	ganho: 1,
	perda: 1,
	dataInsercao: 1,
};

export type TOpportunitySimplifiedWithProposalAndActivitiesAndFunnels = TOpportunitySimplified & {
	proposta: {
		nome: TProposal["nome"];
		valor: TProposal["valor"];
		potenciaPico: TProposal["potenciaPico"];
	};
	statusAtividades?: ActivitiesByStatus;
	funil: {
		id: string;
		idFunil: TFunnelReference["idFunil"];
		idEstagio: TFunnelReference["idEstagioFunil"];
	};
};

export type TOpportunityWithFunnelReferenceAndActivitiesByStatus = TOpportunity & {
	funil: { id: string; idFunil: string; idEstagio: string };
	statusAtividades: ActivitiesByStatus;
};
export type TOpportunityWithFunnelReferenceAndActivities = TOpportunity & {
	funil: { id: string; idFunil: string; idEstagio: string };
	atividades: TActivityDTO[];
};

// export type TOpportunityEntity = TOpportunity & {_id: ObjectId}
// export type TOpportunityEntityWithFunnelReference = TOpportunityEntity & { funil: { id: string; idFunil: string; idEstagio: string } }

export type TOpportunityDTO = TOpportunity & { _id: string };
export type TOpportunitySimplifiedDTO = TOpportunitySimplified & {
	_id: string;
};

export type TOpportunitySimplifiedDTOWithProposal = TOpportunitySimplifiedDTO & {
	proposta: {
		nome: TProposal["nome"];
		valor: TProposal["valor"];
		potenciaPico: TProposal["potenciaPico"];
	};
};

export type TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels = TOpportunitySimplifiedDTO & {
	proposta: {
		nome: TProposal["nome"];
		valor: TProposal["valor"];
		potenciaPico: TProposal["potenciaPico"];
	};
	statusAtividades?: ActivitiesByStatus;
	funil: {
		id: string;
		idFunil: TFunnelReference["idFunil"];
		idEstagio: TFunnelReference["idEstagioFunil"];
	};
};

export type TOpportunityDTOWithClient = TOpportunityDTO & {
	cliente: TClientDTO;
};
export type TOpportunityDTOWithClientAndPartnerAndFunnelReferences = TOpportunityDTO & {
	cliente: TClientDTO;
	parceiro: TPartnerSimplifiedDTO;
	referenciasFunil: TFunnelReferenceDTO[];
};

export type TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus = TOpportunityDTO & {
	funil: { id: string; idFunil: string; idEstagio: string };
	statusAtividades: ActivitiesByStatus;
};
export type TOpportunityDTOWithFunnelReferenceAndActivities = TOpportunityDTO & {
	funil: { id: string; idFunil: string; idEstagio: string };
	atividades: TActivityDTO[];
};

export const SimplifiedOpportunityWithProposalProjection = {
	_id: 1,
	nome: 1,
	identificador: 1,
	tipo: 1,
	responsaveis: 1,
	idMarketing: 1,
	idIndicacao: 1,
	"ganho.data": 1,
	"perda.data": 1,
	proposta: 1,
	dataInsercao: 1,
};

const PersonalizedFieldsFilter = z.enum(["dataInsercao", "ganho.data", "perda.data"], {
	required_error: "Filtro de campo de período não informado.",
	invalid_type_error: "Tipo não válido para o campo de filtro de período.",
});
const OpportunityPersonalizedFiltersSchema = z.object({
	name: z.string({
		required_error: "Filtro de nome não informado.",
		invalid_type_error: "Tipo não válido para o filtro de nome.",
	}),
	city: z.array(
		z.string({
			required_error: "Cidade de filtro não informada.",
			invalid_type_error: "Tipo não válido para cidade de filtro.",
		}),
		{
			required_error: "Lista de cidades de filtro não informada.",
			invalid_type_error: "Tipo não válido para lista de cidades de filtro.",
		},
	),
	period: z.object({
		after: z
			.string({
				required_error: "Filtro de depois de não informado.",
				invalid_type_error: "Tipo não válido para o filtro de depois de.",
			})
			.optional()
			.nullable(),
		before: z
			.string({
				required_error: "Filtro de antes de não informado.",
				invalid_type_error: "Tipo não válido para o filtro de antes de.",
			})
			.optional()
			.nullable(),
		field: PersonalizedFieldsFilter.optional().nullable(),
	}),
});
export type TPersonalizedOpportunitiesFilter = z.infer<typeof OpportunityPersonalizedFiltersSchema>;
export const PersonalizedOpportunityQuerySchema = z.object({
	responsibles: z
		.array(
			z.string({
				required_error: "Autores não informados ou inválidos.",
				invalid_type_error: "Autores inválidos.",
			}),
		)
		.nullable(),
	partners: z
		.array(
			z.string({
				required_error: "Parceiros não informados ou inválidos.",
				invalid_type_error: "Parceiros inválidos.",
			}),
		)
		.nullable(),
	projectTypes: z
		.array(
			z.string({
				required_error: "Tipos de projeto não informados ou inválidos.",
				invalid_type_error: "Tipos de projeto inválidos.",
			}),
		)
		.nullable(),
	filters: OpportunityPersonalizedFiltersSchema,
});
