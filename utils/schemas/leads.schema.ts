import z from "zod";
import { AuthorSchema } from "./user.schema";

// Precisamos saber o contato (telefone).
// Precisamos obter dados adicionais, como nome, uf, cidade.
// Precisamos saber quando o contato foi feito (de modo a entender as pendências).

const Attribute = {
	nome: "VALOR DA CONTA DE ENERGIA",
	identificador: "valor_conta_energia",
	valor: "R$ 100,00 à R$ 200,00", // uma lista de opções, por exemplo.
	peso: 1, // 0 a 10
};

export const LeadQualificationSchema = z.object({
	score: z
		.number({
			required_error: "Score do qualificador do lead não informado.",
			invalid_type_error: "Tipo não válido para o score do qualificador do lead.",
		})
		.min(0, "Score do qualificador do lead deve ser maior que 0.")
		.max(10, "Score do qualificador do lead deve ser menor que 10."),
	responsavel: AuthorSchema.optional().nullable(),
	atributos: z.array(
		z.object({
			nome: z.string({
				required_error: "Nome do atributo do lead não informado.",
				invalid_type_error: "Tipo não válido para o nome do atributo do lead.",
			}),
			identificador: z.string({
				required_error: "Identificador do atributo do lead não informado.",
			}),
			valor: z.string({
				required_error: "Valor do atributo do lead não informado.",
				invalid_type_error: "Tipo não válido para o valor do atributo do lead.",
			}),
			peso: z.number({
				required_error: "Peso do atributo do lead não informado.",
				invalid_type_error: "Tipo não válido para o peso do atributo do lead.",
			}),
		}),
	),
	data: z
		.string({
			required_error: "Data do qualificador do lead não informada.",
			invalid_type_error: "Tipo não válido para a data do qualificador do lead.",
		})
		.datetime({ message: "Formato inválido para a data do qualificador do lead." })
		.optional()
		.nullable(),
});

export const LeadConversionSchema = z.object({
	oportunidade: z
		.object({
			id: z.string({
				required_error: "ID da oportunidade não informado.",
				invalid_type_error: "Tipo não válido para o ID da oportunidade.",
			}),
			nome: z.string({
				required_error: "Nome da oportunidade não informado.",
				invalid_type_error: "Tipo não válido para o nome da oportunidade.",
			}),
			identificador: z.string({
				required_error: "Identificador da oportunidade não informado.",
				invalid_type_error: "Tipo não válido para o identificador da oportunidade.",
			}),
		})
		.optional()
		.nullable(),
	// User to which the opportnity was assigned to
	atribuido: AuthorSchema.optional().nullable(),
	data: z.string({
		required_error: "Data da conversão não informada.",
		invalid_type_error: "Tipo não válido para a data da conversão.",
	}),
});

export const LeadSchema = z.object({
	idCliente: z
		.string({
			invalid_type_error: "Tipo não válido para o ID do cliente do lead.",
		})
		.optional()
		.nullable(),
	nome: z
		.string({
			required_error: "Nome do lead não informado.",
			invalid_type_error: "Tipo não válido para o nome do lead.",
		})
		.optional()
		.nullable(),
	telefone: z.string({
		required_error: "Telefone do lead não informado.",
		invalid_type_error: "Tipo não válido para o telefone do lead.",
	}),
	uf: z
		.string({
			required_error: "UF do lead não informada.",
			invalid_type_error: "Tipo não válido para a UF do lead.",
		})
		.optional()
		.nullable(),
	cidade: z
		.string({
			required_error: "Cidade do lead não informada.",
			invalid_type_error: "Tipo não válido para a cidade do lead.",
		})
		.optional()
		.nullable(),

	ganho: z
		.object({
			data: z.string({
				invalid_type_error: "Tipo não válido para a data de ganho do lead.",
			}),
			valor: z.number({
				invalid_type_error: "Tipo não válido para o valor de ganho do lead.",
			}),
		})
		.optional()
		.nullable(),
	perda: z
		.object({
			data: z.string({
				invalid_type_error: "Tipo não válido para a data de perda do lead.",
			}),
			motivo: z.string({
				invalid_type_error: "Tipo não válido para a motivação de perda do lead.",
			}),
		})
		.optional()
		.nullable(),
	idMarketing: z
		.string({
			invalid_type_error: "Tipo não válido para o ID de marketing do lead.",
		})
		.optional()
		.nullable(),
	canalAquisicao: z.string({
		invalid_type_error: "Tipo não válido para o canal de aquisição do lead.",
	}),
	qualificacao: LeadQualificationSchema,
	conversao: LeadConversionSchema.optional().nullable(),
	// Controllers for contact tracking
	dataUltimoContato: z
		.string({
			invalid_type_error: "Tipo não válido para a data de último contato do lead.",
		})
		.datetime({ message: "Formato inválido para a data de último contato do lead." })
		.optional()
		.nullable(),
	dataProximoContato: z
		.string({
			invalid_type_error: "Tipo não válido para a data de próximo contato do lead.",
		})
		.datetime({ message: "Formato inválido para a data de próximo contato do lead." })
		.optional()
		.nullable(),
	dataInsercao: z
		.string({
			invalid_type_error: "Tipo não válido para a data de inserção do lead.",
		})
		.datetime({ message: "Formato inválido para a data de inserção do lead." }),
});
export type TLead = z.infer<typeof LeadSchema>;
export type TLeadDTO = TLead & { _id: string };
