import { z } from "zod";
import { AuthorSchema } from "./user.schema";
import { TProjectDTO } from "./project.schema";
import { PricingMethodConditionTypes } from "./pricing-method.schema";
import { TTechnicalAnalysisDTO } from "./technical-analysis.schema";

const ServiceOrderResponsible = z.object({
	id: z.string({
		required_error: "ID do responsável da ativade não informado.",
		invalid_type_error: "Tipo não válido para id do responsável da ativade.",
	}),
	nome: z.string({
		required_error: "Nome do responsável da ativade não informado.",
		invalid_type_error: "Tipo não válido para nome do responsável da ativade.",
	}),
	tipo: z.enum(["INTERNO", "EXTERNO"], {
		required_error: "Tipo do responsável não informado.",
		invalid_type_error: "Tipo não válido para o tipo do responsável.",
	}),
	avatar_url: z.string({ invalid_type_error: "Tipo não válido para a referência de avatar do responsável." }).optional().nullable(),
});

const ServiceOrderProjectReference = z.object({
	id: z.string({ required_error: "ID do projeto não informado.", invalid_type_error: "Tipo não válido para o ID do projeto." }).optional().nullable(),
	nome: z.string({ required_error: "Nome do projeto não informado.", invalid_type_error: "Tipo não válido para o nome do projeto." }).optional().nullable(),
	tipo: z.string({ required_error: "Tipo do projeto não informado.", invalid_type_error: "Tipo não válido para o tipo do projeto." }).optional().nullable(),
	indexador: z
		.number({ required_error: "Indexador do projeto não informado.", invalid_type_error: "Tipo não válido para o indexador do projeto." })
		.optional()
		.nullable(),
	identificador: z
		.union([
			z.string({
				required_error: "Identificador do projeto não informado.",
				invalid_type_error: "Tipo não válido para o identificador do projeto.",
			}),
			z.number({
				required_error: "Identificador do projeto não informado.",
				invalid_type_error: "Tipo não válido para o identificador do projeto.",
			}),
		])
		.optional()
		.nullable(),
});

const ServiceOrderMaterialItem = z.object({
	idMaterial: z
		.string({
			required_error: "ID de referência do material não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do material.",
		})
		.optional()
		.nullable(),
	categoria: z.union([z.literal("MÓDULO"), z.literal("INVERSOR"), z.literal("INSUMO"), z.literal("ESTRUTURA"), z.literal("PADRÃO"), z.literal("OUTROS")]),
	descricao: z.string({
		required_error: "Descrição do item de compra não informado.",
		invalid_type_error: "Tipo não válido para a descrição do item de compra.",
	}),
	unidade: z.string({
		required_error: "Unidade do item de compra não fornecida.",
		invalid_type_error: "Tipo não válido para a unidade do item de compra.",
	}),
	qtde: z.number({
		required_error: "Quantidade do item de compra não fornecida.",
		invalid_type_error: "Tipo não válido para a quantidade do item de compra.",
	}),
});
export type TServiceOrderMaterialItem = z.infer<typeof ServiceOrderMaterialItem>;
const ServiceOrderExecutionLog = z.object({
	inicio: z.string({
		required_error: "Data hora do início do registro não informada.",
		invalid_type_error: "Tipo não válido para o data hora do início do registro.",
	}),
	fim: z
		.string({
			required_error: "Data hora do início do registro não informada.",
			invalid_type_error: "Tipo não válido para o data hora do início do registro.",
		})
		.optional()
		.nullable(),
	anotacoes: z.string({
		required_error: "Anotações od registro não informadas.",
		invalid_type_error: "Tipo não válido para as anotações do registro.",
	}),
	autor: AuthorSchema,
});
export type TServiceOrderExecutionLog = z.infer<typeof ServiceOrderExecutionLog>;

const ServiceOrderReportSchema = z.object({
	aplicavel: z.boolean({
		required_error: "Aplicabilidade de relatório de conclusão não informada.",
		invalid_type_error: "Tipo não válido para aplicabilidade de relatório de conclusão.",
	}),
	secoes: z.array(
		z.object({
			titulo: z.string({
				required_error: "Título da seção do relatório não informado.",
				invalid_type_error: "Tipo não válido para o título da seção do relatório.",
			}),
			controles: z.array(
				z.object({
					titulo: z.string({
						required_error: "Título do item de controle não informado.",
						invalid_type_error: "Tipo não válido para o título do item de controle.",
					}),
				}),
			),
			arquivos: z.array(
				z.object({
					titulo: z.string({
						required_error: "Título do arquivo de controle não informado.",
						invalid_type_error: "Tipo não válido para o título do arquivo de controle.",
					}),
				}),
			),
			dataConclusao: z
				.string({ invalid_type_error: "Tipo não válido para data de conclusão da seção do relatório." })
				.datetime({ message: "Tipo não válido para data de conclusão da seção do relatório" })
				.optional()
				.nullable(),
		}),
	),
});
export type TServiceOrderReport = z.infer<typeof ServiceOrderReportSchema>;
const GeneralServiceOrderSchema = z.object({
	idParceiro: z.string({ required_error: "ID do parceiro não informado.", invalid_type_error: "Tipo não válido para o ID do parceiro." }),
	categoria: z.enum(["MONTAGEM", "MANUTANÇÃO CORRETIVA", "MANUTENÇÃO PREVENTIVA", "PADRÃO", "ESTRUTURA", "OUTROS"]),
	favorecido: z.object({
		nome: z.string({ required_error: "Nome do favorecido não foi informado." }),
		contato: z.string({ required_error: "Contato do favorecido não foi informado." }),
	}),
	projeto: ServiceOrderProjectReference,
	idAnaliseTecnica: z.string({ invalid_type_error: "Tipo não válido para referência de análise técnica." }).optional().nullable(),
	descricao: z.string({ required_error: "Descrição não foi informada.", invalid_type_error: "Tipo não válido para a descrição da ordem de serviço." }),
	localizacao: z.object({
		cep: z.string({ required_error: "CEP não foi informado.", invalid_type_error: "Tipo não válido para o CEP da localização." }),
		uf: z.string({ required_error: "UF não foi informada.", invalid_type_error: "Tipo não válido para a UF da localização." }),
		cidade: z.string({ required_error: "Cidade não foi informada.", invalid_type_error: "Tipo não válido para a cidade da localização." }),
		bairro: z.string({ required_error: "Bairro não foi informado.", invalid_type_error: "Tipo não válido para o bairro da localização." }),
		endereco: z.string({ required_error: "Endereço não foi informado.", invalid_type_error: "Tipo não válido para o endereço da localização." }),
		numeroOuIdentificador: z.string({
			required_error: "Número ou identificador não foi informado.",
			invalid_type_error: "Tipo não válido para o número/identificador da localização.",
		}),
		complemento: z.string({ invalid_type_error: "Tipo não válido para o complemento da localização." }).optional().nullable(),
		latitude: z.string({ invalid_type_error: "Tipo não válido para a longitude da localização" }).optional().nullable(),
		longitude: z.string({ invalid_type_error: "Tipo não válido para a latitude da localização" }).optional().nullable(),
	}),
	responsaveis: z.array(ServiceOrderResponsible).min(1, "Adicione ao menos um responsável à atividade."),
	urgencia: z.enum(["POUCO URGENTE", "URGENTE", "EMERGÊNCIA"]).optional().nullable(),
	periodo: z.object({
		inicio: z.string().optional().nullable(),
		fim: z.string().optional().nullable(),
	}),
	registros: z.array(ServiceOrderExecutionLog, {
		required_error: "Registros de execução não informados.",
		invalid_type_error: "Tipo não válido para registros de execução.",
	}),
	autor: AuthorSchema,
	materiais: z.object({
		dataLiberacao: z.string({ invalid_type_error: "Tipo não válido para data de liberação para separação dos materiais." }).optional().nullable(),
		disponiveis: z.array(ServiceOrderMaterialItem),
		retiraveis: z.array(ServiceOrderMaterialItem),
	}),
	anotacoes: z.string({
		required_error: "Anotações não foram informadas.",
		invalid_type_error: "Tipo não válido para anotações da ordem de serviço.",
	}),
	observacoes: z.array(
		z.object({
			topico: z.string({ required_error: "Tópico da observação não informado.", invalid_type_error: "Tipo não válido para o tópico da observação." }),
			descricao: z.string({
				required_error: "Descrição da observação não informada.",
				invalid_type_error: "Tipo não válido para a descrição da observação.",
			}),
		}),
	),
	relatorio: ServiceOrderReportSchema,
	dataEfetivacao: z.string({ invalid_type_error: "Tipo não válido para data de efetivação." }).optional().nullable(),
	dataInsercao: z.string({ required_error: "Data de inserção não foi informada.", invalid_type_error: "Tipo não válido para data de inserção." }),
});

export const InsertServiceOrderSchema = z.object({
	idParceiro: z.string({ required_error: "ID do parceiro não informado.", invalid_type_error: "Tipo não válido para o ID do parceiro." }),
	categoria: z.enum(["MONTAGEM", "MANUTANÇÃO CORRETIVA", "MANUTENÇÃO PREVENTIVA", "PADRÃO", "ESTRUTURA", "OUTROS"]),
	favorecido: z.object({
		nome: z.string({ required_error: "Nome do favorecido não foi informado." }),
		contato: z.string({ required_error: "Contato do favorecido não foi informado." }),
	}),
	projeto: ServiceOrderProjectReference,
	idAnaliseTecnica: z.string({ invalid_type_error: "Tipo não válido para referência de análise técnica." }).optional().nullable(),
	descricao: z.string({ required_error: "Descrição não foi informada.", invalid_type_error: "Tipo não válido para a descrição da ordem de serviço." }),
	localizacao: z.object({
		cep: z.string({ required_error: "CEP não foi informado.", invalid_type_error: "Tipo não válido para o CEP da localização." }),
		uf: z.string({ required_error: "UF não foi informada.", invalid_type_error: "Tipo não válido para a UF da localização." }),
		cidade: z.string({ required_error: "Cidade não foi informada.", invalid_type_error: "Tipo não válido para a cidade da localização." }),
		bairro: z.string({ required_error: "Bairro não foi informado.", invalid_type_error: "Tipo não válido para o bairro da localização." }),
		endereco: z.string({ required_error: "Endereço não foi informado.", invalid_type_error: "Tipo não válido para o endereço da localização." }),
		numeroOuIdentificador: z.string({
			required_error: "Número ou identificador não foi informado.",
			invalid_type_error: "Tipo não válido para o número/identificador da localização.",
		}),
		complemento: z.string({ invalid_type_error: "Tipo não válido para o complemento da localização." }).optional().nullable(),
		latitude: z.string({ invalid_type_error: "Tipo não válido para a longitude da localização" }).optional().nullable(),
		longitude: z.string({ invalid_type_error: "Tipo não válido para a latitude da localização" }).optional().nullable(),
	}),
	responsaveis: z.array(ServiceOrderResponsible).min(1, "Adicione ao menos um responsável à atividade."),
	urgencia: z.enum(["POUCO URGENTE", "URGENTE", "EMERGÊNCIA"]).optional().nullable(),
	periodo: z.object({
		inicio: z.string().optional().nullable(),
		fim: z.string().optional().nullable(),
	}),
	registros: z.array(ServiceOrderExecutionLog, {
		required_error: "Registros de execução não informados.",
		invalid_type_error: "Tipo não válido para registros de execução.",
	}),
	autor: AuthorSchema,
	materiais: z.object({
		dataLiberacao: z.string({ invalid_type_error: "Tipo não válido para data de liberação para separação dos materiais." }).optional().nullable(),
		disponiveis: z.array(ServiceOrderMaterialItem),
		retiraveis: z.array(ServiceOrderMaterialItem),
	}),
	anotacoes: z.string({
		required_error: "Anotações não foram informadas.",
		invalid_type_error: "Tipo não válido para anotações da ordem de serviço.",
	}),
	observacoes: z.array(
		z.object({
			topico: z.string({ required_error: "Tópico da observação não informado.", invalid_type_error: "Tipo não válido para o tópico da observação." }),
			descricao: z.string({
				required_error: "Descrição da observação não informada.",
				invalid_type_error: "Tipo não válido para a descrição da observação.",
			}),
		}),
	),
	relatorio: ServiceOrderReportSchema,
	dataEfetivacao: z.string({ invalid_type_error: "Tipo não válido para data de efetivação." }).optional().nullable(),
	dataInsercao: z.string({ required_error: "Data de inserção não foi informada.", invalid_type_error: "Tipo não válido para data de inserção." }),
});

const PersonalizedFieldFilters = z.enum(["dataInsercao", "dataEfetivacao"], {
	required_error: "Tipo não válido para o campo de filtro de período.",
	invalid_type_error: "Tipo não válido para o campo de filtro de período.",
});
export const PersonalizedFiltersSchema = z.object({
	name: z.string({
		required_error: "Filtro de nome da ordem de serviço não informado.",
		invalid_type_error: "Tipo não válido para o filtro de nome da ordem de serviço.",
	}),
	state: z.array(z.string({ required_error: "Estado de filtro não informada.", invalid_type_error: "Tipo não válido para estado de filtro." }), {
		required_error: "Lista de estados de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de estados de filtro.",
	}),
	city: z.array(z.string({ required_error: "Cidade de filtro não informada.", invalid_type_error: "Tipo não válido para cidade de filtro." }), {
		required_error: "Lista de cidades de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de cidades de filtro.",
	}),
	category: z.array(z.string({ required_error: "Categoria de filtro não informada.", invalid_type_error: "Tipo não válido para categoria de filtro." }), {
		required_error: "Lista de categorias de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de categorias de filtro.",
	}),
	urgency: z.array(z.string({ required_error: "Urgência de filtro não informada.", invalid_type_error: "Tipo não válido para urgência de filtro." }), {
		required_error: "Lista de urgências de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de urgências de filtro.",
	}),
	period: z.object({
		after: z
			.string({ required_error: "Filtro de depois de não informado.", invalid_type_error: "Tipo não válido para o filtro de depois de." })
			.optional()
			.nullable(),
		before: z
			.string({ required_error: "Filtro de antes de não informado.", invalid_type_error: "Tipo não válido para o filtro de antes de." })
			.optional()
			.nullable(),
		field: PersonalizedFieldFilters.optional().nullable(),
	}),
	pending: z.boolean({
		required_error: "Filtro de somente pendentes não informado.",
		invalid_type_error: "Tipo não válido para filtro de somente pendentes.",
	}),
});

export type TPersonalizedServiceOrderFilter = z.infer<typeof PersonalizedFiltersSchema>;
export const PersonalizedServiceOrderQuerySchema = z.object({
	partners: z.array(z.string({ required_error: "Parceiros não informados ou inválidos.", invalid_type_error: "Parceiros inválidos." })).nullable(),
	filters: PersonalizedFiltersSchema,
});

export type TServiceOrder = z.infer<typeof GeneralServiceOrderSchema>;
export type TServiceOrderWithProjectAndAnalysis = TServiceOrder & { projetoDados?: TProjectDTO; analiseTecnicaDados?: TTechnicalAnalysisDTO };

export type TServiceOrderDTO = TServiceOrder & { _id: string };
export type TServiceOrderWithProjectAndAnalysisDTO = TServiceOrderWithProjectAndAnalysis & { _id: string };
