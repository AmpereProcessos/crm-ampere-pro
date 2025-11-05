import z from "zod";
import { InverterSchema, ModuleSchema, ProductItemSchema, ServiceItemSchema } from "./kits.schema";
import { ObjectId } from "mongodb";
import { ElectricalInstallationGroupsSchema, TOpportunityDTO } from "./opportunity.schema";
import { FractionnementItemSchema } from "./payment-methods";
import { PlanDescriptiveItemSchema, PlanIntervalSchema } from "./signature-plans.schema";
import { TClientDTO } from "./client.schema";

const OrientationsSchema = z.union(
	[
		z.literal("LESTE"),
		z.literal("NORDESTE"),
		z.literal("NORTE"),
		z.literal("NOROESTE"),
		z.literal("OESTE"),
		z.literal("SUDOESTE"),
		z.literal("SUL"),
		z.literal("SUDESTE"),
	],
	{ invalid_type_error: "Tipo inválido para orientação." },
);
const TopologySchema = z.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")], { invalid_type_error: "Tipo inválido para topologia." });
export const ElectricalPhasesSchema = z.union([z.literal("MONOFÁSICO"), z.literal("BIFÁSICO"), z.literal("TRIFÁSICO")], {
	required_error: "Conexão elétrica não informada.",
	invalid_type_error: "Tipo não válido para a conexão elétrica.",
});
export type TEletricalPhases = z.infer<typeof ElectricalPhasesSchema>;
const PricingItemSchema = z.object({
	descricao: z.string({
		required_error: "Descrição da unidade de preço não informada.",
		invalid_type_error: "Tipo não válido para a descricação de unidade de preço.",
	}),
	custoCalculado: z.number({
		required_error: "Custo calculado da unidade de preço não informado.",
		invalid_type_error: "Tipo não válido para o custo calculado da unidade de preço.",
	}),
	custoFinal: z.number({
		required_error: "Custo final da unidade de preço não informado.",
		invalid_type_error: "Tipo não válido para o custo final da unidade de preço.",
	}),
	faturavel: z.boolean({
		required_error: "Aplicação de faturamento da unidade de preço não informada.",
		invalid_type_error: "Tipo não válido para aplicação de faturamento da unidade de preço.",
	}),
	formulaArr: z
		.array(z.string({ required_error: "Item da fórmula não informada.", invalid_type_error: "Tipo não válido para item da fórmula." }))
		.optional()
		.nullable(),
	margemLucro: z.number({
		required_error: "Margem de lucro da unidade de preço não informada.",
		invalid_type_error: "Tipo não válido para a margem de lucro da unidade de preço.",
	}),
	valorCalculado: z.number({
		required_error: "Valor calculado da unidade de preço não informado.",
		invalid_type_error: "Tipo não válido para o valor calculado da unidade de preço.",
	}),
	valorFinal: z.number({
		required_error: "Valor final da unidade de preço não informado.",
		invalid_type_error: "Tipo não válido para o valor final da unidade de preço.",
	}),
});
export type TPricingItem = z.infer<typeof PricingItemSchema>;

export const PaymentMethodItemSchema = z.object({
	id: z.string({
		required_error: "ID do método de pagamento não informado.",
		invalid_type_error: "Tipo não válido para o ID do método de pagamento.",
	}),
	nome: z.string({
		required_error: "Nome do método de pagamento não informado.",
		invalid_type_error: "Tipo não válido para o nome do método de pagamento.",
	}),
	descricao: z.string({
		required_error: "Descrição do método de pagamento não informada.",
		invalid_type_error: "Tipo não válido para a descrição do método de pagamento.",
	}),
	fracionamento: z.array(FractionnementItemSchema),
});
export type TProposalPaymentMethodItem = z.infer<typeof PaymentMethodItemSchema>;

const PremissesSchema = z.object({
	consumoEnergiaMensal: z.number({ invalid_type_error: "Tipo inválido para a premissa de consumo mensal." }).optional().nullable(),
	fatorSimultaneidade: z.number({ invalid_type_error: "Tipo inválido para a premissa de fator de simultaneidade." }).optional().nullable(),
	tarifaEnergia: z.number({ invalid_type_error: "Tipo inválido para a premissa de tarifa de energia." }).optional().nullable(),
	tarifaFioB: z.number({ invalid_type_error: "Tipo inválido para a premissa de tarifa de FIO B." }).optional().nullable(),
	tipoEstrutura: z.string({ invalid_type_error: "Tipo inválido para a premissa de tipo de estrutura." }).optional().nullable(),
	orientacao: OrientationsSchema.optional().nullable(),
	distancia: z.number({ invalid_type_error: "Tipo inválido para a premissa de distância." }).optional().nullable(),
	// others
	cidade: z.string({ invalid_type_error: "Tipo inválido para a premissa de cidade." }).optional().nullable(),
	uf: z.string({ invalid_type_error: "Tipo inválido para a premissa de UF." }).optional().nullable(),
	topologia: TopologySchema.optional().nullable(),
	potenciaPico: z.number({ invalid_type_error: "Tipo inválido para a premissa de potência pico." }).optional().nullable(),
	numModulos: z.number({ invalid_type_error: "Tipo inválido para a premissa de nº de módulos." }).optional().nullable(),
	numInversores: z.number({ invalid_type_error: "Tipo inválido para a premissa de nº de inversores." }).optional().nullable(),
	eficienciaGeracao: z.number({ invalid_type_error: "Tipo inválido para a premissa de eficiência de geração." }).optional().nullable(),
	grupoInstalacao: ElectricalInstallationGroupsSchema.optional().nullable(),
	valorReferencia: z.number({ invalid_type_error: "Tipo inválido para a premissa de valor de referência." }).optional().nullable(),
	ativacaoReferencia: z.enum(["SIM", "NÃO"], { invalid_type_error: "Tipo inválido para a premissa lógica de referência" }).optional().nullable(),
	faseamentoEletrico: ElectricalPhasesSchema.optional().nullable(),
	custosInstalacao: z.number({ invalid_type_error: "Tipo inválido para a premissa de custo estimado de instalação." }).optional().nullable(),
	custosPadraoEnergia: z.number({ invalid_type_error: "Tipo inválido para a premissa de custo estimado de adequação de padrão." }).optional().nullable(),
	custosEstruturaInstalacao: z
		.number({ invalid_type_error: "Tipo inválido para a premissa de custo estimado de estrutura de instalação." })
		.optional()
		.nullable(),
	custosOutros: z.number({ invalid_type_error: "Tipo inválido para a premissa de outros custos de estimado." }).optional().nullable(),
});
export type TProposalPremisses = z.infer<typeof PremissesSchema>;

const ProposalKitSchema = z.object({
	id: z.string({ required_error: "ID de referência do kit não informado.", invalid_type_error: "Tipo não válido para o ID de referência do kit." }),
	nome: z.string({ required_error: "Nome do kit não informado.", invalid_type_error: "Tipo não válido para nome do kit." }),
	valor: z.number({ required_error: "Valor do kit não informado.", invalid_type_error: "Tipo não válido para valor do kit." }).optional().nullable(),
	preco: z.number({ required_error: "Preço do kit não informado.", invalid_type_error: "Tipo não válido para preço do kit." }).optional().nullable(),
});
const ProposalPlanSchema = z.object({
	id: z.string({
		required_error: "ID de referência do plano não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência do plano.",
	}),
	nome: z.string({ required_error: "Nome do plano não informado.", invalid_type_error: "Tipo não válido para nome do plano." }),
	valor: z.number({ required_error: "Valor do plano não informado.", invalid_type_error: "Tipo não válido para valor do plano." }).optional().nullable(),
	preco: z.number({ required_error: "Preço do plano não informado.", invalid_type_error: "Tipo não válido para preço do plano." }).optional().nullable(),
	descricao: z.string({ description: "Descrição do plano não informada.", invalid_type_error: "Tipo não válido para a descrição do plano." }),
	intervalo: PlanIntervalSchema,
	descritivo: z.array(PlanDescriptiveItemSchema),
});
const ProposalProductSchema = z.object({
	id: z.string({ invalid_type_error: "Tipo não válido para ID do módulo." }).optional().nullable(),
	categoria: z.union([z.literal("MÓDULO"), z.literal("INVERSOR"), z.literal("INSUMO"), z.literal("ESTRUTURA"), z.literal("PADRÃO"), z.literal("OUTROS")]),
	fabricante: z.string({
		required_error: "Fabricante do produto não informado.",
		invalid_type_error: "Tipo não válido para o fabricante do produto.",
	}),
	modelo: z.string({ required_error: "Modelo do produto não informado.", invalid_type_error: "Tipo não válido para o modelo do produto." }),
	qtde: z.number({ required_error: "Quantidade do produto não informada.", invalid_type_error: "Tipo não válido para a quantidade do produto." }),
	potencia: z
		.number({ required_error: "Potência do produto não informada.", invalid_type_error: "Tipo não válido para a potência do produto." })
		.optional()
		.nullable(),
	garantia: z.number({ required_error: "Garantia do produto não informada.", invalid_type_error: "Tipo não válido para a garantia do produto." }),
	valor: z.number({ required_error: "Valor do produto não informado.", invalid_type_error: "Tipo não válido para o valor do produto." }).optional().nullable(),
	preco: z.number({ required_error: "Preço do produto não informado.", invalid_type_error: "Tipo não válido para o preço do produto." }).optional().nullable(),
});
export type TProposalProduct = z.infer<typeof ProposalProductSchema>;
const ProposalServiceSchema = z.object({
	id: z.string({ invalid_type_error: "Tipo não válido para ID do módulo." }).optional().nullable(),
	descricao: z.string({ required_error: "Descrição do serviço não informada.", invalid_type_error: "Tipo não válido para a descrição do serviço." }),
	observacoes: z.string({ required_error: "Observações do serviço não informadas.", invalid_type_error: "Tipo não válido para observações " }),
	garantia: z.number({ required_error: "Garantia do serviço não fornecida.", invalid_type_error: "Tipo não válido para garantia do serviço." }),
	valor: z.number({ required_error: "Valor do serviço não informado.", invalid_type_error: "Tipo não válido para o valor do serviço." }).optional().nullable(),
	preco: z.number({ required_error: "Preço do serviço não informado.", invalid_type_error: "Tipo não válido para o preço do serviço." }).optional().nullable(),
});
export type TProposalService = z.infer<typeof ProposalServiceSchema>;
export const GeneralProposalSchema = z.object({
	nome: z.string(),
	descricao: z.string().optional().nullable(),
	idParceiro: z.string(),
	idCliente: z.string(),
	idMetodologiaPrecificacao: z.string(),
	idModeloAnvil: z.string().optional().nullable(),
	idAnaliseTecnica: z.string().optional().nullable(),
	valor: z.number(),
	premissas: PremissesSchema,
	oportunidade: z.object({
		id: z.string(),
		nome: z.string(),
	}),
	kits: z.array(ProposalKitSchema),
	planos: z.array(ProposalPlanSchema),
	produtos: z.array(ProposalProductSchema),
	servicos: z.array(ProposalServiceSchema),
	topologia: z
		.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")])
		.optional()
		.nullable(),
	precificacao: z.array(PricingItemSchema),
	pagamento: z.object({
		metodos: z.array(PaymentMethodItemSchema),
	}),
	potenciaPico: z.number().optional().nullable(),
	urlArquivo: z.string().optional().nullable(),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});
export const InsertProposalSchema = z.object({
	nome: z.string({ required_error: "Nome da proposta não informado.", invalid_type_error: "Tipo não válido para o nome da proposta." }),
	descricao: z.string({ invalid_type_error: "Tipo não válido para a descrição da proposta." }).optional().nullable(),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	idCliente: z.string({ required_error: "Vínculo de cliente não informado.", invalid_type_error: "Tipo não válido para vínculo de cliente." }),
	idMetodologiaPrecificacao: z.string({
		required_error: "Vínculo de metodologia de precificação não informado.",
		invalid_type_error: "Tipo não válido para o vínculo de metodologia.",
	}),
	idModeloAnvil: z
		.string({
			required_error: "ID de referência do modelo de proposta não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do modelo de proposta.",
		})
		.optional()
		.nullable(),
	idAnaliseTecnica: z
		.string({
			required_error: "ID de referência da análise técnica não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência da análise técnica.",
		})
		.optional()
		.nullable(),
	valor: z.number({ required_error: "Valor da proposta não informado.", invalid_type_error: "Tipo não válido para o valor da proposta." }),
	premissas: PremissesSchema,
	oportunidade: z.object({
		id: z.string({
			required_error: "Referência a oportunidade não fornecida.",
			invalid_type_error: "Tipo não válido para a referência a oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome da oportunidade não fornecido.",
			invalid_type_error: "Tipo não válido para o nome da oportunidade.",
		}),
	}),
	kits: z.array(ProposalKitSchema, {
		required_error: "Lista de kits da proposta não informada.",
		invalid_type_error: "Tipo não válido para lista de kits da proposta.",
	}),
	planos: z.array(ProposalPlanSchema, {
		required_error: "Lista de planos da proposta não informada.",
		invalid_type_error: "Tipo não válido para lista de planos da proposta.",
	}),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	precificacao: z.array(PricingItemSchema),
	pagamento: z.object({
		metodos: z.array(PaymentMethodItemSchema),
	}),
	potenciaPico: z.number().optional().nullable(),
	urlArquivo: z
		.string({
			required_error: "URL do arquivo da proposta não informado.",
			invalid_type_error: "Tipo não válido para o URL do arquivo da proposta.",
		})
		.optional()
		.nullable(),
	autor: z.object({
		id: z.string({ required_error: "ID do autor não informado.", invalid_type_error: "Tipo não válido para ID do autor." }),
		nome: z.string({ required_error: "Nome do autor não informado.", invalid_type_error: "Tipo não válido para o nome do autor." }),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Tipo não válido para a data de inserção." }),
});
export const UpdateProposalSchema = z.object({
	_id: z.string({
		required_error: "ID de referência da proposta não informado.",
		invalid_type_error: "Tipo não válido para o ID de referência da proposta.",
	}),
	nome: z.string({ required_error: "Nome da proposta não informado.", invalid_type_error: "Tipo não válido para o nome da proposta." }),
	idParceiro: z.string({
		required_error: "Referência a parceiro não informado.",
		invalid_type_error: "Tipo não válido para a referência de parceiro.",
	}),
	idCliente: z.string({ required_error: "Vínculo de cliente não informado.", invalid_type_error: "Tipo não válido para vínculo de cliente." }),
	idMetodologiaPrecificacao: z.string({
		required_error: "Vínculo de metodologia de precificação não informado.",
		invalid_type_error: "Tipo não válido para o vínculo de metodologia.",
	}),
	idModeloAnvil: z
		.string({
			required_error: "ID de referência do modelo de proposta não informado.",
			invalid_type_error: "Tipo não válido para o ID de referência do modelo de proposta.",
		})
		.optional()
		.nullable(),
	valor: z.number({ required_error: "Valor da proposta não informado.", invalid_type_error: "Tipo não válido para o valor da proposta." }),
	premissas: PremissesSchema,
	oportunidade: z.object({
		id: z.string({
			required_error: "Referência a oportunidade não fornecida.",
			invalid_type_error: "Tipo não válido para a referência a oportunidade.",
		}),
		nome: z.string({
			required_error: "Nome da oportunidade não fornecido.",
			invalid_type_error: "Tipo não válido para o nome da oportunidade.",
		}),
	}),
	kits: z.array(ProposalKitSchema, {
		required_error: "Lista de kits da proposta não informada.",
		invalid_type_error: "Tipo não válido para lista de kits da proposta.",
	}),
	planos: z.array(ProposalPlanSchema, {
		required_error: "Lista de planos da proposta não informada.",
		invalid_type_error: "Tipo não válido para lista de planos da proposta.",
	}),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	precificacao: z.array(PricingItemSchema),
	pagamento: z.object({
		metodos: z.array(PaymentMethodItemSchema),
	}),
	potenciaPico: z.number().optional().nullable(),
	urlArquivo: z
		.string({
			required_error: "URL do arquivo da proposta não informado.",
			invalid_type_error: "Tipo não válido para o URL do arquivo da proposta.",
		})
		.optional()
		.nullable(),
	autor: z.object({
		id: z.string({ required_error: "ID do autor não informado.", invalid_type_error: "Tipo não válido para ID do autor." }),
		nome: z.string({ required_error: "Nome do autor não informado.", invalid_type_error: "Tipo não válido para o nome do autor." }),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Tipo não válido para a data de inserção." }),
});
const ProposalEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	nome: z.string(),
	descricao: z.string().optional().nullable(),
	idParceiro: z.string(),
	idCliente: z.string(),
	idMetodologiaPrecificacao: z.string(),
	idModeloAnvil: z.string().optional().nullable(),
	idAnaliseTecnica: z.string().optional().nullable(),
	valor: z.number(),
	premissas: PremissesSchema,
	oportunidade: z.object({
		id: z.string(),
		nome: z.string(),
	}),
	kits: z.array(ProposalKitSchema),
	planos: z.array(ProposalPlanSchema),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	topologia: z
		.union([z.literal("MICRO-INVERSOR"), z.literal("INVERSOR")])
		.optional()
		.nullable(),
	precificacao: z.array(PricingItemSchema),
	pagamento: z.object({
		metodos: z.array(PaymentMethodItemSchema),
	}),
	potenciaPico: z.number().optional().nullable(),
	urlArquivo: z.string().optional().nullable(),
	autor: z.object({
		id: z.string(),
		nome: z.string(),
		avatar_url: z.string().optional().nullable(),
	}),
	dataInsercao: z.string().datetime(),
});

export type TProposal = z.infer<typeof GeneralProposalSchema>;

export type TProposalEntity = z.infer<typeof ProposalEntitySchema>;

export type TProposalDTO = TProposal & { _id: string };

export type TProposalDTOWithOpportunity = TProposalDTO & { oportunidadeDados: TOpportunityDTO };
export type TProposalDTOWithOpportunityAndClient = TProposalDTO & { oportunidadeDados: TOpportunityDTO; clienteDados: TClientDTO };

// TIPOS DE PROPOSTA

// PROPOSTA DE KIT (OU KITS AGREGADOS)
// - UTILIZA PRODUTOS E SERVIÇOS DO KIT
// - CALCULA A PRECIFICAÇÃO COM BASE NO AGREGADO DOS KITS
// - CALCULA O PAGAMENTO COM BASE NO AGREGADO DOS KITS

// PROPOSTA DE PLANO (OU ESCOLHA DE PLANO)
// - UTILIZA PRODUTOS E SERVIÇOS DO PLANO
// - CALCULA A PRECIFICAÇÃO COM BASE NO PLANO ESCOLHIDO
// - CALCULA O PAGAMENTO COM BASE NO PLANO ESCOLHIDO

// PROPOSTA DE SERVIÇO (OU AGREGADO DE SERVIÇOS)
// - UTILIZA DOS SERVIÇOS AGREGADOS
// - CALCULA A PRECIFICAÇÃO COM BASE NO AGREGADO DOS SERVIÇOS
// - CALCULA O PAGAMENTO COM BASE NO AGREGADO DOS SERVIÇOS

// PROPOSTA DE PRODUTO (OU AGREGADO DE PRODUTOS)
// - UTILIZA DOS PRODUTOS AGREGADOS
// - CALCULA A PRECIFICAÇÃO COM BASE NO AGREGADO DOS PRODUTOS
// - CALCULA O PAGAMENTO COM BASE NO AGREGADO DOS PRODUTOS
