import { z } from "zod";

const PPSCallClientSchema = z.object({
	nome: z.string({ required_error: "Nome do cliente não informado.", invalid_type_error: "Tipo não válido para o nome do cliente." }),
	email: z.string({ required_error: "Email do cliente não informado.", invalid_type_error: "Tipo não válido para o email do cliente." }),
	telefone: z.string({ required_error: "Telefone do cliente não informado.", invalid_type_error: "Tipo não válido para o telefone do cliente." }),
	cpfCnpj: z.string({
		required_error: "CPF ou CNPJ do cliente não informado.",
		invalid_type_error: "Tipo não válido para o CPF ou CNPJ do cliente.",
	}),
	dataNascimento: z
		.string({ invalid_type_error: "Tipo não válido para a data de nascimento do cliente." })
		.datetime({ message: "Formato inválido para data de nascimento do cliente." })
		.optional()
		.nullable(),
	profissao: z.string({ invalid_type_error: "Tipo não válido para a profissão do cliente." }).optional().nullable(),
	renda: z.number({ invalid_type_error: "Tipo não válido para renda do cliente." }).optional().nullable(),
	tipo: z.enum(["CPF", "CNPJ"], {
		required_error: "Tipo do cliente não informado.",
		invalid_type_error: "Tipo não válido para o tipo de pessoa do cliente.",
	}),
	cep: z.string({ invalid_type_error: "Tipo não válido para o CEP do cliente." }).optional().nullable(),
	uf: z.string({
		required_error: "UF de localização da oportunidade não informada.",
		invalid_type_error: "Tipo não válido para a UF de localização da oportunidade.",
	}),
	cidade: z.string({
		required_error: "Cidade de localização da oportunidade não informada.",
		invalid_type_error: "Tipo não válido para a cidade de localização da oportunidade.",
	}),
	bairro: z.string({ invalid_type_error: "Tipo não válido para o bairro do cliente." }).optional().nullable(),
	endereco: z.string({ invalid_type_error: "Tipo não válido para o endereço do cliente." }).optional().nullable(),
	numeroOuIdentificador: z.string({ invalid_type_error: "Tipo não válido para o número ou identificador do cliente." }).optional().nullable(),
	complemento: z.string({ invalid_type_error: "Tipo não válido para o complemento de endereço do cliente." }).optional().nullable(),
});
const PPSCallProjectSchema = z.object({
	id: z.string({ required_error: "ID de referência da oportunidade do chamado não informado." }).optional().nullable(),
	nome: z.string({ required_error: "Nome de referência da oportunidade do chamado não informado." }).optional().nullable(),
	codigo: z.string({ required_error: "Código identificador de referência da oportunidade do chamado não informado." }).optional().nullable(),
});
const PPSCallRequerentSchema = z.object({
	apelido: z.string({
		required_error: "Nome/apelido do requerente não informado.",
		invalid_type_error: "Tipo não válido para o nome/apelido do requerente.",
	}),
	idCRM: z
		.string({
			required_error: "ID de referência do requerente não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do requerente.",
		})
		.optional()
		.nullable(),
	nomeCRM: z
		.string({
			required_error: "Nome do requerente não informado.",
			invalid_type_error: "Tipo não válido para o nome do requerente.",
		})
		.optional()
		.nullable(),
	avatar_url: z.string({ invalid_type_error: "Tipo não válido para a URL do avatar do requerente." }).optional().nullable(),
});
const PPSCallResponsibleSchema = z.object({
	id: z
		.string({
			required_error: "ID de referência do responsável pelo chamado não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do responsável pelo chamado.",
		})
		.optional()
		.nullable(),
	ativo: z.boolean({ invalid_type_error: "Tipo não válido para o status de ativação do responsável do chamado." }),
	apelido: z.string({
		required_error: "Apelido do responsável pelo chamado não informado.",
		invalid_type_error: "Tipo não válido para o apelido do responsável do chamado.",
	}),
	avatar_url: z
		.string({
			required_error: "URL do avatar do responsável pelo chamado não informada.",
			invalid_type_error: "Tipo não válido para a URL do avatar do responsável pelo chamado.",
		})
		.optional()
		.nullable(),
});
const PPSCallPremissesSchema = z.object({
	cargas: z
		.array(
			z.object({
				descricao: z.string({
					required_error: "Descrição do item de carga não informado.",
					invalid_type_error: "Tipo não válido para a descrição do item de carga.",
				}),
				horasFuncionamento: z.number({
					required_error: "Horas de funcionamento do item de carga não informado.",
					invalid_type_error: "Tipo não válido para as horas de funcionamento do item de carga.",
				}),
				potencia: z.number({
					required_error: "Potência do item de carga não informada.",
					invalid_type_error: "Tipo não válido para a potência do item de carga.",
				}),
				qtde: z.number({
					required_error: "Quantidade do item de carga não informado.",
					invalid_type_error: "Tipo não válido para a quantidade do item de carga.",
				}),
			}),
		)
		.optional()
		.nullable(),
	geracao: z.number({ invalid_type_error: "Tipo não válido para a premissa de geração do chamado." }).optional().nullable(),
	tipoEstrutura: z.string({ invalid_type_error: "Tipo não válido para a premissa de tipo de estrutura do chamado." }).optional().nullable(),
	topologia: z.string({ invalid_type_error: "Tipo não válido para a premissa de topologia do chamado." }).optional().nullable(),
	valorFinanciamento: z.number({ invalid_type_error: "Tipo não válido para a premissa de valor de financiamento do chamado." }).optional().nullable(),
});

const GeneralPPSCallSchema = z.object({
	status: z.enum(["PENDENTE", "EM ANDAMENTO", "AGUARDANDO VENDEDOR", "REALIZADO"], {
		required_error: "Status de resolução do chamado não informado.",
		invalid_type_error: "Tipo não válido para o status de resolução do chamado.",
	}),
	tipoSolicitacao: z
		.enum(
			["PROPOSTA COMERCIAL (ON GRID)", "PROPOSTA COMERCIAL (OFF GRID)", "ANÁLISE DE CRÉDITO", "DUVIDAS E AUXILIOS TÉCNICOS", "OUTROS", "NÃO DEFINIDO"],
			{
				required_error: "Tipo de solicitação do chamado não informado.",
				invalid_type_error: "Tipo não válido para o tipo de solicitação do chamado.",
			},
		)
		.optional()
		.nullable(),
	anotacoes: z.string({
		required_error: "Anotações do chamado não informadas.",
		invalid_type_error: "Tipo não válido para as anotações do chamado.",
	}),
	observacoes: z.string({
		required_error: "Observações do chamado não informadas.",
		invalid_type_error: "Tipo não válido para as anotações do chamado.",
	}),
	cliente: PPSCallClientSchema,
	projeto: PPSCallProjectSchema,
	requerente: PPSCallRequerentSchema,
	responsavel: PPSCallResponsibleSchema.optional().nullable(),
	premissas: PPSCallPremissesSchema,
	links: z
		.array(
			z.object({
				title: z.string({
					required_error: "Título do arquivo de anexo não fornecido.",
					invalid_type_error: "Tipo não válido para o título do arquivo de anexo.",
				}),
				format: z.string({
					required_error: "Formato do arquivo de anexo não fornecido.",
					invalid_type_error: "Tipo não válido para o formato do arquivo de anexo.",
				}),
				link: z.string({
					required_error: "Link URL do arquivo de anexo não fornecido.",
					invalid_type_error: "Tipo não válido para o link URL do arquivo de anexo.",
				}),
			}),
		)
		.optional()
		.nullable(),
	dataEfetivacao: z
		.string({
			required_error: "Data de efetivação do chamado não informada.",
			invalid_type_error: "Tipo não válido para a data de efetivação do chamado.",
		})
		.optional()
		.nullable(),
	dataInsercao: z.string({
		required_error: "Data de inserção do chamado não informada.",
		invalid_type_error: "Tipo não válido para a data de inserção do chamado.",
	}),
});

export const InsertPPSCallSchema = z.object({
	status: z.enum(["PENDENTE", "EM ANDAMENTO", "AGUARDANDO VENDEDOR", "REALIZADO"], {
		required_error: "Status de resolução do chamado não informado.",
		invalid_type_error: "Tipo não válido para o status de resolução do chamado.",
	}),
	tipoSolicitacao: z
		.enum(
			["PROPOSTA COMERCIAL (ON GRID)", "PROPOSTA COMERCIAL (OFF GRID)", "ANÁLISE DE CRÉDITO", "DUVIDAS E AUXILIOS TÉCNICOS", "OUTROS", "NÃO DEFINIDO"],
			{
				required_error: "Tipo de solicitação do chamado não informado.",
				invalid_type_error: "Tipo não válido para o tipo de solicitação do chamado.",
			},
		)
		.optional()
		.nullable(),
	anotacoes: z.string({
		required_error: "Anotações do chamado não informadas.",
		invalid_type_error: "Tipo não válido para as anotações do chamado.",
	}),
	observacoes: z.string({
		required_error: "Observações do chamado não informadas.",
		invalid_type_error: "Tipo não válido para as anotações do chamado.",
	}),
	cliente: PPSCallClientSchema,
	projeto: PPSCallProjectSchema,
	requerente: PPSCallRequerentSchema,
	responsavel: PPSCallResponsibleSchema.optional().nullable(),
	premissas: PPSCallPremissesSchema,
	links: z
		.array(
			z.object({
				title: z.string({
					required_error: "Título do arquivo de anexo não fornecido.",
					invalid_type_error: "Tipo não válido para o título do arquivo de anexo.",
				}),
				format: z.string({
					required_error: "Formato do arquivo de anexo não fornecido.",
					invalid_type_error: "Tipo não válido para o formato do arquivo de anexo.",
				}),
				link: z.string({
					required_error: "Link URL do arquivo de anexo não fornecido.",
					invalid_type_error: "Tipo não válido para o link URL do arquivo de anexo.",
				}),
			}),
		)
		.optional()
		.nullable(),
	dataEfetivacao: z
		.string({
			required_error: "Data de efetivação do chamado não informada.",
			invalid_type_error: "Tipo não válido para a data de efetivação do chamado.",
		})
		.optional()
		.nullable(),
	dataInsercao: z.string({
		required_error: "Data de inserção do chamado não informada.",
		invalid_type_error: "Tipo não válido para a data de inserção do chamado.",
	}),
});

export type TPPSCall = z.infer<typeof GeneralPPSCallSchema>;
export type TPPSCallDTO = TPPSCall & { _id: string };
