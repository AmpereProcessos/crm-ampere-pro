import z from "zod";
import type { TSaleGoalDTO } from "./sale-goal.schema";
import type { TPartner } from "./partner.schema";

const ComissionScenarioConditionTypes = z.enum(["IGUAL_TEXTO", "IGUAL_NÚMERICO", "MAIOR_QUE_NÚMERICO", "MENOR_QUE_NÚMERICO", "INTERVALO_NÚMERICO", "INCLUI_LISTA"], {
	required_error: "Tipo de condicional não informado.",
	invalid_type_error: "Tipo não válido para tipo de condicional.",
});
export type TComissionScenarioConditionType = z.infer<typeof ComissionScenarioConditionTypes>;
export const AuthorSchema = z.object({
	id: z.string({
		required_error: "ID de referência do autor não fornecido.",
		invalid_type_error: "Tipo não válido para o ID do autor.",
	}),
	nome: z.string({
		required_error: "Nome do autor não fornecido.",
		invalid_type_error: "Tipo não válido para o nome do autor.",
	}),
	avatar_url: z.string({ invalid_type_error: "Avatar do autor não fornecido." }).optional().nullable(),
});
export type TAuthor = z.infer<typeof AuthorSchema>;

export const PermissionsSchema = z.object({
	usuarios: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de usuários não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de usuários.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de usuários não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de usuários.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de usuários não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de usuários.",
		}),
	}),
	comissoes: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de comissões não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de comissões.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de comissões não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de comissões.",
		}),
	}),
	kits: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de kits não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de kits.",
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
			invalid_type_error: "Tipo não válido para permissão de visualização de produtos.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de produtos não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de produtos.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de produtos não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de produtos.",
		}),
	}),
	servicos: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de serviços não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de serviços.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de serviços não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de serviços.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de serviços não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de serviços.",
		}),
	}),
	planos: z.object({
		visualizar: z.boolean({
			required_error: "Permissão de visualização de planos comerciais não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de planos comerciais.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de planos comerciais não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de planos comerciais.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de planos comerciais não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de planos comerciais.",
		}),
	}),
	propostas: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de proposta não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de proposta.",
				}),
				{
					required_error: "Escopo de visualização de propostas não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de propostas.",
				},
			)
			.optional()
			.nullable(),
		visualizar: z.boolean({
			required_error: "Permissão de visualização de propostas não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de propostas.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de propostas não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de propostas.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de propostas não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de propostas.",
		}),
	}),
	oportunidades: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de oportunidades não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de oportunidades.",
				}),
				{
					required_error: "Escopo de visualização de oportunidades não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de oportunidades.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error: "Permissão de visualização de oportunidades não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de oportunidades.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de oportunidades não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de oportunidades.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de oportunidades não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de oportunidades.",
		}),
		excluir: z
			.boolean({
				required_error: "Permissão de exclusão de oportunidades não informada.",
				invalid_type_error: "Tipo não válido para permissão de exclusão de oportunidades.",
			})
			.optional()
			.nullable(),
	}),
	analisesTecnicas: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de análises técnicas não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de análises técnicas.",
				}),
				{
					required_error: "Escopo de visualização de análises técnicas não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de análises técnicas.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error: "Permissão de visualização de análises técnicas não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de análises técnicas.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de análises técnicas não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de análises técnicas.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de análises técnicas não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de análises técnicas.",
		}),
	}),
	homologacoes: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de homologações não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de homologações.",
				}),
				{
					required_error: "Escopo de visualização de homologações não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de homologações.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error: "Permissão de visualização de homologações não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de homologações.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de homologações não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de homologações.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de homologações não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de homologações.",
		}),
	}),
	clientes: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de clientes não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de clientes.",
				}),
				{
					required_error: "Escopo de visualização de clientes não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de clientes.",
				},
			)
			.optional()
			.nullable(),
		visualizar: z.boolean({
			required_error: "Permissão de visualização de clientes não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de clientes.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de clientes não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de clientes.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de clientes não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de clientes.",
		}),
	}),
	projetos: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de projetos não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de projetos.",
				}),
				{
					required_error: "Escopo de visualização de projetos não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de projetos.",
				},
			)
			.optional()
			.nullable(), // refere-se ao escopo de atuação
		visualizar: z.boolean({
			required_error: "Permissão de visualização de projetos não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de projetos.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de projetos não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de projetos.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de projetos não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de projetos.",
		}),
	}),
	parceiros: z.object({
		escopo: z
			.array(
				z.string({
					required_error: "Item do escopo de visualização de parceiros não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de parceiros.",
				}),
				{
					required_error: "Escopo de visualização de parceiros não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de parceiros.",
				},
			)
			.optional()
			.nullable(),
		visualizar: z.boolean({
			required_error: "Permissão de visualização de parceiros não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de parceiros.",
		}),
		editar: z.boolean({
			required_error: "Permissão de edição de parceiros não informada.",
			invalid_type_error: "Tipo não válido para permissão de edição de parceiros.",
		}),
		criar: z.boolean({
			required_error: "Permissão de criação de parceiros não informada.",
			invalid_type_error: "Tipo não válido para permissão de criação de parceiros.",
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
					required_error: "Item do escopo de visualização de resultados não informado.",
					invalid_type_error: "Tipo não válido para item do escopo de visualização de resultados.",
				}),
				{
					required_error: "Escopo de visualização de resultados não fornecido.",
					invalid_type_error: "Tipo não válido para escopo de visualização de resultados.",
				},
			)
			.optional()
			.nullable(),
		visualizarComercial: z.boolean({
			required_error: "Permissão de visualização de resultados comerciais não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de resultados comerciais.",
		}),
		visualizarOperacional: z.boolean({
			required_error: "Permissão de visualização de resultados operacionais não informada.",
			invalid_type_error: "Tipo não válido para permissão de visualização de resultados operacionais.",
		}),
	}),
	configuracoes: z.object({
		parceiro: z.boolean({
			required_error: "Permissão de configuração de parceiro não informada.",
			invalid_type_error: "Tipo não válido para permissão de configuração de parceiro.",
		}), // able to edit logo, name, etc...
		precificacao: z.boolean({
			required_error: "Permissão de configuração de precificação não informada.",
			invalid_type_error: "Tipo não válido para permissão de configuração de precificação.",
		}), // able to edit margin percentage and tax aliquot
		metodosPagamento: z.boolean({
			required_error: "Permissão de configuração de métodos de pagamento não informada.",
			invalid_type_error: "Tipo não válido para permissão de configuração de métodos de pagamento.",
		}),
		tiposProjeto: z.boolean({
			required_error: "Permissão de configuração de tipos de projeto não informada.",
			invalid_type_error: "Tipo não válido para permissão de configuração de tipos de projeto.",
		}),
		funis: z.boolean({
			required_error: "Permissão de configuração de funis não informada.",
			invalid_type_error: "Tipo não válido para permissão de configuração de funis.",
		}),
		gruposUsuarios: z.boolean({
			required_error: "Permissão de configuração de grupos de usuários não informada.",
			invalid_type_error: "Tipo não válido para configuração de grupos de usuários.",
		}),
	}),
	integracoes: z.object({
		receberLeads: z.boolean({
			required_error: "Permissão de recebimento de leads por integração não informada.",
			invalid_type_error: "Tipo não válido para permissão de recebimento de leads por integração.",
		}),
	}),
});
export type TUserPermissions = z.infer<typeof PermissionsSchema>;

const ComissionSchema = z.object({
	aplicavel: z.boolean({
		required_error: "Aplicabilidade de comissão ao usuário não informada.",
		invalid_type_error: "Tipo não válido para a aplicabilidade de comissão ao usuário.",
	}),
	resultados: z.array(
		z.object({
			condicao: z.object({
				tipo: ComissionScenarioConditionTypes.optional().nullable(),
				aplicavel: z.boolean({
					required_error: "Aplicabilidade de condição no resultado não informada.",
					invalid_type_error: "Tipo não válido para aplicabilidade de condição no resultado.",
				}),
				variavel: z
					.string({
						required_error: "Variável de condição no resultado não informada.",
						invalid_type_error: "Tipo não válido para variável de condição no resultado.",
					})
					.optional()
					.nullable(),
				igual: z
					.string({
						required_error: "Valor de comparação de igualdade da condição não informado.",
						invalid_type_error: "Tipo não válido para o valor de comparação de igualdade da condição.",
					})
					.optional()
					.nullable(),
				maiorQue: z
					.number({
						required_error: "Valor de comparação de maior que não informado.",
						invalid_type_error: "Tipo não válido para valor de comparação de maior que.",
					})
					.optional()
					.nullable(),
				menorQue: z
					.number({
						required_error: "Valor de comparação de menor que não informado.",
						invalid_type_error: "Tipo não válido para valor de comparação de menor que.",
					})
					.optional()
					.nullable(),
				entre: z
					.object({
						minimo: z.number({
							required_error: "Valor mínimo do intervalo de comparação númerico não informado.",
							invalid_type_error: "Tipo não válido para o valor mínimo do invervalo de comparação númerico.",
						}),
						maximo: z.number({
							required_error: "Valor máximo do intervalo de comparação númerico não informado.",
							invalid_type_error: "Tipo não válido para o valor máximo do invervalo de comparação númerico.",
						}),
					})
					.optional()
					.nullable(),
				inclui: z
					.array(
						z.string({
							required_error: "Texto de comparação da lista de opções da condição não informado.",
							invalid_type_error: "Tipo não válido para texto de comparação da lista de opções da condição.",
						}),
						{
							required_error: "Lista de opções de comparação não informada.",
							invalid_type_error: "Tipo não válido para lista de opções de comparação.",
						},
					)
					.optional()
					.nullable(),
			}),
			formulaArr: z.array(
				z.string({
					required_error: "Item da fórmula não informada.",
					invalid_type_error: "Tipo não válido para item da fórmula.",
				}),
			),
		}),
	),
});
export type TUserComission = z.infer<typeof ComissionSchema>;
const GeneralUserSchema = z.object({
	nome: z.string(),
	administrador: z.boolean(),
	telefone: z.string().optional().nullable(),
	email: z.string().email(),
	senha: z.string(),
	avatar_url: z.string().optional().nullable(),
	idParceiro: z.string(),
	idGrupo: z.string(),
	permissoes: PermissionsSchema,
	comissoes: z.object({
		semSDR: z.number().optional().nullable(),
		comSDR: z.number().optional().nullable(),
	}),
	comissionamento: ComissionSchema,
	codigoIndicacaoConecta: z
		.string({
			invalid_type_error: "Tipo não válido para o código de indicação do Conecta.",
		})
		.optional()
		.nullable(),
	ativo: z.boolean(),
	dataInsercao: z.string().datetime().optional().nullable(),
	dataAlteracao: z.string().datetime().optional().nullable(),
});

export const InsertUserSchema = z.object({
	nome: z
		.string({
			required_error: "Nome do usuário não informado.",
			invalid_type_error: "Tipo não válido para nome do usuário.",
		})
		.min(3, "É necessário que o nome do usuário tenha ao menos 3 letras."),
	administrador: z.boolean({
		required_error: "Tag de administrador não informada.",
		invalid_type_error: "Tipo não válido para tag de administrador.",
	}),
	telefone: z.string().optional().nullable(),
	email: z
		.string({
			required_error: "Email do usuário não informado.",
			invalid_type_error: "Tipo não válido para email do usuário.",
		})
		.email({ message: "Formato inválido de email." }),
	senha: z
		.string({
			required_error: "Senha do usuário não informada.",
			invalid_type_error: "Tipo não válido para senha do usuário.",
		})
		.min(5, "É necessário que a senha do usuário tenha ao menos 5 caracteres."),
	avatar_url: z
		.string({
			invalid_type_error: "Tipo não válido para URL do avatar do usuário.",
		})
		.optional()
		.nullable(),
	idParceiro: z.string({
		invalid_type_error: "Tipo não válido para ID do parceiro do usuário.",
	}),
	idGrupo: z
		.string({
			required_error: "Grupo do usuário não informado.",
			invalid_type_error: "Tipo não válido para o grupo do usuário.",
		})
		.min(15, "ID de grupo de usuário inválido."),
	permissoes: PermissionsSchema,
	comissoes: z.object({
		semSDR: z.number().optional().nullable(),
		comSDR: z.number().optional().nullable(),
	}),
	comissionamento: ComissionSchema,
	codigoIndicacaoConecta: z
		.string({
			invalid_type_error: "Tipo não válido para o código de indicação do Conecta.",
		})
		.optional()
		.nullable(),
	ativo: z.boolean(),
	dataInsercao: z.string().datetime().optional().nullable(),
	dataAlteracao: z.string().datetime().optional().nullable(),
});

export type TUser = z.infer<typeof GeneralUserSchema>;
export type TUserDTO = TUser & { _id: string };

export type TUserDTOWithSaleGoals = TUserDTO & { metas: TSaleGoalDTO[] };

export type TUserEntity = TUser;

export type TUserSimplified = Pick<TUser, "nome" | "email" | "telefone" | "avatar_url">;
export type TUserDTOSimplified = Pick<TUserDTO, "_id" | "nome" | "email" | "telefone" | "avatar_url">;

export type TSessionUser = Pick<TUser, "administrador" | "nome" | "telefone" | "email" | "nome" | "avatar_url" | "idParceiro" | "idGrupo" | "permissoes"> & {
	id: string;
	parceiro: {
		nome: TPartner["nome"];
		logo_url: TPartner["logo_url"];
	};
};
export const simplifiedProjection = {
	nome: true,
	email: true,
	telefone: true,
	avatar_url: true,
};
