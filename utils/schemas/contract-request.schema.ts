import z from "zod";
import { ProductItemSchema, ServiceItemSchema } from "./kits.schema";

const GeneralContractRequestSchema = z.object({
	idVendedor: z.string().optional().nullable(),
	nomeVendedor: z.string().optional(),
	avatarVendedor: z.string().optional().nullable(),
	nomeDoProjeto: z.string(),
	telefoneVendedor: z.string(),
	tipoDeServico: z.string(), // replace with the actual Zod schema for projectTypes
	nomeDoContrato: z.string(),
	telefone: z.string(),
	cpf_cnpj: z.string(),
	rg: z.string(),
	dataDeNascimento: z.string().nullable().optional(),
	cep: z.string(),
	cidade: z.string().nullable().optional(),
	uf: z.string().nullable(), // replace with the actual Zod schema for stateCities
	enderecoCobranca: z.string(),
	numeroResCobranca: z.string(),
	bairro: z.string(),
	pontoDeReferencia: z.string(),
	segmento: z.string().optional(), // replace with the actual Zod schema for customersNich
	formaAssinatura: z.string().optional(), // replace with the actual Zod schema for signMethods
	codigoSVB: z.string(),
	estadoCivil: z.string().nullable().optional(), // replace with the actual Zod schema for maritalStatus
	email: z.string(),
	profissao: z.string(),
	ondeTrabalha: z.string(),
	possuiDeficiencia: z.enum(["NÃO", "SIM"]),
	qualDeficiencia: z.string(),
	canalVenda: z.string().nullable().optional(), // replace with the actual Zod schema for customersAcquisitionChannels
	nomeIndicador: z.string(),
	telefoneIndicador: z.string(),
	comoChegouAoCliente: z.string(),
	nomeContatoJornadaUm: z.string(),
	telefoneContatoUm: z.string(),
	nomeContatoJornadaDois: z.string(),
	telefoneContatoDois: z.string(),
	cuidadosContatoJornada: z.string(),
	nomeTitularProjeto: z.string().optional(),
	cpf_cnpjTitularProjeto: z.string().optional(),
	tipoDoTitular: z.enum(["PESSOA FISICA", "PESSOA JURIDICA"]).nullable().optional(),
	tipoDaLigacao: z.enum(["NOVA", "EXISTENTE"]).nullable().optional(),
	tipoDaInstalacao: z.enum(["URBANO", "RURAL"]).nullable().optional(),
	observacoesHomologacao: z.string({ invalid_type_error: "Tipo não válido para as observações da homologação." }).optional().nullable(),
	homologacaoFastTrack: z.boolean().optional().nullable(),
	cepInstalacao: z.string(),
	enderecoInstalacao: z.string(),
	numeroResInstalacao: z.string().optional(),
	numeroInstalacao: z.string().optional(),
	bairroInstalacao: z.string(),
	cidadeInstalacao: z.string().nullable().optional(),
	ufInstalacao: z.string().nullable(), // replace with the actual Zod schema for stateCities
	pontoDeReferenciaInstalacao: z.string(),
	cepEntrega: z.string().optional().nullable(),
	ufEntrega: z.string().optional().nullable(),
	cidadeEntrega: z.string().optional().nullable(),
	bairroEntrega: z.string().optional().nullable(),
	enderecoEntrega: z.string().optional().nullable(),
	numeroResEntrega: z.string().optional().nullable(),
	pontoDeReferenciaEntrega: z.string().optional().nullable(),
	latitudeEntrega: z.string().optional().nullable(),
	longitudeEntrega: z.string().optional().nullable(),
	loginCemigAtende: z.string(),
	senhaCemigAtende: z.string(),
	latitude: z.string(),
	longitude: z.string(),
	potPico: z.number().optional(),
	geracaoPrevista: z.number().optional(),
	produtos: z.array(ProductItemSchema),
	servicos: z.array(ServiceItemSchema),
	topologia: z.enum(["INVERSOR", "MICRO-INVERSOR"]).nullable().optional(),
	marcaInversor: z.string(),
	qtdeInversor: z.string(),
	potInversor: z.string(),
	marcaModulos: z.string(),
	qtdeModulos: z.union([z.string(), z.number()]),
	potModulos: z.string(),
	// Metadata for oem items
	marcaModulosOem: z.string().optional().nullable(),
	qtdeModulosOem: z.string().optional().nullable(),
	potModulosOem: z.string().optional().nullable(),
	marcaInversorOem: z.string().optional().nullable(),
	qtdeInversorOem: z.string().optional().nullable(),
	potInversorOem: z.string().optional().nullable(),

	tipoEstrutura: z.string().nullable().optional(), // replace with the actual Zod schema for structureTypes
	materialEstrutura: z.enum(["MADEIRA", "FERRO"]).nullable().optional(),
	estruturaAmpere: z.enum(["SIM", "NÃO"]).nullable(),
	responsavelEstrutura: z.enum(["NÃO SE APLICA", "AMPERE", "CLIENTE"]),
	formaPagamentoEstrutura: z.string().nullable().optional(),
	valorEstrutura: z.number().nullable().optional(),
	possuiOeM: z.enum(["SIM", "NÃO"]),
	planoOeM: z.enum(["PLANO SOL +", "MANUTENÇÃO SIMPLES", "NÃO SE APLICA", "PLANO SOL"]),
	clienteSegurado: z.enum(["SIM", "NÃO"]),
	valorSeguro: z.number(),
	tempoSegurado: z.string(),
	formaPagamentoOeMOuSeguro: z.string(),
	valorOeMOuSeguro: z.number().nullable().optional(),
	aumentoDeCarga: z.enum(["SIM", "NÃO"]).nullable().optional(),
	caixaConjugada: z.enum(["SIM", "NÃO"]).nullable().optional(),
	tipoDePadrao: z.string().nullable().optional(),
	aumentoDisjuntor: z.enum(["SIM", "NÃO"]).nullable().optional(),
	respTrocaPadrao: z.enum(["NÃO SE APLICA", "AMPERE", "CLIENTE"]).nullable().optional(),
	formaPagamentoPadrao: z.string().nullable().optional(),
	valorPadrao: z.number().nullable().optional(),
	nomePagador: z.string(),
	contatoPagador: z.string(),
	necessidaInscricaoRural: z.enum(["SIM", "NÃO"]).nullable().optional(),
	inscriçãoRural: z.string(),
	cpf_cnpjNF: z.string(),
	localEntrega: z.string().nullable().optional(),
	entregaIgualCobranca: z.enum(["NÃO", "SIM", "NÃO SE APLICA"]).nullable().optional(),
	restricoesEntrega: z.string().nullable().optional(),
	valorContrato: z.number().nullable().optional(),
	origemRecurso: z.enum(["FINANCIAMENTO", "CAPITAL PRÓPRIO"]).nullable().optional(),
	numParcelas: z.number().nullable().optional(),
	valorParcela: z.number().nullable().optional(),
	credor: z.string().nullable().optional(), // replace with the actual Zod schema for creditors
	nomeGerente: z.string(),
	contatoGerente: z.string(),
	necessidadeNFAdiantada: z.enum(["SIM", "NÃO"]).nullable().optional(),
	necessidadeCodigoFiname: z.enum(["SIM", "NÃO"]).nullable().optional(),
	formaDePagamento: z.string().nullable().optional(),
	formaDePagamentoId: z.string().nullable().optional(),
	descricaoNegociacao: z.string(),
	possuiDistribuicao: z.enum(["SIM", "NÃO"]).nullable().optional(),
	realizarHomologacao: z.boolean().optional(),
	obsComercial: z.string().optional(),
	distribuicoes: z.array(z.object({ numInstalacao: z.string(), excedente: z.number().optional() })),
	links: z
		.array(z.object({ title: z.string(), link: z.string(), format: z.string() }))
		.nullable()
		.optional(),
	nomeParceiro: z.string().optional().nullable(),
	idParceiro: z.string().optional().nullable(),
	idVisitaTecnica: z.string().optional().nullable(),
	idProjetoCRM: z.string().optional().nullable(),
	idPropostaCRM: z.string().optional().nullable(),
	idOportunidade: z.string().optional().nullable(),
	insider: z.string().optional().nullable(),
	aprovacao: z.boolean().optional().nullable(),
	confeccionado: z.boolean().optional().nullable(),
	dataAprovacao: z.string().datetime().optional().nullable(),
	dataSolicitacao: z.string().datetime(),
});

export type TContractRequest = z.infer<typeof GeneralContractRequestSchema>;
// export interface TContractRequest {
//   nomeVendedor?: string
//   nomeDoProjeto: string
//   idParceiro?: string | null
//   idHomologacao?: string | null
//   telefoneVendedor: string
//   tipoDeServico: string
//   nomeDoContrato: string
//   telefone: string
//   cpf_cnpj: string
//   rg: string
//   dataDeNascimento?: string | null
//   cep: string
//   cidade?: string | null
//   uf: string | null
//   enderecoCobranca: string
//   numeroResCobranca: string
//   bairro: string
//   pontoDeReferencia: string
//   segmento?: string
//   formaAssinatura?: 'FISICO' | 'DIGITAL'
//   codigoSVB: string
//   estadoCivil?: string | null
//   email: string
//   profissao: string
//   ondeTrabalha: string
//   possuiDeficiencia: 'NÃO' | 'SIM'
//   qualDeficiencia: string
//   canalVenda?: string | null
//   nomeIndicador: string
//   telefoneIndicador: string
//   comoChegouAoCliente: string
//   nomeContatoJornadaUm: string
//   telefoneContatoUm: string
//   nomeContatoJornadaDois: string
//   telefoneContatoDois: string
//   cuidadosContatoJornada: string
//   nomeTitularProjeto?: string
//   tipoDoTitular?: 'PESSOA FISICA' | 'PESSOA JURIDICA' | null
//   tipoDaLigacao?: 'NOVA' | 'EXISTENTE' | null
//   tipoDaInstalacao?: 'URBANO' | 'RURAL' | null
//   cepInstalacao: string
//   enderecoInstalacao: string
//   numeroResInstalacao?: string
//   numeroInstalacao?: string
//   bairroInstalacao: string
//   cidadeInstalacao?: string | null
//   ufInstalacao: string | null
//   pontoDeReferenciaInstalacao: string
//   loginCemigAtende: string
//   senhaCemigAtende: string
//   latitude: string
//   longitude: string
//   potPico?: number
//   geracaoPrevista?: number
//   topologia?: 'INVERSOR' | 'MICRO-INVERSOR' | null
//   marcaInversor: string
//   qtdeInversor: string
//   potInversor: string
//   marcaModulos: string
//   qtdeModulos: string | number
//   potModulos: string
//   tipoEstrutura: string
//   materialEstrutura?: 'MADEIRA' | 'FERRO' | null
//   estruturaAmpere?: 'SIM' | 'NÃO'
//   responsavelEstrutura?: 'NÃO SE APLICA' | 'AMPERE' | 'CLIENTE'
//   formaPagamentoEstrutura?: string | null
//   valorEstrutura?: number | null
//   possuiOeM?: 'SIM' | 'NÃO'
//   planoOeM?: 'PLANO SOL +' | 'MANUTENÇÃO SIMPLES' | 'NÃO SE APLICA' | 'PLANO SOL'
//   clienteSegurado?: 'SIM' | 'NÃO'
//   tempoSegurado?: string
//   formaPagamentoOeMOuSeguro?: string
//   valorOeMOuSeguro?: number | null
//   aumentoDeCarga?: 'SIM' | 'NÃO' | null
//   caixaConjugada?: 'SIM' | 'NÃO' | null
//   tipoDePadrao?: string | null
//   aumentoDisjuntor?: 'SIM' | 'NÃO' | null
//   respTrocaPadrao?: 'NÃO SE APLICA' | 'AMPERE' | 'CLIENTE' | null
//   formaPagamentoPadrao?: string | null
//   valorPadrao?: number | null
//   nomePagador: string
//   contatoPagador: string
//   necessidaInscricaoRural?: 'SIM' | 'NÃO' | null
//   inscriçãoRural: string
//   cpf_cnpjNF: string
//   localEntrega?: string | null
//   entregaIgualCobranca?: 'NÃO' | 'SIM' | 'NÃO SE APLICA' | null
//   restricoesEntrega?: string | null
//   valorContrato: number | null
//   origemRecurso?: 'FINANCIAMENTO' | 'CAPITAL PRÓPRIO' | null
//   numParcelas: number | null
//   valorParcela: number | null
//   credor: string | null
//   nomeGerente: string
//   contatoGerente: string
//   necessidadeNFAdiantada?: 'SIM' | 'NÃO' | null
//   necessidadeCodigoFiname?: 'SIM' | 'NÃO' | null
//   formaDePagamento: string | null
//   descricaoNegociacao: string
//   possuiDistribuicao: 'SIM' | 'NÃO' | null
//   realizarHomologacao?: boolean
//   obsComercial?: string
//   distribuicoes: { numInstalacao: string; excedente?: number }[]
//   links?: { title: string; link: string; format: string }[] | null
// }
