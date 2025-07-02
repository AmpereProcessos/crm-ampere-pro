import z from "zod";
import { AuthorSchema } from "../../user.schema";
import { ElectricalInstallationGroupsSchema } from "../../opportunity.schema";
import { TProject } from "../../project.schema";

const HolderSchema = z.object({
	nome: z
		.string({ required_error: "Nome do titular não informado.", invalid_type_error: "Tipo não válido para o nome do titular." })
		.min(3, "Nome do titular deve possuir ao menos 3 caractéres."),
	identificador: z
		.string({
			required_error: "CPF ou CNPJ do titular não informado.",
			invalid_type_error: "Tipo não válido para o CPF ou CNPJ do titular.",
		})
		.min(11, "CPF/CNPJ do titular deve possuir ao menos 11 caractéres."),
	contato: z
		.string({ required_error: "Contato do titular não informado.", invalid_type_error: "Tipo não válido para o contato do titular." })
		.min(12, "O contato do titular deve possuir ao menos 12 caractéres."),
});
const HomologationOpportunitySchema = z.object({
	id: z.string({
		required_error: "ID de referência da oportunidade não fornecido.",
		invalid_type_error: "Tipo não válido para ID de referência da oportunidade.",
	}),
	nome: z.string({
		required_error: "Nome da oportunidade de referência não informado.",
		invalid_type_error: "Tipo não válido para o nome da oportunidade de referência.",
	}),
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
	{ required_error: "Status da homologação não informado.", invalid_type_error: "Tipo não válido para o status da homologação." },
);
const HomologationEquipmentSchema = z.object({
	categoria: z.union([z.literal("MÓDULO"), z.literal("INVERSOR")]),
	fabricante: z.string({
		required_error: "Fabricante do equipamento não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do equipamento.",
	}),
	modelo: z.string({ required_error: "Modelo do equipamento não informado.", invalid_type_error: "Tipo não válido para o modelo do equipamento." }),
	qtde: z.number({
		required_error: "Quantidade do equipamento não informada.",
		invalid_type_error: "Tipo não válido para a quantidade do equipamento.",
	}),
	potencia: z.number({
		required_error: "Potência do equipamento não informada.",
		invalid_type_error: "Tipo não válido para a potência do equipamento.",
	}),
});
export type THomologationEquipment = z.infer<typeof HomologationEquipmentSchema>;
const HomologationLocationSchema = z.object({
	cep: z
		.string({
			required_error: "CEP da localização de homologação não informado.",
			invalid_type_error: "Tipo não válido para o CEP da localização de homologação.",
		})
		.optional()
		.nullable(),
	uf: z.string({
		required_error: "UF de localização de homologação não informada.",
		invalid_type_error: "Tipo não válido para a UF de localização de homologação.",
	}),
	cidade: z.string({
		required_error: "Cidade de localização de homologação não informada.",
		invalid_type_error: "Tipo não válido para a cidade de localização de homologação.",
	}),
	bairro: z
		.string({
			required_error: "Bairro da localização de homologação não informado.",
			invalid_type_error: "Tipo não válido para o bairro da localização de homologação.",
		})
		.optional()
		.nullable(),
	endereco: z
		.string({
			required_error: "Endereço da localização de homologação não informado.",
			invalid_type_error: "Tipo não válido para o endereço da localização de homologação.",
		})
		.optional()
		.nullable(),
	numeroOuIdentificador: z
		.string({
			required_error: "Número ou identificador da localização de homologação não informado.",
			invalid_type_error: "Tipo não válido para o número ou identificador da localização de homologação.",
		})
		.optional()
		.nullable(),
	complemento: z.string().optional().nullable(),
	latitude: z.string({ invalid_type_error: "Tipo não válido para latitude da localização da oportunidade." }).optional().nullable(),
	longitude: z.string({ invalid_type_error: "Tipo não válido para longitude da localização da oportunidade." }).optional().nullable(),
	// distancia: z.number().optional().nullable(),
});
const HomologationInstalationSchema = z.object({
	numeroInstalacao: z.string({
		required_error: "Número da instalação elétrica não informado.",
		invalid_type_error: "Tipo não válido para o número da instalação elétrica.",
	}),
	numeroCliente: z.string({
		required_error: "Número do cliente (junto a concessionária) não informado.",
		invalid_type_error: "Tipo não válido para o número do cliente (junto a concessionária).",
	}),
	dependentes: z.array(
		z.object(
			{
				numeroInstalacao: z.string({
					required_error: "Número da instalação elétrica dependente. não informado.",
					invalid_type_error: "Tipo não válido para o número da instalação elétrica dependente..",
				}),
				recebimentoPercentual: z.number({
					required_error: "Porcentagem de recebimento da instalação dependente não informado.",
					invalid_type_error: "Tipo não válido para a porcentagem de recebimento.",
				}),
			},
			{
				required_error: "Lista de dependentes da instalação não informada.",
				invalid_type_error: "Tipo não válido para a lista de dependentes da instalação.",
			},
		),
	),
	grupo: ElectricalInstallationGroupsSchema,
});
const HomologationDocumentationSchema = z.object({
	formaAssinatura: z.union([z.literal("FÍSICA"), z.literal("DIGITAL")], {
		required_error: "Forma de assinatura da documentação não informada.",
		invalid_type_error: "Tipo não válido para a forma de assinatura da documentação.",
	}),
	dataInicioElaboracao: z
		.string({ invalid_type_error: "Tipo não válido para a data de início da elaboração da documentação." })
		.datetime({ message: "Formato inválido para a data de início da elaboração da documentação." })
		.optional()
		.nullable(),
	dataConclusaoElaboracao: z
		.string({ invalid_type_error: "Tipo não válido para a data de início da elaboração da documentação." })
		.datetime({ message: "Formato inválido para a data de início da elaboração da documentação." })
		.optional()
		.nullable(),
	dataLiberacao: z
		.string({ invalid_type_error: "Tipo não válido para a data de liberação das documentações." })
		.datetime({ message: "Formato inválido para a data de liberação das documentações." })
		.optional()
		.nullable(),
	dataAssinatura: z
		.string({ invalid_type_error: "Tipo não válido para a data de assinatura das documentações." })
		.datetime({ message: "Formato inválido para a data de assinatura das documentações." })
		.optional()
		.nullable(),
});
const HomologationAccessControlSchema = z.object({
	codigo: z.string({
		required_error: "Código da solicitação (NS) não informado.",
		invalid_type_error: "Tipo não válido para o código da solicitação (NS).",
	}),
	dataSolicitacao: z
		.string({ invalid_type_error: "Tipo não válido para a data de solicitação de acesso." })
		.datetime({ message: "Formato inválido para a data de solicitação de acesso." })
		.optional()
		.nullable(),
	dataResposta: z
		.string({ invalid_type_error: "Tipo não válido para a data de resposta da solicitação de acesso." })
		.datetime({ message: "Formato inválido para a data de resposta da solicitação de acesso." })
		.optional()
		.nullable(),
});
const HomologationUpdatesSchema = z.object({
	data: z
		.string({ required_error: "Data da atualização não informada.", invalid_type_error: "Tipo inválido para a data de atualização." })
		.datetime({ message: "Formato inválido para a data da atualização." }),
	descricao: z.string({
		required_error: "Descrição da atualização não informada.",
		invalid_type_error: "Tipo não válido para a descrição da atualização.",
	}),
	autor: AuthorSchema,
});

const HomologationVistorySchema = z.object({
	dataSolicitacao: z
		.string({ invalid_type_error: "Tipo não válido para a data de solicitação da vistoria." })
		.datetime({ message: "Formato inválido para a data de solicitação da vistoria." })
		.optional()
		.nullable(),
	dataEfetivacao: z
		.string({ invalid_type_error: "Tipo não válido para a data de execução da vistoria." })
		.datetime({ message: "Formato inválido para a data de execução da vistoria." })
		.optional()
		.nullable(),
});

const HomologationPendencies = z.object({
	diagramas: z
		.string({
			required_error: "Conclusão da pendência de diagramas não informada.",
			invalid_type_error: "Tipo não válido para a conclusão da pendência de diagramas.",
		})
		.optional()
		.nullable(),
	formularios: z
		.string({
			required_error: "Conclusão da pendência de formulários não informada.",
			invalid_type_error: "Tipo não válido para a conclusão da pendência de formulários.",
		})
		.optional()
		.nullable(),
	desenhos: z
		.string({
			required_error: "Conclusão da pendência de desenhos não informada.",
			invalid_type_error: "Tipo não válido para a conclusão da pendência de desenhos.",
		})
		.optional()
		.nullable(),
	mapasDeMicro: z
		.string({
			required_error: "Conclusão da pendência de mapa de micro não informada.",
			invalid_type_error: "Tipo não válido para a conclusão da pendência de mapa de micro.",
		})
		.optional()
		.nullable(),
	distribuicoes: z
		.string({
			required_error: "Conclusão da pendência de distribuição de créditos não informada.",
			invalid_type_error: "Tipo não válido para a conclusão da pendência de distribuição de créditos.",
		})
		.optional()
		.nullable(),
});
export const GeneralHomologationSchema = z.object({
	homologar: z.boolean({
		required_error: "Aplicabilidade de homologação não informado.",
		invalid_type_error: "TIpo não válido para a aplicabilidade de homologação.",
	}),
	status: HomologationAccessStatusSchema,
	potencia: z.number({ required_error: "Potência de homologação não informada.", invalid_type_error: "Tipo não válido para a potência de homologação." }).optional().nullable(),
	pendencias: HomologationPendencies,
	distribuidora: z.string({
		required_error: "Nome da concessionária/distribuidora de energia não informada.",
		invalid_type_error: "Tipo não válido para o nome da concessionária/distribuidora de energia.",
	}),
	oportunidade: HomologationOpportunitySchema,
	titular: HolderSchema,
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
	dataEfetivacao: z.string({ required_error: "Data de efetivação não informada.", invalid_type_error: "Tipo não válido para data de efetivação." }).optional().nullable(),
	dataLiberacao: z
		.string({
			required_error: "Data de liberação para projeto/homologação não informada.",
			invalid_type_error: "Tipo não válido para data de liberação para homologação.",
		})
		.datetime({ message: "Formato inválido para data de liberação para homologação." })
		.optional()
		.nullable(),
});
const MaintenanceItem = z.object({
	titulo: z.string({ required_error: "Título da manutenção não informado.", invalid_type_error: "Tipo não válido para o título da manutenção." }),
	dataEfetivacao: z
		.string({
			required_error: "Data de efetivação da manutenção não informada.",
			invalid_type_error: "Tipo não válido para a data de efetivação da manutenção.",
		})
		.optional()
		.nullable(),
});

export const ProjectComissionedUserSchema = z.object({
	idCrm: z.string({ invalid_type_error: "Tipo não válido para o ID do comissionado." }).optional().nullable(),
	nome: z.string({ invalid_type_error: "Tipo não válido para o nome do comissionado." }),
	papel: z.enum(["VENDEDOR", "INSIDER", "INDICADOR"]),
	porcentagem: z.number({ invalid_type_error: "Tipo não válido para a porcentagem do comissionado." }),
	avatar_url: z.string({ invalid_type_error: "Tipo não válido para o avatar do comissionado." }).optional().nullable(),
	dataEfetivacao: z.string({ invalid_type_error: "Tipo não válido para a efetivação do comissionado." }).optional().nullable(),
	dataPagamento: z.string({ invalid_type_error: "Tipo não válido para o pagamento realizado do comissionado." }).optional().nullable(),
	dataValidacao: z.string({ invalid_type_error: "Tipo não válido para a data de validação do comissionado." }).optional().nullable(),
});

export const GeneralProjectSchema = z.object({
	app: z.object({
		data: z.string().optional().nullable(),
		login: z.string().optional().nullable(),
		senha: z.union([z.string(), z.number()]).optional().nullable(),
	}),
	bairro: z.string(),
	canalVenda: z.string(),
	cep: z.union([z.string(), z.number()]).optional().nullable(),
	cidade: z.string(),
	codigoSVB: z.union([z.string(), z.number()]),
	comissionamento: z
		.object({
			comercial: z.boolean().optional().nullable(),
			suprimentos: z.boolean().optional().nullable(),
			projetos: z.boolean().optional().nullable(),
		})
		.optional()
		.nullable(),
	comissoes: z
		.object({
			dataReferencia: z.string({ invalid_type_error: "Tipo não válido para a data de referência da comissão." }).optional().nullable(),
			valorComissionavel: z.number({ invalid_type_error: "Tipo não válido para o valor comissionável." }).optional().nullable(),
			itensComissionaveis: z
				.array(z.enum(["SISTEMA", "PADRÃO", "ESTRUTURA PERSONALIZADA", "OEM", "SEGURO"]))
				.optional()
				.nullable(),
			comissionados: z.array(ProjectComissionedUserSchema).optional().nullable(),

			// Deprecated fields
			efetivado: z
				.boolean({
					invalid_type_error: "Tipo não válido para a efetivação da comissão.",
				})
				.optional()
				.nullable(),
			pagamentoRealizado: z
				.boolean({
					invalid_type_error: "Tipo não válido para o pagamento realizado da comissão.",
				})
				.optional()
				.nullable(),
			porcentagemVendedor: z
				.number({
					invalid_type_error: "Tipo não válido para a porcentagem do vendedor da comissão.",
				})
				.optional()
				.nullable(),
			porcentagemInsider: z
				.number({
					invalid_type_error: "Tipo não válido para a porcentagem do insider da comissão.",
				})
				.optional()
				.nullable(),

			dataValidacaoVendedor: z.string({ invalid_type_error: "Tipo não válido para a data de validação do vendedor." }).optional().nullable(),
			dataValidacaoInsider: z.string({ invalid_type_error: "Tipo não válido para a data de validação do insider." }).optional().nullable(),
		})
		.optional()
		.nullable(),
	compra: z.object({
		dataEntrega: z.string().optional().nullable(),
		dataLiberacao: z.string().optional().nullable(),
		dataMaxPagamento: z.string().optional().nullable(),
		dataPagamento: z.string().optional().nullable(), // Money received from client
		dataPagamentoEquipamentos: z.string().optional().nullable(), // Payment to supplier
		dataPedido: z.string().optional().nullable(),
		fornecedor: z.string().optional().nullable(),
		informacoes: z.string().optional().nullable(),
		kitInfo: z.string().optional().nullable(),
		liberacao: z.boolean().optional().nullable(),
		localEntrega: z.string().optional().nullable(),
		previsaoEntrega: z.string().optional().nullable(),
		previsaoValorDoKit: z.number().optional().nullable(),
		rastreio: z.string().optional().nullable(),
		status: z.string().optional().nullable(), // select-options
		statusEntrega: z.string().optional().nullable(), // select-options,
		statusLiberacao: z.string().optional().nullable(), // select-options,
		tipoDoKit: z.string().optional().nullable(), // select-options,
		valorDoKit: z.number().optional().nullable(),
	}),
	conferencias: z.object({
		energiaInjetada: z.object({ data: z.string().optional().nullable(), status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]) }),
		monitoramentoFeito: z.object({
			data: z.string().optional().nullable(),
			status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]),
		}),
		usinaLigada: z.object({ data: z.string().optional().nullable(), status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]) }),
	}),
	contrato: z.object({
		dataAssinatura: z.string().optional().nullable(),
		dataLiberacao: z.string().optional().nullable(),
		dataSolicitacao: z.string().optional().nullable(),
		formaAssinatura: z.union([z.literal("FISICO"), z.literal("DIGITAL"), z.literal("NÃO DEFINIDO")]),
		status: z.string().optional().nullable(),
	}),
	cpf_cnpj: z.union([z.string(), z.number()]),
	dadosCemig: z.object({
		distCreditos: z.union([z.literal("NÃO"), z.literal("SIM"), z.literal("NÃO DEFINIDO")]),
		numeroInstalacao: z.union([z.string(), z.number()]),
		qtdeDistCreditos: z.number().optional().nullable(),
		titularProjeto: z.string(),
	}),
	dataNascimento: z.string().optional().nullable(),
	email: z.string().optional().nullable(),
	estruturaPersonalizada: z.object({
		aplicavel: z
			.union([z.literal("SIM"), z.literal("NÃO")])
			.optional()
			.nullable(),
		dataEntrega: z.string().optional().nullable(),
		dataMontagem: z.string().optional().nullable(),
		respPagamento: z
			.union([z.literal("CLIENTE"), z.literal("AMPERE"), z.literal("NÃO SE APLICA")])
			.optional()
			.nullable(),
		status: z.string().optional().nullable(),
		statusEntrega: z.string(),
		tipo: z.string().optional().nullable(),
		valor: z.number().optional().nullable(),
	}),
	faturamento: z.object({
		cnpjFaturamento: z.union([z.number(), z.string()]),
		concluido: z.boolean().optional().nullable(),
		dataFaturamento: z.string().optional().nullable(),
		empresaFaturamento: z
			.union([z.literal("AMPERE ENERGIAS"), z.literal("ANALISE DO FINANCEIRO"), z.literal("IZAIRA SERVIÇOS")])
			.optional()
			.nullable(),
		observacoes: z.string().optional().nullable(),
		previsaoFaturamento: z.string().optional().nullable(),
	}),
	nomeParceiro: z.string().optional().nullable(),
	idParceiro: z.string().optional().nullable(),
	idProjetoCRM: z.string().optional().nullable(),
	idPropostaCRM: z.string().optional().nullable(),
	idSolicitacaoContrato: z.string().optional().nullable(),
	idVisitaTecnica: z.string().optional().nullable(),
	indicacao: z.object({
		contato: z.string().optional().nullable(),
		quemIndicou: z.string().optional().nullable(),
	}),
	insider: z.string().optional().nullable(),
	jornada: z.object({
		assDocumentacoes: z.boolean().optional().nullable(),
		boasVindas: z.boolean().optional().nullable(),
		compraDoKit: z.boolean().optional().nullable(),
		dataEntregaTecnicaPresencial: z.string().optional().nullable(),
		dataEntregaTecnicaRemota: z.string().optional().nullable(),
		dataNps: z.string().optional().nullable(),
		dataUltimoContato: z.string().optional().nullable(),
		entregaDoKit: z.boolean().optional().nullable(),
		entregaTecnica: z.boolean().optional().nullable(),
		entregaTecnicaPresencial: z.boolean().optional().nullable(),
		instalacaoAgendada: z.boolean().optional().nullable(),
		instalacaoRealizada: z.boolean().optional().nullable(),
		jornadaConcluida: z.boolean().optional().nullable(),
		nfFaturada: z.boolean().optional().nullable(),
		obsJornada: z.string().optional().nullable(),
		obsNps: z.string().optional().nullable(),
		prevChegada: z.boolean().optional().nullable(),
		respConcessionaria: z.boolean().optional().nullable(),
		sistemaLigado: z.boolean().optional().nullable(),
		tipoEntregaTecnica: z.union([z.literal("REMOTO"), z.literal("PRESENCIAL")]),
		vistoriaConcessionaria: z.boolean().optional().nullable(),
		contatos: z.string().optional().nullable(),
		cuidados: z.string().optional().nullable(),
		dataConclusao: z.string().optional().nullable(),
	}),
	linkDrive: z.string(),
	links: z.object({
		chamadosSuporte: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		chamadosSuprimentos: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		contratos: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		documentos: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		equipamentos: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		manutencaoPreventiva: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		obras: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		projetos: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
		visitaTecnica: z
			.array(
				z.object({
					title: z.string(),
					link: z.string(),
					format: z.string(),
					category: z.string(),
					// Define the schema for LinksItem here
				}),
			)
			.optional()
			.nullable(),
	}),
	logradouro: z.string(),
	manutencaoPreventiva: z.object({
		data: z.string().optional().nullable(),
		status: z.union([z.literal("NÃO REALIZADO"), z.literal("REALIZADO")]),
	}),
	manutencoes: z.array(MaintenanceItem),
	material: z.object({
		avarias: z.boolean().optional().nullable(),
		chamadoIrregularidade: z.boolean().optional().nullable(), // EXCLUIR,
		conferenciaFeita: z.boolean().optional().nullable(),
		descricaoProblema: z.string().optional().nullable(),
		disjuntores: z
			.array(
				z.object({
					corrente: z.number(),
					qtde: z.number(),
					tipo: z.union([z.literal("MONOFÁSICO"), z.literal("BIFÁSICO"), z.literal("TRIFÁSICO")]),
				}),
			)
			.optional()
			.nullable(),
		previsaoCustos: z.number().optional().nullable(),
		efetivoCustos: z.number().optional().nullable(),
		entregaFaltando: z.boolean().optional().nullable(),
		materialFaltante: z.string().optional().nullable(),
		statusSeparacao: z.union([z.literal("SEPARADO"), z.literal("NÃO DEFINIDO"), z.literal("INICIAR SEPARAÇÃO")]),
	}),
	medidor: z.object({
		data: z.string().optional().nullable(),
		status: z.string().optional().nullable(),
	}),
	nomeDoContrato: z.string(),
	nomeDoProjeto: z.string(),
	nps: z.number().optional().nullable(),
	satisfacao: z.object({
		venda: z.number().optional().nullable(),
		entrega: z.number().optional().nullable(),
		execucao: z.number().optional().nullable(),
		posVenda: z.number().optional().nullable(),
	}),
	numeroResidencia: z.union([z.string(), z.number()]).optional().nullable(),
	obra: z.object({
		checklist: z
			.union([z.literal("SIM"), z.literal("NÃO")])
			.optional()
			.nullable(),
		entrada: z.string().optional().nullable(),
		equipeResp: z.string().optional().nullable(),
		laudo: z
			.union([z.literal("EMITIDO"), z.literal("EM ESTUDO"), z.literal("NÃO DEFINIDO")])
			.optional()
			.nullable(),
		observacoes: z.string(),
		saida: z.string().optional().nullable(),
		statusDaObra: z.string().optional().nullable(), // select-options
		statusSolicitacao: z.string().optional().nullable(),
		trafo: z.string().optional().nullable(),
	}),
	obsComercial: z.string().optional().nullable(),
	oem: z.object({
		aplicavel: z.boolean().optional().nullable(),
		diagnostico: z.string().optional().nullable(),
		duracao: z.number().optional().nullable(),
		oemConcluido: z.boolean().optional().nullable(),
		plano: z.string().optional().nullable(),
		qtdeManutencoes: z.number().optional().nullable(),
		valor: z.number().optional().nullable(),
	}),
	seguro: z.object({
		aplicavel: z.boolean(),
		valor: z.number().optional().nullable(),
		duracao: z.number().optional().nullable(),
		dataInicio: z.string().optional().nullable(),
	}),
	ondeTrabalha: z.string(),
	padrao: z.object({
		aumentoCarga: z.object({
			aplicavel: z.boolean(),
			dataEfetivacao: z.string().optional().nullable(),
		}),
		caixaConjugada: z.string().optional().nullable(),
		respInstalacao: z
			.union([z.literal("CLIENTE"), z.literal("AMPERE"), z.literal("NÃO SE APLICA")])
			.optional()
			.nullable(),
		respPagamento: z.string().optional().nullable(),
		tipo: z.string().optional().nullable(),
		tipoEntrada: z
			.union([z.literal("AÉREA"), z.literal("SUBTERRÂNEO")])
			.optional()
			.nullable(),
		valor: z.number().optional().nullable(),
	}),
	pagamento: z.object({
		cobrancaFeita: z.boolean(),
		contatoPagador: z.string(),
		credor: z.string().optional().nullable(), // select options
		dataRecebimento: z.string().optional().nullable(),
		forma: z
			.union([z.literal("FINANCIAMENTO"), z.literal("CAPITAL PRÓPRIO")])
			.optional()
			.nullable(),
		pagador: z.string(),
		retorno: z.number().optional().nullable(),
		status: z.string().optional().nullable(), // select options
	}),
	parecer: z.object({
		dataParecerDeAcesso: z.string().optional().nullable(),
		motivoReprova: z.string().optional().nullable(),
		parecerReprovado: z.string().optional().nullable(),
		pendencias: z.string().optional().nullable(),
		qtdeDiasObraDeRede: z.number().optional().nullable(),
		qtdeReprovas: z.number().optional().nullable(),
		statusDoParecerDeAcesso: z.string().optional().nullable(), // select options
	}),
	possuiaGD: z.boolean().optional().nullable(),
	possuiDeficiencia: z
		.union([z.literal("SIM"), z.literal("NÃO")])
		.optional()
		.nullable(),
	projeto: z.object({
		acStatus: z.string().optional().nullable(), // select options
		aumentoDeCarga: z.union([z.literal("SIM"), z.literal("NÃO")]),
		dataLiberacaoDocumentacao: z.string().optional().nullable(),
		dataAssDocumentacao: z.string().optional().nullable(),
		dataSolicitacaoAcesso: z.string().optional().nullable(),
		desenhoTelhado: z.string().optional().nullable(),
		diagramaUnifilar: z.string().optional().nullable(),
		mapaDeMicro: z.string().optional().nullable(),
		fechamentoAC: z.string().optional().nullable(),
		formaAssDocumentacao: z
			.union([z.literal("DIGITAL"), z.literal("FISICA")])
			.optional()
			.nullable(),
		iniciar: z
			.union([z.literal("SIM"), z.literal("NÃO"), z.literal("NÃO DEFINIDO")])
			.optional()
			.nullable(),
		projetista: z.object({
			nome: z.string(),
			codigo: z.string(),
		}),
		projetoConcluido: z.union([z.literal("SIM"), z.literal("NÃO")]),
		realizarHomologacao: z.boolean().optional().nullable(),
	}),
	homologacao: GeneralHomologationSchema,
	qtde: z.number(),
	qualDeficiencia: z.string().optional().nullable(),
	regional: z.string().nullable(),
	relatorios: z.object({
		envioUm: z.object({
			data: z.string().optional().nullable(),
			status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]),
		}),
		envioDois: z.object({
			data: z.string().optional().nullable(),
			status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]),
		}),
		envioTres: z.object({
			data: z.string().optional().nullable(),
			status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]),
		}),
		envioQuatro: z.object({
			data: z.string().optional().nullable(),
			status: z.union([z.literal("REALIZADO"), z.literal("NÃO REALIZADO")]),
		}),
	}),
	segmento: z.union([z.literal("RESIDENCIAL"), z.literal("RURAL"), z.literal("COMERCIAL"), z.literal("INDUSTRIAL"), z.literal("NÃO DEFINIDO")]),
	sistema: z.object({
		capacidadeBateria: z.number().optional().nullable(),
		marcaBateria: z.string(),
		qtdeBateria: z.number().optional().nullable(),
		tipoBateria: z.string(),
		marcaBomba: z.string(),
		potBomba: z.number().optional().nullable(),
		qtdeBomba: z.number().optional().nullable(),
		marcaControlador: z.string(),
		correnteControlador: z.number().optional().nullable(),
		qtdeControlador: z.number().optional().nullable(),
		tipoControlador: z.string(),
		inversor: z.string(),
		potModulos: z.union([z.number(), z.string()]).optional().nullable(),
		qtdeModulos: z.number().optional().nullable(),
		potPico: z.number(),
		topologia: z
			.union([z.literal("MICRO"), z.literal("INVERSOR"), z.literal("OTIMIZADOR")])
			.optional()
			.nullable(),
		valorProjeto: z.number(),
	}),
	telefone: z.string().optional().nullable(),
	uf: z.string(), // select options
	vendedor: z.object({
		codigo: z.number().optional().nullable(),
		nome: z.string(),
	}),
	tipoDeServico: z.string(),
	visitaTecnica: z.object({
		amperagem: z.string().optional().nullable(),
		saidaDoCliente: z
			.union([z.literal("AEREO"), z.literal("SUBTERRANEO")])
			.optional()
			.nullable(),
		status: z.string().optional().nullable(),
		tecnico: z.string().optional().nullable(),
		tipoDaTelha: z.string().optional().nullable(),
	}),
	vistoria: z.object({
		dataPedido: z.string().optional().nullable(),
		equipeDeCampoNecessaria: z
			.union([z.literal("SIM"), z.literal("NÃO")])
			.optional()
			.nullable(),
		motivoReprova: z.string().optional().nullable(),
		qtdeReprovas: z.number().optional().nullable(),
		status: z.string().optional().nullable(), // select options
		vistoriaReprovada: z
			.union([z.literal("SIM"), z.literal("NÃO")])
			.optional()
			.nullable(),
	}),
	restricao: z
		.object({
			aplicavel: z.boolean().optional().nullable(),
			observacoes: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
});

export type TAppProject = z.infer<typeof GeneralProjectSchema>;

export type TAppProjectDTO = TAppProject & { _id: string };

export type TAppProjectDBSimplified = Pick<
	TAppProject,
	"nomeDoContrato" | "tipoDeServico" | "contrato" | "qtde" | "vendedor" | "telefone" | "email" | "codigoSVB" | "uf" | "cidade" | "bairro" | "logradouro" | "numeroResidencia"
>;
export type TAppProjectDTODBSimplified = TAppProjectDBSimplified & { _id: string };
export const ProjectDBSimplifiedProjection = {
	_id: 1,
	nomeDoContrato: 1,
	tipoDeServico: 1,
	"contrato.status": 1,
	qtde: 1,
	vendedor: 1,
	telefone: 1,
	email: 1,
	codigoSVB: 1,
	uf: 1,
	cidade: 1,
	bairro: 1,
	logradouro: 1,
	numeroResidencia: 1,
};

export const AppProjectResultsSimplifiedProjection = {
	_id: 1,
	qtde: 1,
	nomeDoContrato: 1,
	codigoSVB: 1,
	cidade: 1,
	identificador: 1,
	tipoDeServico: 1,
	idParceiro: 1,
	idProjetoCRM: 1,
	"sistema.potPico": 1,
	"sistema.valorProjeto": 1,
	"padrao.valor": 1,
	"estruturaPersonalizada.valor": 1,
	"contrato.dataSolicitacao": 1,
	"contrato.dataLiberacao": 1,
	"contrato.dataAssinatura": 1,
	homologacao: 1,
	"compra.status": 1,
	"compra.dataLiberacao": 1,
	"compra.dataPedido": 1,
	"compra.dataEntrega": 1,
	"obra.statusDaObra": 1,
	"obra.entrada": 1,
	"obra.saida": 1,
};

export type TAppProjectComissionSimplified = Pick<
	TAppProject,
	"qtde" | "nomeDoContrato" | "codigoSVB" | "uf" | "cidade" | "vendedor" | "tipoDeServico" | "comissoes" | "canalVenda" | "insider" | "idProjetoCRM"
> & {
	contrato: {
		dataAssinatura: TAppProject["contrato"]["dataAssinatura"];
	};
	pagamento: {
		dataRecebimento: TAppProject["pagamento"]["dataRecebimento"];
	};
	sistema: {
		potPico: TAppProject["sistema"]["potPico"];
		valorProjeto: TAppProject["sistema"]["valorProjeto"];
	};
	padrao: {
		valor: TAppProject["padrao"]["valor"];
	};
	estruturaPersonalizada: {
		valor: TAppProject["estruturaPersonalizada"]["valor"];
	};
	oem: {
		valor: TAppProject["oem"]["valor"];
	};
	seguro: {
		valor: TAppProject["seguro"]["valor"];
	};
	compra: {
		dataPagamento: TAppProject["compra"]["dataPagamento"];
	};
};
export const AppProjectComissionSimplifiedProjection = {
	qtde: 1,
	nomeDoContrato: 1,
	codigoSVB: 1,
	uf: 1,
	cidade: 1,
	vendedor: 1,
	tipoDeServico: 1,
	"contrato.dataAssinatura": 1,
	comissoes: 1,
	"pagamento.dataRecebimento": 1,
	"sistema.potPico": 1,
	"sistema.valorProjeto": 1,
	"padrao.valor": 1,
	"estruturaPersonalizada.valor": 1,
	"oem.valor": 1,
	"compra.dataPagamento": 1,
	canalVenda: 1,
	insider: 1,
	idProjetoCRM: 1,
};

const PersonalizedFieldFilters = z.enum(
	[
		"contrato.dataAssinatura",
		"projeto.dataSolicitacaoAcesso",
		"parecer.dataParecerDeAcesso",
		"compra.dataPagamento",
		"compra.dataPedido",
		"compra.previsaoEntrega",
		"compra.dataEntrega",
		"obra.saida",
		"vistoria.dataPedido",
		"medidor.data",
		"manutencoes.dataEfetivacao",
	],
	{ required_error: "Filtro de campo de período não informado.", invalid_type_error: "Tipo não válido para o campo de filtro de período." },
);

export const PersonalizedFiltersSchema = z.object({
	name: z.string({
		required_error: "Filtro do nome do contrato não informado.",
		invalid_type_error: "Tipo não válido para o filtro de nome do contrato.",
	}),
	period: z.object({
		after: z.string({ required_error: "Filtro de depois de não informado.", invalid_type_error: "Tipo não válido para o filtro de depois de." }).optional().nullable(),
		before: z.string({ required_error: "Filtro de antes de não informado.", invalid_type_error: "Tipo não válido para o filtro de antes de." }).optional().nullable(),
		field: PersonalizedFieldFilters.optional().nullable(),
	}),
	state: z.array(z.string({ required_error: "Estado de filtro não informada.", invalid_type_error: "Tipo não válido para estado de filtro." }), {
		required_error: "Lista de estados de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de estados de filtro.",
	}),
	city: z.array(z.string({ required_error: "Cidade de filtro não informada.", invalid_type_error: "Tipo não válido para cidade de filtro." }), {
		required_error: "Lista de cidades de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de cidades de filtro.",
	}),
	serviceType: z.array(z.string({ required_error: "Tipo de serviço de filtro não informada.", invalid_type_error: "Tipo não válido para tipo de serviço de filtro." }), {
		required_error: "Lista de tipos de serviço de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de tipos de serviço de filtro.",
	}),
	seller: z.array(z.string({ required_error: "Vendedor de filtro não informada.", invalid_type_error: "Tipo não válido para vendedor de filtro." }), {
		required_error: "Lista de vendedores de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de vendedores de filtro.",
	}),
	insider: z.array(z.string({ required_error: "SDR de filtro não informada.", invalid_type_error: "Tipo não válido para SDR de filtro." }), {
		required_error: "Lista de SDRs de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de SDRs de filtro.",
	}),
	technicalTeam: z.array(z.string({ required_error: "Equipe técnica de filtro não informada.", invalid_type_error: "Tipo não válido para equipe técnica de filtro." }), {
		required_error: "Lista de equipes técnicas de filtro não informada.",
		invalid_type_error: "Tipo não válido para lista de equipes técnicas de filtro.",
	}),
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
	modulesQty: z.object({
		greater: z.number({ invalid_type_error: "Tipo não válido para o filtro de módulos maior que." }).optional().nullable(),
		less: z.number({ invalid_type_error: "Tipo não válido para o filtro de módulos menor que." }).optional().nullable(),
	}),
});
export type TPersonalizedProjectsFilter = z.infer<typeof PersonalizedFiltersSchema>;

const Comissions = z.array(
	z.object({
		comissionado: z.object({
			idCRM: z.string(),
			nome: z.string(),
			avatar_url: z.string().optional().nullable(),
		}),
		valor: z.number().optional().nullable(),
		dataPagamento: z.string().datetime().optional(),
	}),
);
