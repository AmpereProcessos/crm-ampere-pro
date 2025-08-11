import { z } from "zod";
import { AuthorSchema } from "./user.schema";

export const RestrictionSchema = z.object({
	aplicavel: z.boolean({ invalid_type_error: "Tipo não válido para a aplicabilidade da restrição." }).optional().nullable(),
	observacoes: z.string({ invalid_type_error: "Tipo não válido para as observações da restrição." }).optional().nullable(),
	data: z.string({ invalid_type_error: "Tipo não válido para a data da restrição." }).datetime().optional().nullable(),
	autor: z.object({
		id: z.string({ invalid_type_error: "Tipo não válido para o ID do autor da restrição." }),
		nome: z.string({ invalid_type_error: "Tipo não válido para o nome do autor da restrição." }),
		avatar: z.string({ invalid_type_error: "Tipo não válido para o avatar do autor da restrição." }).optional().nullable(),
	}),
});

export const ClientIndicatorSchema = z.object({
	id: z
		.string({
			invalid_type_error: "Tipo não válido para o ID do indicador.",
		})
		.optional()
		.nullable(),
	nome: z
		.string({
			invalid_type_error: "Tipo não válido para o nome do indicador.",
		})
		.optional()
		.nullable(),
	contato: z
		.string({
			invalid_type_error: "Tipo não válido para o contato do indicador.",
		})
		.optional()
		.nullable(),
});
export const ClientConectaSchema = z.object({
	usuario: z.string({
		required_error: "Usuário não informado.",
		invalid_type_error: "Tipo não válido para o usuário.",
	}),
	senha: z.string({
		required_error: "Senha não informada.",
		invalid_type_error: "Tipo não válido para a senha.",
	}),
	email: z
		.string({
			invalid_type_error: "Tipo não válido para o email do usuário.",
		})
		.optional()
		.nullable(),
	avatar_url: z
		.string({
			invalid_type_error: "Tipo não válido para avatar do usuário.",
		})
		.optional()
		.nullable(),
	conviteId: z.string({ invalid_type_error: "Tipo não válido para ID do convite." }).optional().nullable(),
	conviteDataAceite: z
		.string({
			invalid_type_error: "Tipo não válido para data de aceite do convite.",
		})
		.optional()
		.nullable(),
	codigoIndicacaoVendedor: z
		.string({
			invalid_type_error: "Tipo não válido para código de indicação do vendedor.",
		})
		.optional()
		.nullable(),
	creditos: z
		.number({
			invalid_type_error: "Tipo não válido para o número de créditos do usuário.",
		})
		.optional()
		.nullable(),

	googleId: z
		.string({
			invalid_type_error: "Tipo não válido para o ID google do cliente.",
		})
		.optional()
		.nullable(),
	googleRefreshToken: z
		.string({
			invalid_type_error: "Tipo não válido para o token de revalidações google do cliente.",
		})
		.optional()
		.nullable(),
});

export const GeneralClientSchema = z.object({
	nome: z
		.string({
			required_error: "Nome do cliente não informado.",
			invalid_type_error: "Tipo não válido para nome do cliente.",
		})
		.min(3, "É necessário um nome de ao menos 3 letras para o cliente."),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	cpfCnpj: z.string({ invalid_type_error: "Tipo não válido para CPF/CNPJ do cliente." }).optional().nullable(),
	rg: z.string({ invalid_type_error: "Tipo não válido para RG do cliente." }).optional().nullable(),
	telefonePrimario: z.string({
		required_error: "Telefone primário do cliente não informado.",
		invalid_type_error: "Tipo não válido para nome do cliente.",
	}),
	// .min(14, 'Formato inválido para telefone primário. O mínimo de caracteres é 14.')
	telefoneSecundario: z.string().optional().nullable(),
	email: z.string({ invalid_type_error: "Tipo não válido para email do cliente." }).optional().nullable(),
	cep: z.string({ invalid_type_error: "Tipo não válido para CEP do cliente." }).optional().nullable(),
	uf: z.string({
		required_error: "UF do cliente não informada.",
		invalid_type_error: "Tipo não válido para UF do cliente.",
	}),
	cidade: z.string({
		required_error: "Cidade não informada.",
		invalid_type_error: "Tipo não válido para cidade do cliente.",
	}),
	bairro: z.string({ invalid_type_error: "Tipo não válido para bairro do cliente." }).optional().nullable(),
	endereco: z.string({ invalid_type_error: "Tipo não válido para endereço do cliente." }).optional().nullable(),
	numeroOuIdentificador: z
		.string({
			invalid_type_error: "Tipo não válido para número/identificador.",
		})
		.optional()
		.nullable(),
	complemento: z
		.string({
			invalid_type_error: "Tipo não válido para complemento de endereço.",
		})
		.optional()
		.nullable(),
	dataNascimento: z
		.string({
			invalid_type_error: "Tipo não válido para data de nascimento do cliente.",
		})
		.datetime({ message: "Formato inválido para data de nascimento." })
		.optional()
		.nullable(),
	profissao: z
		.string({
			invalid_type_error: "Tipo não válido para profissão do cliente.",
		})
		.optional()
		.nullable(),
	ondeTrabalha: z
		.string({
			invalid_type_error: "Tipo não válido para o lugar de trabalho do cliente.",
		})
		.optional()
		.nullable(),
	estadoCivil: z
		.string({
			invalid_type_error: "Tipo não válido para estado civil do cliente.",
		})
		.optional()
		.nullable(),
	deficiencia: z.string({ invalid_type_error: "Tipo inválido para deficiência." }).optional().nullable(),
	canalAquisicao: z.string({
		required_error: "Canal de aquisição não informado.",
		invalid_type_error: "Tipo não válido para canal de aquisição.",
	}),
	dataInsercao: z
		.string({
			required_error: "Data de inserção não informada.",
			invalid_type_error: "Tipo não válido para data de inserção.",
		})
		.datetime({ message: "Formato inválido para data de inserção." }),
	idIndicacao: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de referência da indicação.",
		})
		.optional()
		.nullable(),
	idMarketing: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de marketing.",
		})
		.optional()
		.nullable(),
	restricao: RestrictionSchema.optional().nullable(),
	indicador: ClientIndicatorSchema,
	conecta: ClientConectaSchema.optional().nullable(),
	autor: AuthorSchema,
});

export type TClient = z.infer<typeof GeneralClientSchema>;

// export type TClientEntity = TClient & { _id: ObjectId }

export type TClientDTO = TClient & { _id: string };

export type TSimilarClientSimplifiedDTO = Pick<
	TClientDTO,
	"_id" | "nome" | "autor" | "telefonePrimario" | "email" | "cpfCnpj" | "cep" | "uf" | "cidade" | "bairro" | "endereco" | "numeroOuIdentificador" | "complemento" | "dataInsercao"
>;
export type TSimilarClientSimplified = Pick<
	TClient,
	"nome" | "autor" | "telefonePrimario" | "email" | "cpfCnpj" | "cep" | "uf" | "cidade" | "bairro" | "endereco" | "numeroOuIdentificador" | "complemento"
>;
export type TClientSimplified = Pick<
	TClient,
	| "nome"
	| "telefonePrimario"
	| "email"
	| "cpfCnpj"
	| "cep"
	| "uf"
	| "cidade"
	| "bairro"
	| "endereco"
	| "numeroOuIdentificador"
	| "complemento"
	| "autor"
	| "conecta"
	| "dataInsercao"
>;
export type TClientDTOSimplified = TClientSimplified & { _id: string };
export const SimilarClientsSimplifiedProjection = {
	_id: 1,
	nome: 1,
	telefonePrimario: 1,
	email: 1,
	cpfCnpj: 1,
	autor: 1,
	cep: 1,
	uf: 1,
	cidade: 1,
	bairro: 1,
	endereco: 1,
	numeroOuIdentificador: 1,
	complemento: 1,
	conecta: 1,
	dataInsercao: 1,
};
export const ClientSimplifiedProjection = {
	_id: 1,
	nome: 1,
	telefonePrimario: 1,
	email: 1,
	cpfCnpj: 1,
	cep: 1,
	uf: 1,
	cidade: 1,
	bairro: 1,
	endereco: 1,
	numeroOuIdentificador: 1,
	complemento: 1,
	autor: 1,
	conecta: 1,
	dataInsercao: 1,
};

const PersonalizedFiltersSchema = z.object({
	name: z.string({
		required_error: "Filtro de nome não informado.",
		invalid_type_error: "Tipo não válido para filtro de nome.",
	}),
	phone: z.string({
		required_error: "Filtro de telefone não informado.",
		invalid_type_error: "Tipo não válido para filtro de telefone.",
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
	acquisitionChannel: z.array(
		z.string({
			required_error: "Canal de aquisição de filtro não informada.",
			invalid_type_error: "Tipo não válido para canal de aquisição de filtro.",
		}),
		{
			required_error: "Lista de canais de aquisição de filtro não informada.",
			invalid_type_error: "Tipo não válido para lista de canais de aquisição de filtro.",
		},
	),
});
export type TPersonalizedClientsFilter = z.infer<typeof PersonalizedFiltersSchema>;
export const PersonalizedClientQuerySchema = z.object({
	authors: z
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
	filters: PersonalizedFiltersSchema,
});
