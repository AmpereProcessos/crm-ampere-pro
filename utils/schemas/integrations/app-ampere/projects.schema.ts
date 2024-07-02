import z from 'zod'

const MaintenanceItem = z.object({
  titulo: z.string({ required_error: 'Título da manutenção não informado.', invalid_type_error: 'Tipo não válido para o título da manutenção.' }),
  dataEfetivacao: z
    .string({
      required_error: 'Data de efetivação da manutenção não informada.',
      invalid_type_error: 'Tipo não válido para a data de efetivação da manutenção.',
    })
    .optional()
    .nullable(),
})
const GeneralProjectSchema = z.object({
  app: z.object({
    data: z.string().optional().nullable(),
    login: z.string().optional().nullable(),
    senha: z.union([z.string(), z.number()]).optional().nullable(),
  }),
  bairro: z.string(),
  canalVenda: z.string(),
  cep: z.union([z.string(), z.number()]),
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
      efetivado: z.boolean().optional().nullable(),
      pagamentoRealizado: z.boolean().optional().nullable(),
      porcentagemVendedor: z.number().optional().nullable(),
      porcentagemInsider: z.number().optional().nullable(),
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
    energiaInjetada: z.object({ data: z.string(), status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]) }),
    monitoramentoFeito: z.object({ data: z.string(), status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]) }),
    usinaLigada: z.object({ data: z.string(), status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]) }),
  }),
  contrato: z.object({
    dataAssinatura: z.string().optional().nullable(),
    dataLiberacao: z.string().optional().nullable(),
    dataSolicitacao: z.string().optional().nullable(),
    formaAssinatura: z.union([z.literal('FISICO'), z.literal('DIGITAL'), z.literal('NÃO DEFINIDO')]),
    status: z.string().optional().nullable(),
  }),
  cpf_cnpj: z.union([z.string(), z.number()]),
  dadosCemig: z.object({
    distCreditos: z.union([z.literal('NÃO'), z.literal('SIM'), z.literal('NÃO DEFINIDO')]),
    numeroInstalacao: z.union([z.string(), z.number()]),
    qtdeDistCreditos: z.number().optional().nullable(),
    titularProjeto: z.string(),
  }),
  dataNascimento: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  estruturaPersonalizada: z.object({
    aplicavel: z
      .union([z.literal('SIM'), z.literal('NÃO')])
      .optional()
      .nullable(),
    dataEntrega: z.string().optional().nullable(),
    dataMontagem: z.string().optional().nullable(),
    respPagamento: z
      .union([z.literal('CLIENTE'), z.literal('AMPERE'), z.literal('NÃO SE APLICA')])
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
      .union([z.literal('AMPERE ENERGIAS'), z.literal('ANALISE DO FINANCEIRO'), z.literal('IZAIRA SERVIÇOS')])
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
    dataEntregaTecnicaPresencial: z.string(),
    dataEntregaTecnicaRemota: z.string(),
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
    tipoEntregaTecnica: z.union([z.literal('REMOTO'), z.literal('PRESENCIAL')]),
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
        })
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
        })
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
        })
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
        })
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
        })
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
        })
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
        })
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
        })
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
        })
      )
      .optional()
      .nullable(),
  }),
  logradouro: z.string(),
  manutencaoPreventiva: z.object({
    data: z.string().optional().nullable(),
    status: z.union([z.literal('NÃO REALIZADO'), z.literal('REALIZADO')]),
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
          tipo: z.union([z.literal('MONOFÁSICO'), z.literal('BIFÁSICO'), z.literal('TRIFÁSICO')]),
        })
      )
      .optional()
      .nullable(),
    previsaoCustos: z.number().optional().nullable(),
    efetivoCustos: z.number().optional().nullable(),
    entregaFaltando: z.boolean().optional().nullable(),
    materialFaltante: z.string().optional().nullable(),
    statusSeparacao: z.union([z.literal('SEPARADO'), z.literal('NÃO DEFINIDO'), z.literal('INICIAR SEPARAÇÃO')]),
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
  numeroResidencia: z.union([z.string(), z.number()]),
  obra: z.object({
    checklist: z
      .union([z.literal('SIM'), z.literal('NÃO')])
      .optional()
      .nullable(),
    entrada: z.string().optional().nullable(),
    equipeResp: z.string().optional().nullable(),
    laudo: z
      .union([z.literal('EMITIDO'), z.literal('EM ESTUDO'), z.literal('NÃO DEFINIDO')])
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
    caixaConjugada: z.string().optional().nullable(),
    respInstalacao: z
      .union([z.literal('CLIENTE'), z.literal('AMPERE'), z.literal('NÃO SE APLICA')])
      .optional()
      .nullable(),
    respPagamento: z.string().optional().nullable(),
    tipo: z.string().optional().nullable(),
    tipoEntrada: z
      .union([z.literal('AÉREA'), z.literal('SUBTERRÂNEO')])
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
      .union([z.literal('FINANCIAMENTO'), z.literal('CAPITAL PRÓPRIO')])
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
    .union([z.literal('SIM'), z.literal('NÃO')])
    .optional()
    .nullable(),
  projeto: z.object({
    acStatus: z.string().optional().nullable(), // select options
    aumentoDeCarga: z.union([z.literal('SIM'), z.literal('NÃO')]),
    dataLiberacaoDocumentacao: z.string(),
    dataAssDocumentacao: z.string().optional().nullable(),
    dataSolicitacaoAcesso: z.string().optional().nullable(),
    desenhoTelhado: z.string().optional().nullable(),
    diagramaUnifilar: z.string().optional().nullable(),
    mapaDeMicro: z.string().optional().nullable(),
    fechamentoAC: z.string().optional().nullable(),
    formaAssDocumentacao: z
      .union([z.literal('DIGITAL'), z.literal('FISICA')])
      .optional()
      .nullable(),
    iniciar: z
      .union([z.literal('SIM'), z.literal('NÃO'), z.literal('NÃO DEFINIDO')])
      .optional()
      .nullable(),
    projetista: z.object({
      nome: z.string(),
      codigo: z.string(),
    }),
    projetoConcluido: z.union([z.literal('SIM'), z.literal('NÃO')]),
    realizarHomologacao: z.boolean().optional().nullable(),
  }),
  qtde: z.number(),
  qualDeficiencia: z.string().optional().nullable(),
  regional: z.string().nullable(),
  relatorios: z.object({
    envioUm: z.object({
      data: z.string().optional().nullable(),
      status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]),
    }),
    envioDois: z.object({
      data: z.string().optional().nullable(),
      status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]),
    }),
    envioTres: z.object({
      data: z.string().optional().nullable(),
      status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]),
    }),
    envioQuatro: z.object({
      data: z.string().optional().nullable(),
      status: z.union([z.literal('REALIZADO'), z.literal('NÃO REALIZADO')]),
    }),
  }),
  segmento: z.union([z.literal('RESIDENCIAL'), z.literal('RURAL'), z.literal('COMERCIAL'), z.literal('INDUSTRIAL'), z.literal('NÃO DEFINIDO')]),
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
      .union([z.literal('MICRO'), z.literal('INVERSOR'), z.literal('OTIMIZADOR')])
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
      .union([z.literal('AEREO'), z.literal('SUBTERRANEO')])
      .optional()
      .nullable(),
    status: z.string().optional().nullable(),
    tecnico: z.string().optional().nullable(),
    tipoDaTelha: z.string().optional().nullable(),
  }),
  vistoria: z.object({
    dataPedido: z.string().optional().nullable(),
    equipeDeCampoNecessaria: z
      .union([z.literal('SIM'), z.literal('NÃO')])
      .optional()
      .nullable(),
    motivoReprova: z.string().optional().nullable(),
    qtdeReprovas: z.number().optional().nullable(),
    status: z.string().optional().nullable(), // select options
    vistoriaReprovada: z
      .union([z.literal('SIM'), z.literal('NÃO')])
      .optional()
      .nullable(),
  }),
})

export type TAppProject = z.infer<typeof GeneralProjectSchema>

export type TAppProjectDTO = TAppProject & { _id: string }

export type TAppProjectDBSimplified = Pick<
  TAppProject,
  | 'nomeDoContrato'
  | 'tipoDeServico'
  | 'contrato'
  | 'qtde'
  | 'vendedor'
  | 'telefone'
  | 'email'
  | 'codigoSVB'
  | 'uf'
  | 'cidade'
  | 'bairro'
  | 'logradouro'
  | 'numeroResidencia'
>
export type TAppProjectDTODBSimplified = TAppProjectDBSimplified & { _id: string }
export const ProjectDBSimplifiedProjection = {
  _id: 1,
  nomeDoContrato: 1,
  tipoDeServico: 1,
  'contrato.status': 1,
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
}

const PersonalizedFieldFilters = z.enum(
  [
    'contrato.dataAssinatura',
    'projeto.dataSolicitacaoAcesso',
    'parecer.dataParecerDeAcesso',
    'compra.dataPagamento',
    'compra.dataPedido',
    'compra.previsaoEntrega',
    'compra.dataEntrega',
    'obra.saida',
    'vistoria.dataPedido',
    'medidor.data',
    'manutencoes.dataEfetivacao',
  ],
  { required_error: 'Filtro de campo de período não informado.', invalid_type_error: 'Tipo não válido para o campo de filtro de período.' }
)

export const PersonalizedFiltersSchema = z.object({
  name: z.string({
    required_error: 'Filtro do nome do contrato não informado.',
    invalid_type_error: 'Tipo não válido para o filtro de nome do contrato.',
  }),
  period: z.object({
    after: z
      .string({ required_error: 'Filtro de depois de não informado.', invalid_type_error: 'Tipo não válido para o filtro de depois de.' })
      .optional()
      .nullable(),
    before: z
      .string({ required_error: 'Filtro de antes de não informado.', invalid_type_error: 'Tipo não válido para o filtro de antes de.' })
      .optional()
      .nullable(),
    field: PersonalizedFieldFilters.optional().nullable(),
  }),
  state: z.array(z.string({ required_error: 'Estado de filtro não informada.', invalid_type_error: 'Tipo não válido para estado de filtro.' }), {
    required_error: 'Lista de estados de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de estados de filtro.',
  }),
  city: z.array(z.string({ required_error: 'Cidade de filtro não informada.', invalid_type_error: 'Tipo não válido para cidade de filtro.' }), {
    required_error: 'Lista de cidades de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de cidades de filtro.',
  }),
  serviceType: z.array(
    z.string({ required_error: 'Tipo de serviço de filtro não informada.', invalid_type_error: 'Tipo não válido para tipo de serviço de filtro.' }),
    {
      required_error: 'Lista de tipos de serviço de filtro não informada.',
      invalid_type_error: 'Tipo não válido para lista de tipos de serviço de filtro.',
    }
  ),
  seller: z.array(z.string({ required_error: 'Vendedor de filtro não informada.', invalid_type_error: 'Tipo não válido para vendedor de filtro.' }), {
    required_error: 'Lista de vendedores de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de vendedores de filtro.',
  }),
  insider: z.array(z.string({ required_error: 'SDR de filtro não informada.', invalid_type_error: 'Tipo não válido para SDR de filtro.' }), {
    required_error: 'Lista de SDRs de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de SDRs de filtro.',
  }),
  technicalTeam: z.array(
    z.string({ required_error: 'Equipe técnica de filtro não informada.', invalid_type_error: 'Tipo não válido para equipe técnica de filtro.' }),
    {
      required_error: 'Lista de equipes técnicas de filtro não informada.',
      invalid_type_error: 'Tipo não válido para lista de equipes técnicas de filtro.',
    }
  ),
  acquisitionChannel: z.array(
    z.string({
      required_error: 'Canal de aquisição de filtro não informada.',
      invalid_type_error: 'Tipo não válido para canal de aquisição de filtro.',
    }),
    {
      required_error: 'Lista de canais de aquisição de filtro não informada.',
      invalid_type_error: 'Tipo não válido para lista de canais de aquisição de filtro.',
    }
  ),
  modulesQty: z.object({
    greater: z.number({ invalid_type_error: 'Tipo não válido para o filtro de módulos maior que.' }).optional().nullable(),
    less: z.number({ invalid_type_error: 'Tipo não válido para o filtro de módulos menor que.' }).optional().nullable(),
  }),
})
export type TPersonalizedProjectsFilter = z.infer<typeof PersonalizedFiltersSchema>

const Comissions = z.array(
  z.object({
    comissionado: z.object({
      idCRM: z.string(),
      nome: z.string(),
      avatar_url: z.string().optional().nullable(),
    }),
    valor: z.number().optional().nullable(),
    dataPagamento: z.string().datetime().optional(),
  })
)
