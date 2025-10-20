import z from "zod";
import { OpportunityResponsibleSchema } from "./opportunity.schema";
import type { TPartner } from "./partner.schema";
import { PricingMethodConditionTypes } from "./pricing-method.schema";
import type { TSaleGoalDTO } from "./sale-goal.schema";

const ComissionScenarioConditionTypes = z.enum(
	[
		"IGUAL_TEXTO",
		"IGUAL_NÚMERICO",
		"MAIOR_QUE_NÚMERICO",
		"MENOR_QUE_NÚMERICO",
		"INTERVALO_NÚMERICO",
		"INCLUI_LISTA",
	],
	{
		required_error: "Tipo de condicional não informado.",
		invalid_type_error: "Tipo não válido para tipo de condicional.",
	},
);
export type TComissionScenarioConditionType = z.infer<
	typeof ComissionScenarioConditionTypes
>;
export const AuthorSchema = z.object({
	id: z.string({
		required_error: "ID de referência do autor não fornecido.",
		invalid_type_error: "Tipo não válido para o ID do autor.",
	}),
	nome: z.string({
		required_error: "Nome do autor não fornecido.",
		invalid_type_error: "Tipo não válido para o nome do autor.",
	}),
	avatar_url: z
		.string({ invalid_type_error: "Avatar do autor não fornecido." })
		.optional()
		.nullable(),
});
export type TAuthor = z.infer<typeof AuthorSchema>;

export const PermissionsSchema = z.object({
	usuarios: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de usuários não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de usuários.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de usuários não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de usuários.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de usuários não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de usuários.",
		}),
	}),
	comissoes: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de comissões não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de comissões.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de comissões não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de comissões.",
		}),
	}),
	kits: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de kits não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de kits.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de kits não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de kits.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de kits não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de kits.",
		}),
	}),
	produtos: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de produtos não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de produtos.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de produtos não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de produtos.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de produtos não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de produtos.",
		}),
	}),
	servicos: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de serviços não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de serviços.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de serviços não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de serviços.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de serviços não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de serviços.",
		}),
	}),
	planos: z.object({
		visualizar: z.boolean({
			required_error:
				"Permissão de visualização de planos comerciais não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de planos comerciais.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de planos comerciais não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de planos comerciais.",
		}),
		criar: z.boolean({
			required_error:
				"Permissão de criação de planos comerciais não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de planos comerciais.",
		}),
	}),
	propostas: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de proposta não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de proposta.",
				}),
				{
					required_error: "Escopo de visualização de propostas não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de propostas.",
				},
			)
			.optional()
			.nullable(),
		visualizar: z.boolean({
			required_error: "Permissão de visualização de propostas não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de propostas.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de propostas não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de propostas.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de propostas não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de propostas.",
		}),
	}),
	oportunidades: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de oportunidades não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de oportunidades.",
				}),
				{
					required_error:
						"Escopo de visualização de oportunidades não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de oportunidades.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error:
				"Permissão de visualização de oportunidades não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de oportunidades.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de oportunidades não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de oportunidades.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de oportunidades não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de oportunidades.",
		}),
		excluir: z
			.boolean({
				required_error: "Permissão de exclusão de oportunidades não informada.",
				invalid_type_error:
					"Tipo não válido para permissão de exclusão de oportunidades.",
			})
			.optional()
			.nullable(),
	}),
	analisesTecnicas: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de análises técnicas não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de análises técnicas.",
				}),
				{
					required_error:
						"Escopo de visualização de análises técnicas não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de análises técnicas.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error:
				"Permissão de visualização de análises técnicas não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de análises técnicas.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de análises técnicas não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de análises técnicas.",
		}),
		criar: z.boolean({
			required_error:
				"Permissão de criação de análises técnicas não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de análises técnicas.",
		}),
	}),
	homologacoes: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de homologações não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de homologações.",
				}),
				{
					required_error:
						"Escopo de visualização de homologações não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de homologações.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error:
				"Permissão de visualização de homologações não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de homologações.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de homologações não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de homologações.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de homologações não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de homologações.",
		}),
	}),
	clientes: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de clientes não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de clientes.",
				}),
				{
					required_error: "Escopo de visualização de clientes não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de clientes.",
				},
			)
			.optional()
			.nullable(),
		visualizar: z.boolean({
			required_error: "Permissão de visualização de clientes não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de clientes.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de clientes não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de clientes.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de clientes não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de clientes.",
		}),
	}),
	projetos: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de projetos não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de projetos.",
				}),
				{
					required_error: "Escopo de visualização de projetos não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de projetos.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error: "Permissão de visualização de projetos não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de projetos.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de projetos não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de projetos.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de projetos não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de projetos.",
		}),
	}),
	parceiros: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de parceiros não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de parceiros.",
				}),
				{
					required_error: "Escopo de visualização de parceiros não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de parceiros.",
				},
			)
			.optional()
			.nullable(),
		visualizar: z.boolean({
			required_error: "Permissão de visualização de parceiros não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de parceiros.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de parceiros não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de edição de parceiros.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de parceiros não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de criação de parceiros.",
		}),
	}),
	precos: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de edição de preços não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de preços.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de preços não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de preços.",
		}),
	}),
	resultados: z.object({
		escopo: z
			.array(
				z.string({
					required_error:
						"Item do escopo de visualização de resultados não informado.",
					invalid_type_error:
						"Tipo não válido para item do escopo de visualização de resultados.",
				}),
				{
					required_error: "Escopo de visualização de resultados não fornecido.",
					invalid_type_error:
						"Tipo não válido para escopo de visualização de resultados.",
				},
			)
			.optional()
			.nullable(),
		visualizarComercial: z.boolean({
			required_error:
				"Permissão de visualização de resultados comerciais não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de resultados comerciais.",
		}),
		visualizarOperacional: z.boolean({
			required_error:
				"Permissão de visualização de resultados operacionais não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de visualização de resultados operacionais.",
		}),
	}),
	configuracoes: z.object({
		parceiro: z.boolean({
			required_error: "Permissão de configuração de parceiro não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de configuração de parceiro.",
		}), // able to edit logo, name, etc...
		precificacao: z.boolean({
			required_error:
				"Permissão de configuração de precificação não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de configuração de precificação.",
		}), // able to edit margin percentage and tax aliquot
		metodosPagamento: z.boolean({
			required_error:
				"Permissão de configuração de métodos de pagamento não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de configuração de métodos de pagamento.",
		}),
		tiposProjeto: z.boolean({
			required_error:
				"Permissão de configuração de tipos de projeto não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de configuração de tipos de projeto.",
		}),
		funis: z.boolean({
			required_error: "Permissão de configuração de funis não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de configuração de funis.",
		}),
		gruposUsuarios: z.boolean({
			required_error:
				"Permissão de configuração de grupos de usuários não informada.",
			invalid_type_error:
				"Tipo não válido para configuração de grupos de usuários.",
		}),
	}),
	integracoes: z.object({
		receberLeads: z.boolean({
			required_error:
				"Permissão de recebimento de leads por integração não informada.",
			invalid_type_error:
				"Tipo não válido para permissão de recebimento de leads por integração.",
		}),
	}),
});
export type TUserPermissions = z.infer<typeof PermissionsSchema>;

const ComissionItemSchema = z.object({
	tipoProjeto: z.object({
		id: z.string({
			required_error: "ID do tipo de projeto não informado.",
			invalid_type_error: "Tipo não válido para o ID do tipo de projeto.",
		}),
		nome: z.string({
			required_error: "Nome do tipo de projeto não informado.",
			invalid_type_error: "Tipo não válido para o nome do tipo de projeto.",
		}),
	}),
	papel: z.string({
		required_error: "Papel do usuário na venda não informado.",
		invalid_type_error: "Tipo não válido para o papel do usuário na venda.",
	}),
	resultados: z.array(
		z.object({
			condicao: z.object({
				tipo: PricingMethodConditionTypes.optional().nullable(),
				aplicavel: z.boolean({
					required_error:
						"Aplicabilidade de condição no resultado não informada.",
					invalid_type_error:
						"Tipo não válido para aplicabilidade de condição no resultado.",
				}),
				variavel: z
					.string({
						required_error: "Variável de condição no resultado não informada.",
						invalid_type_error:
							"Tipo não válido para variável de condição no resultado.",
					})
					.optional()
					.nullable(),
				igual: z
					.string({
						required_error:
							"Valor de comparação de igualdade da condição não informado.",
						invalid_type_error:
							"Tipo não válido para o valor de comparação de igualdade da condição.",
					})
					.optional()
					.nullable(),
				maiorQue: z
					.number({
						required_error: "Valor de comparação de maior que não informado.",
						invalid_type_error:
							"Tipo não válido para valor de comparação de maior que.",
					})
					.optional()
					.nullable(),
				menorQue: z
					.number({
						required_error: "Valor de comparação de menor que não informado.",
						invalid_type_error:
							"Tipo não válido para valor de comparação de menor que.",
					})
					.optional()
					.nullable(),
				entre: z
					.object({
						minimo: z.number({
							required_error:
								"Valor mínimo do intervalo de comparação númerico não informado.",
							invalid_type_error:
								"Tipo não válido para o valor mínimo do invervalo de comparação númerico.",
						}),
						maximo: z.number({
							required_error:
								"Valor máximo do intervalo de comparação númerico não informado.",
							invalid_type_error:
								"Tipo não válido para o valor máximo do invervalo de comparação númerico.",
						}),
					})
					.optional()
					.nullable(),
				inclui: z
					.array(
						z.string({
							required_error:
								"Texto de comparação da lista de opções da condição não informado.",
							invalid_type_error:
								"Tipo não válido para texto de comparação da lista de opções da condição.",
						}),
						{
							required_error: "Lista de opções de comparação não informada.",
							invalid_type_error:
								"Tipo não válido para lista de opções de comparação.",
						},
					)
					.optional()
					.nullable(),
			}),
			formulaArr: z.array(
				z.string({
					required_error: "Item da fórmula da comissão não informado.",
					invalid_type_error:
						"Tipo não válido para item da fórmula da comissão.",
				}),
			),
		}),
	),
});
export type TUserComissionItem = z.infer<typeof ComissionItemSchema>;
export const GeneralUserSchema = z.object({
	nome: z.string({
		required_error: "Nome do usuário não informado.",
		invalid_type_error: "Tipo não válido para o nome do usuário.",
	}),
	administrador: z.boolean({
		required_error: "Permissão de administrador não informada.",
		invalid_type_error: "Tipo não válido para permissão de administrador.",
	}),
	telefone: z
		.string({
			invalid_type_error: "Tipo não válido para o telefone do usuário.",
		})
		.optional()
		.nullable(),
	email: z
		.string({
			required_error: "Email do usuário não informado.",
			invalid_type_error: "Tipo não válido para o email do usuário.",
		})
		.email({
			message: "Email do usuário não válido.",
		}),
	dataNascimento: z
		.string({
			required_error: "Data de nascimento do usuário não informada.",
			invalid_type_error:
				"Tipo não válido para a data de nascimento do usuário.",
		})
		.datetime({
			message: "Data de nascimento do usuário não válida.",
		})
		.optional()
		.nullable(),
	senha: z.string({
		required_error: "Senha do usuário não informada.",
		invalid_type_error: "Tipo não válido para a senha do usuário.",
	}),
	avatar_url: z
		.string({
			invalid_type_error: "Tipo não válido para a URL do avatar do usuário.",
		})
		.optional()
		.nullable(),
	idParceiro: z.string({
		required_error: "ID do parceiro não informado.",
		invalid_type_error: "Tipo não válido para o ID do parceiro.",
	}),
	idGrupo: z.string({
		required_error: "ID do grupo não informado.",
		invalid_type_error: "Tipo não válido para o ID do grupo.",
	}),
	permissoes: PermissionsSchema,
	comissoes: z.object({
		semSDR: z
			.number({
				required_error: "Comissão sem SDR não informada.",
				invalid_type_error: "Tipo não válido para a comissão sem SDR.",
			})
			.optional()
			.nullable(),
		comSDR: z
			.number({
				required_error: "Comissão com SDR não informada.",
				invalid_type_error: "Tipo não válido para a comissão com SDR.",
			})
			.optional()
			.nullable(),
	}),
	comissionamento: z.array(ComissionItemSchema),
	codigoIndicacaoConecta: z
		.string({
			invalid_type_error:
				"Tipo não válido para o código de indicação do Conecta.",
		})
		.optional()
		.nullable(),
	ativo: z.boolean({
		required_error: "Status de ativo do usuário não informado.",
		invalid_type_error: "Tipo não válido para o status de ativo do usuário.",
	}),
	dataInsercao: z
		.string({
			invalid_type_error: "Tipo não válido para a data de inserção do usuário.",
		})
		.datetime({
			message: "Data de inserção do usuário não válida.",
		})
		.optional()
		.nullable(),
	dataAlteracao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de alteração do usuário.",
		})
		.datetime({
			message: "Data de alteração do usuário não válida.",
		})
		.optional()
		.nullable(),
	dataExclusao: z
		.string({
			invalid_type_error: "Tipo não válido para a data de exclusão do usuário.",
		})
		.datetime({
			message: "Data de exclusão do usuário não válida.",
		})
		.optional()
		.nullable(),
});

export type TUser = z.infer<typeof GeneralUserSchema>;
export type TUserDTO = TUser & { _id: string };

export type TUserDTOWithSaleGoals = TUserDTO & { metas: TSaleGoalDTO[] };

export type TUserEntity = TUser;

export type TUserSimplified = Pick<
	TUser,
	"nome" | "email" | "telefone" | "avatar_url"
>;
export type TUserDTOSimplified = Pick<
	TUserDTO,
	| "_id"
	| "ativo"
	| "nome"
	| "email"
	| "telefone"
	| "avatar_url"
	| "dataInsercao"
	| "dataAlteracao"
	| "dataExclusao"
>;

export type TSessionUser = Pick<
	TUser,
	| "administrador"
	| "nome"
	| "telefone"
	| "email"
	| "nome"
	| "avatar_url"
	| "idParceiro"
	| "idGrupo"
	| "permissoes"
	| "codigoIndicacaoConecta"
> & {
	id: string;
	parceiro: {
		nome: TPartner["nome"];
		logo_url: TPartner["logo_url"];
	};
};
export const simplifiedProjection = {
	ativo: true,
	nome: true,
	email: true,
	telefone: true,
	avatar_url: true,
	dataInsercao: true,
	dataAlteracao: true,
	dataExclusao: true,
};

export const UsersQueryFiltersSchema = z.object({
	page: z
		.number({
			required_error: "Página não informada.",
			invalid_type_error: "Tipo não válido para a página.",
		})
		.min(1, "Página não pode ser menor que 1."),
	name: z.string({
		required_error: "Nome do usuário para filtro não informado.",
		invalid_type_error: "Tipo não válido para o nome do usuário para filtro.",
	}),
	email: z.string({
		required_error: "Email do usuário para filtro não informado.",
		invalid_type_error: "Tipo não válido para o email do usuário para filtro.",
	}),
	period: z.object({
		field: z
			.enum(["dataInsercao", "dataAlteracao", "dataExclusao"])
			.optional()
			.nullable(),
		after: z
			.string({
				required_error:
					"Data depois da qual o filtro deve ser aplicado não informada.",
				invalid_type_error:
					"Tipo não válido para a data depois da qual o filtro deve ser aplicado.",
			})
			.optional()
			.nullable(),
		before: z
			.string({
				required_error:
					"Data antes da qual o filtro deve ser aplicado não informada.",
				invalid_type_error:
					"Tipo não válido para a data antes da qual o filtro deve ser aplicado.",
			})
			.optional()
			.nullable(),
	}),
	activeOnly: z.boolean({
		required_error: "Filtrar somente usuários ativos não informado.",
		invalid_type_error:
			"Tipo não válido para o filtro de somente usuários ativos.",
	}),
	nonDeletedOnly: z.boolean({
		required_error: "Filtrar somente usuários não deletados não informado.",
		invalid_type_error:
			"Tipo não válido para o filtro de somente usuários não deletados.",
	}),
});
export type TUsersQueryFilters = z.infer<typeof UsersQueryFiltersSchema>;
