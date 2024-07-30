import z from 'zod'
import { InverterSchema, ModuleSchema, ProductItemSchema, ServiceItemSchema } from './kits.schema'
import { AuthorSchema } from './user.schema'
import { PaymentMethodItemSchema } from './proposal.schema'
import { TClientDTO } from './client.schema'
import { THomologationDTO } from './homologation.schema'
import { TTechnicalAnalysisDTO } from './technical-analysis.schema'

const PurchaseItemsSchema = z.object({
  descricao: z.string(),
  precoUnitario: z.number(),
  qtde: z.number(),
  grandeza: z.string(),
})

const ProjectObservationSchema = z.object({
  assunto: z.enum(['SERVIÇOS', 'PRODUTOS', 'NEGOCIAÇÃO', 'SUPRIMENTAÇÃO', 'EXECUÇÃO']),
  descricao: z.string({ required_error: 'Descrição de observação não informada.', invalid_type_error: 'Tipo não válido para a descrição da observação.' }),
  data: z
    .string({ required_error: 'Data de inserção da observação não informada.', invalid_type_error: 'Tipo não válido para a data de inserção da observação.' })
    .datetime({ message: 'Formato inválido para a data de inserção da observação.' }),
  autor: AuthorSchema,
})
const ProjectAccessCredentials = z.object({
  identificador: z.string({
    required_error: 'Identificador da plataforma de acesso não informado.',
    invalid_type_error: 'Tipo não válido para o identificador da plataforma de acesso.',
  }),
  login: z.string({ required_error: 'Login do acesso não informado.', invalid_type_error: 'Tipo não válido para o login de acesso.' }),
  senha: z.string({ required_error: 'Senha do acesso não informada.', invalid_type_error: 'Tipo não válido para a senha de acesso.' }),
  dataInsercao: z.string({
    required_error: 'Data de adição das credenciais de acesso não informada.',
    invalid_type_error: 'Tipo não válido para data de adição das credenciais.',
  }),
  autor: AuthorSchema,
})

const SaleSchema = z.union([
  z.object({ tipo: z.literal('ÚNICA') }),
  z.object({
    tipo: z.literal('RECORRENTE'),
    intervalo: z.union([z.literal('DIÁRIO'), z.literal('SEMANAL'), z.literal('MENSAL'), z.literal('SEMESTRAL'), z.literal('ANUAL')]),
    espacamento: z.number().default(1),
  }),
])
export const GeneralProjectSchema = z.object({
  indexador: z.number({}),
  nome: z.string(),
  idParceiro: z.string(),
  identificador: z.string(),
  tipo: z.object({
    id: z
      .string({
        required_error: 'ID de referência do tipo de projeto não encontrado.',
        invalid_type_error: 'Tipo não válido para o ID de referência do tipo de projeto.',
      })
      .min(12, 'Tipo inválido para ID de tipo deprojeto.'),
    titulo: z.string({ required_error: 'Titulo do tipo de projeto não encontrado.', invalid_type_error: 'Tipo não válido para o titulo do tipo de projeto.' }),
  }),
  venda: SaleSchema,
  responsaveis: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      papel: z.string(),
      avatar_url: z.string().optional().nullable(),
    })
  ),
  oportunidade: z.object({
    id: z.string(),
    nome: z.string(),
  }),
  proposta: z.object({
    id: z.string(),
    nome: z.string(),
  }),
  cliente: z.object({
    id: z.string(),
    nome: z.string(),
  }),
  idHomologacao: z.string({ invalid_type_error: 'Tipo inválido para o ID de referência da homologação ativa.' }).optional().nullable(),
  idAnaliseTecnica: z.string({ invalid_type_error: 'Tipo inválido para o ID de referência da análise técnica ativa.' }).optional().nullable(),
  observacoes: z.array(ProjectObservationSchema),
  contatos: z.object({
    nomePrimario: z.string(),
    telefonePrimario: z.string(),
    nomeSecundario: z.string(),
    telefoneSecundario: z.string().optional().nullable(),
    email: z.string(),
    observacoes: z.string(),
  }),
  acessos: z.array(ProjectAccessCredentials),
  localizacao: z.object({
    cep: z.string(),
    uf: z.string(),
    cidade: z.string(),
    bairro: z.string(),
    endereco: z.string(),
    numeroOuIdentificador: z.string(),
    distancia: z.number().optional().nullable(),
    complemento: z.string().optional().nullable(),
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
  }),
  segmento: z.union([z.literal('RESIDENCIAL'), z.literal('RURAL'), z.literal('COMERCIAL'), z.literal('INDUSTRIAL')]),
  contrato: z.object({
    status: z.union([
      z.literal('AGUARDANDO APROVAÇÃO'),
      z.literal('SOLICITADO'),
      z.literal('AGUARDANDO ASSINATURA'),
      z.literal('ASSINADO'),
      z.literal('RESCISÃO'),
    ]),
    dataSolicitacao: z.string(),
    dataLiberacao: z.string().optional().nullable(),
    dataAssinatura: z.string().optional().nullable(),
    formaAssinatura: z.union([z.literal('FÍSICA'), z.literal('DIGITAL')]),
  }),
  pagamento: z.object({
    pagador: z.object({
      nome: z.string(),
      telefone: z.string(),
      email: z.string(),
      cpfCnpj: z.string(),
    }),
    metodo: PaymentMethodItemSchema,
    credito: z.object({
      credor: z.string({ required_error: 'Nome do credor não informado.', invalid_type_error: 'Tipo não válido para o nome do credor.' }).optional().nullable(),
      nomeResponsavel: z
        .string({
          required_error: 'Nome do gerente/responsável pelo crédito.',
          invalid_type_error: 'Tipo não válido para o nome do gerente/responsável pelo crédito.',
        })
        .optional()
        .nullable(),
      telefoneResponsavel: z
        .string({
          required_error: 'Nome do gerente/responsável pelo crédito.',
          invalid_type_error: 'Tipo não válido para o nome do gerente/responsável pelo crédito.',
        })
        .optional()
        .nullable(),
      observacoes: z.string({ invalid_type_error: 'Tipo não válido para as observações de aquisição de crédito.' }).optional().nullable(),
    }),
    observacoes: z.string({ invalid_type_error: 'Tipo não válido para as observações do pagamento.' }).optional().nullable(),
  }),
  faturamento: z.object({
    observacoes: z.string({
      required_error: 'Observações sobre o faturamento não fornecidas.',
      invalid_type_error: 'Tipo não válido para as observações de faturamento.',
    }),
    dataEfetivacao: z
      .string({ invalid_type_error: 'Tipo não válido para a data de efetivação das pendências de faturamento.' })
      .datetime({ message: 'Formato inválido para a data de efetivação das pendências de faturamento.' })
      .optional()
      .nullable(),
  }),
  liberacoes: z.object({
    comercial: z.string().datetime().optional().nullable(),
    suprimentos: z.string().datetime().optional().nullable(),
    projetos: z.string().datetime().optional().nullable(),
    execucao: z.string().datetime().optional().nullable(),
    financeiro: z.string().datetime().optional().nullable(),
  }),
  finalizacoes: z.object({
    comercial: z.string().datetime().optional().nullable(),
    suprimentos: z.string().datetime().optional().nullable(),
    projetos: z.string().datetime().optional().nullable(),
    execucao: z.string().datetime().optional().nullable(),
    financeiro: z.string().datetime().optional().nullable(),
  }),
  produtos: z.array(ProductItemSchema),
  servicos: z.array(ServiceItemSchema),
  potenciaPico: z.number(),
  valor: z.number(),
  nps: z.number().optional().nullable(),
  aprovacao: z.object({
    dadosGerais: z.boolean().optional().nullable(),
    dadosVenda: z.boolean().optional().nullable(),
    dadosFinanceiros: z.boolean().optional().nullable(),
    documentacoes: z.boolean().optional().nullable(),
    dataAprovacao: z.boolean().optional().nullable(),
    autor: AuthorSchema.optional().nullable(),
  }),
  autor: AuthorSchema,
  dataInsercao: z.string({ required_error: 'Data de inserção não informada.', invalid_type_error: 'Tipo não válido para data de inserção.' }).datetime(),
})
export type TProject = z.infer<typeof GeneralProjectSchema>
export type TProjectUltraSimplified = Pick<
  TProject,
  'indexador' | 'nome' | 'tipo' | 'identificador' | 'responsaveis' | 'idParceiro' | 'cliente' | 'oportunidade'
>
export type TProjectWithReferences = TProject & { clienteDados: TClientDTO; homologacaoDados?: THomologationDTO; analiseTecnicaDados?: TTechnicalAnalysisDTO }

export type TProjectDTO = TProject & { _id: string }
export type TProjectDTOWithReferences = TProjectDTO & {
  clienteDados: TClientDTO
  homologacaoDados?: THomologationDTO
  analiseTecnicaDados?: TTechnicalAnalysisDTO
}
export type TProjectUltraSimplifiedDTO = TProjectUltraSimplified & { _id: string }

export type TChangesControl = {
  project: { [key: string]: any }
  client: { [key: string]: any }
}

export const ProjectUltraSimplifiedProjection = {
  indexador: 1,
  nome: 1,
  tipo: 1,
  identificador: 1,
  responsaveis: 1,
  idParceiro: 1,
  cliente: 1,
  oportunidade: 1,
}
