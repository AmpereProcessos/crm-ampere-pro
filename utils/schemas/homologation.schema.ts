import type { ObjectId } from "mongodb";
import { z } from "zod";
import { ElectricalInstallationGroupsSchema } from "./opportunity.schema";
import { AuthorSchema } from "./user.schema";

const HolderSchema = z.object({
	nome: z
		.string({
			required_error: "Nome do titular não informado.",
			invalid_type_error: "Tipo não válido para o nome do titular.",
		})
		.min(3, "Nome do titular deve possuir ao menos 3 caractéres."),
	identificador: z
		.string({
			required_error: "CPF ou CNPJ do titular não informado.",
			invalid_type_error: "Tipo não válido para o CPF ou CNPJ do titular.",
		})
		.min(11, "CPF/CNPJ do titular deve possuir ao menos 11 caractéres."),
	contato: z
		.string({
			required_error: "Contato do titular não informado.",
			invalid_type_error: "Tipo não válido para o contato do titular.",
		})
		.min(12, "O contato do titular deve possuir ao menos 12 caractéres."),
});
const HomologationOpportunitySchema = z.object({
	id: z
		.string({
			required_error: "ID de referência da oportunidade não fornecido.",
			invalid_type_error:
				"Tipo não válido para ID de referência da oportunidade.",
		})
		.optional()
		.nullable(),
	nome: z
		.string({
			required_error: "Nome da oportunidade de referência não informado.",
			invalid_type_error:
				"Tipo não válido para o nome da oportunidade de referência.",
		})
		.optional()
		.nullable(),
});
const HomologationAccessStatusSchema = z.union(
	[
		z.literal("PENDENTE"),
		z.literal("CANCELADO"),
		z.literal("ELABORANDO DOCUMENTAÇÕES"),
		z.literal("AGUARDANDO ASSINATURA"),
		z.literal("AGUARDANDO FATURAMENTO"),
		z.literal("AGUARDANDO PENDÊNCIAS"),
		z.literal("AGUARDANDO RESPOSTA"),
		z.literal("APROVADO COM REDUÇÃO"),
		z.literal("APROVADO NOTURNO"),
		z.literal("APROVADO"),
		z.literal("REPROVADO"),
		z.literal("SUSPENSO"),
		z.literal("REPROVADO COM REDUÇÃO"),
	],
	{
		required_error: "Status da homologação não informado.",
		invalid_type_error: "Tipo não válido para o status da homologação.",
	},
);
const HomologationEquipmentSchema = z.object({
	categoria: z.union([z.literal("MÓDULO"), z.literal("INVERSOR")]),
	fabricante: z.string({
		required_error: "Fabricante do equipamento não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do equipamento.",
	}),
	modelo: z.string({
		required_error: "Modelo do equipamento não informado.",
		invalid_type_error: "Tipo não válido para o modelo do equipamento.",
	}),
	qtde: z.number({
		required_error: "Quantidade do equipamento não informada.",
		invalid_type_error: "Tipo não válido para a quantidade do equipamento.",
	}),
	potencia: z.number({
		required_error: "Potência do equipamento não informada.",
		invalid_type_error: "Tipo não válido para a potência do equipamento.",
	}),
});
export type THomologationEquipment = z.infer<
	typeof HomologationEquipmentSchema
>;
const HomologationLocationSchema = z.object({
	cep: z
		.string({
			required_error: "CEP da localização de homologação não informado.",
			invalid_type_error:
				"Tipo não válido para o CEP da localização de homologação.",
		})
		.optional()
		.nullable(),
	uf: z.string({
		required_error: "UF de localização de homologação não informada.",
		invalid_type_error:
			"Tipo não válido para a UF de localização de homologação.",
	}),
	cidade: z.string({
		required_error: "Cidade de localização de homologação não informada.",
		invalid_type_error:
			"Tipo não válido para a cidade de localização de homologação.",
	}),
	bairro: z
		.string({
			required_error: "Bairro da localização de homologação não informado.",
			invalid_type_error:
				"Tipo não válido para o bairro da localização de homologação.",
		})
		.optional()
		.nullable(),
	endereco: z
		.string({
			required_error: "Endereço da localização de homologação não informado.",
			invalid_type_error:
				"Tipo não válido para o endereço da localização de homologação.",
		})
		.optional()
		.nullable(),
	numeroOuIdentificador: z
		.string({
			required_error:
				"Número ou identificador da localização de homologação não informado.",
			invalid_type_error:
				"Tipo não válido para o número ou identificador da localização de homologação.",
		})
		.optional()
		.nullable(),
	complemento: z.string().optional().nullable(),
	latitude: z
		.string({
			invalid_type_error:
				"Tipo não válido para latitude da localização da homologação.",
		})
		.optional()
		.nullable(),
	longitude: z
		.string({
			invalid_type_error:
				"Tipo não válido para longitude da localização da homologação.",
		})
		.optional()
		.nullable(),
	// distancia: z.number().optional().nullable(),
});
const HomologationInstalationSchema = z.object({
	numeroInstalacao: z.string({
		required_error: "Número da instalação elétrica não informado.",
		invalid_type_error: "Tipo não válido para o número da instalação elétrica.",
	}),
	numeroCliente: z.string({
		required_error: "Número do cliente (junto a concessionária) não informado.",
		invalid_type_error:
			"Tipo não válido para o número do cliente (junto a concessionária).",
	}),
	dependentes: z.array(
		z.object(
			{
				numeroInstalacao: z.string({
					required_error:
						"Número da instalação elétrica dependente. não informado.",
					invalid_type_error:
						"Tipo não válido para o número da instalação elétrica dependente..",
				}),
				recebimentoPercentual: z.number({
					required_error:
						"Porcentagem de recebimento da instalação dependente não informado.",
					invalid_type_error:
						"Tipo não válido para a porcentagem de recebimento.",
				}),
			},
			{
				required_error: "Lista de dependentes da instalação não informada.",
				invalid_type_error:
					"Tipo não válido para a lista de dependentes da instalação.",
			},
		),
	),
	grupo: ElectricalInstallationGroupsSchema,
});
const HomologationDocumentationSchema = z.object({
	formaAssinatura: z.union([z.literal("FÍSICA"), z.literal("DIGITAL")], {
		required_error: "Forma de assinatura da documentação não informada.",
		invalid_type_error:
			"Tipo não válido para a forma de assinatura da documentação.",
	}),
	dataInicioElaboracao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de início da elaboração da documentação.",
		})
		.datetime({
			message:
				"Formato inválido para a data de início da elaboração da documentação.",
		})
		.optional()
		.nullable(),
	dataConclusaoElaboracao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de início da elaboração da documentação.",
		})
		.datetime({
			message:
				"Formato inválido para a data de início da elaboração da documentação.",
		})
		.optional()
		.nullable(),
	dataLiberacao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de liberação das documentações.",
		})
		.datetime({
			message: "Formato inválido para a data de liberação das documentações.",
		})
		.optional()
		.nullable(),
	dataAssinatura: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de assinatura das documentações.",
		})
		.datetime({
			message: "Formato inválido para a data de assinatura das documentações.",
		})
		.optional()
		.nullable(),
});
const HomologationAccessControlSchema = z.object({
	codigo: z.string({
		required_error: "Código da solicitação (NS) não informado.",
		invalid_type_error: "Tipo não válido para o código da solicitação (NS).",
	}),
	dataSolicitacao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de solicitação de acesso.",
		})
		.datetime({
			message: "Formato inválido para a data de solicitação de acesso.",
		})
		.optional()
		.nullable(),
	dataResposta: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de resposta da solicitação de acesso.",
		})
		.datetime({
			message:
				"Formato inválido para a data de resposta da solicitação de acesso.",
		})
		.optional()
		.nullable(),
});
const HomologationUpdatesSchema = z.object({
	data: z
		.string({
			required_error: "Data da atualização não informada.",
			invalid_type_error: "Tipo inválido para a data de atualização.",
		})
		.datetime({ message: "Formato inválido para a data da atualização." }),
	descricao: z.string({
		required_error: "Descrição da atualização não informada.",
		invalid_type_error: "Tipo não válido para a descrição da atualização.",
	}),
	autor: AuthorSchema,
});

const HomologationVistorySchema = z.object({
	dataSolicitacao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de solicitação da vistoria.",
		})
		.datetime({
			message: "Formato inválido para a data de solicitação da vistoria.",
		})
		.optional()
		.nullable(),
	dataEfetivacao: z
		.string({
			invalid_type_error:
				"Tipo não válido para a data de execução da vistoria.",
		})
		.datetime({
			message: "Formato inválido para a data de execução da vistoria.",
		})
		.optional()
		.nullable(),
});

const HomologationApplicantSchema = z.object({
	id: z
		.string({ invalid_type_error: "Tipo não válido para o ID do requerente." })
		.optional()
		.nullable(),
	nome: z
		.string({
			invalid_type_error: "Tipo não válido para o nome do requerente.",
		})
		.optional()
		.nullable(),
	apelido: z.string({
		required_error: "Apelido do requerente não informado.",
		invalid_type_error: "Tipo não válido para o apelido do requerente.",
	}),
	avatar_url: z
		.string({
			invalid_type_error: "Tipo não válido para o avatar do requerente.",
		})
		.optional()
		.nullable(),
	contato: z.string({
		required_error: "Contato do requerente não informado.",
		invalid_type_error: "Tipo não válido para o contato do requerente.",
	}),
});
const HomologationPendencies = z.object({
	diagramas: z
		.string({
			required_error: "Conclusão da pendência de diagramas não informada.",
			invalid_type_error:
				"Tipo não válido para a conclusão da pendência de diagramas.",
		})
		.optional()
		.nullable(),
	formularios: z
		.string({
			required_error: "Conclusão da pendência de formulários não informada.",
			invalid_type_error:
				"Tipo não válido para a conclusão da pendência de formulários.",
		})
		.optional()
		.nullable(),
	desenhos: z
		.string({
			required_error: "Conclusão da pendência de desenhos não informada.",
			invalid_type_error:
				"Tipo não válido para a conclusão da pendência de desenhos.",
		})
		.optional()
		.nullable(),
	mapasDeMicro: z
		.string({
			required_error: "Conclusão da pendência de mapa de micro não informada.",
			invalid_type_error:
				"Tipo não válido para a conclusão da pendência de mapa de micro.",
		})
		.optional()
		.nullable(),
	distribuicoes: z
		.string({
			required_error:
				"Conclusão da pendência de distribuição de créditos não informada.",
			invalid_type_error:
				"Tipo não válido para a conclusão da pendência de distribuição de créditos.",
		})
		.optional()
		.nullable(),
});
export const HomologationSchema = z.object({
	idParceiro: z.string({
		required_error: "ID de referência do parceiro não informado.",
		invalid_type_error: "Tipo não válido para ID de referência do parceiro.",
	}),
	idProposta: z
		.string({
			required_error: "ID de referência de proposta não informado.",
			invalid_type_error:
				"Tipo não válido para o ID de referência de proposta.",
		})
		.optional()
		.nullable(),
	requerente: HomologationApplicantSchema,
	status: HomologationAccessStatusSchema,
	potencia: z
		.number({
			required_error: "Potência de homologação não informada.",
			invalid_type_error: "Tipo não válido para a potência de homologação.",
		})
		.optional()
		.nullable(),
	observacoes: z
		.string({
			invalid_type_error: "Tipo não válido para as observações da homologação.",
		})
		.optional()
		.nullable(),
	pendencias: HomologationPendencies,
	distribuidora: z.string({
		required_error:
			"Nome da concessionária/distribuidora de energia não informada.",
		invalid_type_error:
			"Tipo não válido para o nome da concessionária/distribuidora de energia.",
	}),
	oportunidade: HomologationOpportunitySchema,
	titular: HolderSchema,
	fastTrack: z
		.boolean({
			invalid_type_error: "Tipo não válido para a flag de fast track.",
		})
		.optional()
		.nullable(),
	equipamentos: z.array(HomologationEquipmentSchema, {
		required_error: "Lista de equipamentos não informada.",
		invalid_type_error: "Tipo não válido para a lista de equipamentos.",
	}),
	localizacao: HomologationLocationSchema,
	instalacao: HomologationInstalationSchema,
	documentacao: HomologationDocumentationSchema,
	acesso: HomologationAccessControlSchema,
	atualizacoes: z.array(HomologationUpdatesSchema),
	vistoria: HomologationVistorySchema,
	dataEfetivacao: z
		.string({
			required_error: "Data de efetivação não informada.",
			invalid_type_error: "Tipo não válido para data de efetivação.",
		})
		.optional()
		.nullable(),
	autor: AuthorSchema,
	dataInsercao: z
		.string({
			required_error: "Data de inserção não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção.",
		})
		.datetime({ message: "Tipo não válido para data de inserção." }),
});

export type THomologation = z.infer<typeof HomologationSchema>;

export type THomologationDTO = THomologation & { _id: string };

export type THomologationEntity = THomologation & { _id: ObjectId };
