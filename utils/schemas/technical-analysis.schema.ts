import { z } from 'zod'
import { InverterFixationOptions, RoofTiles, StructureTypes, TechnicalAnalysisPendencyCategories, TechnicalAnalysisSolicitationTypes } from '../select-options'

const EquipmentSchema = z.object({
  id: z.string({ invalid_type_error: 'Tipo não válido para ID do módulo.' }).optional().nullable(),
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR'), z.literal('INSUMO'), z.literal('ESTRUTURA'), z.literal('PADRÃO'), z.literal('OUTROS')]),
  fabricante: z.string({ required_error: 'Fabricante do módulo não informado.', invalid_type_error: 'Tipo não válido para o fabricante do módulo.' }),
  modelo: z.string({ required_error: 'Modelo do módulo não informado.', invalid_type_error: 'Tipo não válido para o modelo do módulo.' }),
  qtde: z.number({ required_error: 'Quantidade do módulo não informada.', invalid_type_error: 'Tipo não válido para a quantidade do módulo.' }),
  potencia: z
    .number({ required_error: 'Potência do módulo não informada.', invalid_type_error: 'Tipo não válido para a potência do módulo.' })
    .optional()
    .nullable(),
})
export type TEquipment = z.infer<typeof EquipmentSchema>

const TechnicalAnalysisPendencyCategoriesSchema = z.enum(['PENDÊNCIA COMERCIAL', 'PENDÊNCIA TERCEIROS', 'PENDÊNCIA CONCESSIONÁRIA', 'OUTROS'], {
  required_error: 'Categoria de pendência não informada.',
  invalid_type_error: 'Tipo não válido para categoria de pendência.',
})
export type TTechnicalAnalysisPendencyCategory = z.infer<typeof TechnicalAnalysisPendencyCategoriesSchema>
export const GeneralTechnicalAnalysisSchema = z.object({
  idParceiro: z.string({
    required_error: 'ID de referência do parceiro não informado.',
    invalid_type_error: 'Tipo não válido para o ID de referência do parceiro.',
  }),
  nome: z.string({ required_error: 'Nome da análise técnica não informado.', invalid_type_error: 'Tipo não válido para o nome da análise técnica.' }),
  idAnaliseReferencia: z.string({ invalid_type_error: 'Tipo não válido para o ID da análise de referência.' }).optional().nullable(),
  status: z.string({
    required_error: 'Status da análise técnica não informado.',
    invalid_type_error: 'Tipo não válido para o status da análise técnica.',
  }), // create a list of options
  complexidade: z
    .union([z.literal('SIMPLES'), z.literal('INTERMEDIÁRIO'), z.literal('COMPLEXO')], {
      required_error: 'Complexidade da análise técnica não informada.',
      invalid_type_error: 'Tipo não válido para a complexidade da análise técnica.',
    })
    .optional()
    .nullable(),
  arquivosAuxiliares: z.string({ invalid_type_error: 'Tipo não válido para o link de arquivos auxiliares.' }).optional().nullable(), // link de fotos do drone, por exemplo
  pendencias: z.array(
    z.object({
      categoria: TechnicalAnalysisPendencyCategoriesSchema,
      descricao: z.string({
        required_error: 'Descrição não válida para a pendência.',
        invalid_type_error: 'Tipo não válido para a descrição da pendência.',
      }),
      responsavel: z.object({
        id: z
          .string({
            required_error: 'ID de referência do responsável não fornecido.',
            invalid_type_error: 'Tipo não válido para o ID do responsável.',
          })
          .optional()
          .nullable(),
        nome: z
          .string({ required_error: 'Nome do responsável não fornecido.', invalid_type_error: 'Tipo não válido para o nome do responsável.' })
          .optional()
          .nullable(),
        avatar_url: z.string({ invalid_type_error: 'Avatar do responsável não fornecido.' }).optional().nullable(),
      }),
      finalizado: z.boolean({
        required_error: 'Status de finalização da pendência não informada.',
        invalid_type_error: 'Tipo não válido para o status de finalização da pendência não informada.',
      }),
      dataFinalizacao: z.string({ invalid_type_error: 'Tipo inválido para data de finalização da pendência.' }).optional().nullable(),
      dataInsercao: z.string({ required_error: 'Date de inserção da pendência não informada.' }),
    })
  ),
  anotacoes: z.string({
    required_error: 'Anotações da análise técnica não informada.',
    invalid_type_error: 'Tipo não válido para as anotações da análise técnica.',
  }), // anotações gerais para auxilio ao analista
  tipoSolicitacao: z.enum([TechnicalAnalysisSolicitationTypes[0].value, ...TechnicalAnalysisSolicitationTypes.slice(1).map((p) => p.value)], {
    required_error: 'Tipo da solicitação de análise não informada.',
    invalid_type_error: 'Tipo não válido para o tipo de solicitação da análise.',
  }),
  comentarios: z.string({ invalid_type_error: 'Tipo não válido para os comentários da análise.' }).optional().nullable(),
  analista: z
    .object({
      id: z.union([z.number(), z.string()], {
        required_error: 'ID de referência do analista não informado.',
        invalid_type_error: 'Tipo não válido para o ID de referência do analista.',
      }),
      nome: z.string({ required_error: 'Nome do analista não informado.', invalid_type_error: 'Tipo não válido para o nome do analista.' }),
      apelido: z.string({ required_error: 'Apelido do analista não informado.', invalid_type_error: 'Tipo não válido para o apelido do analista.' }),
      avatar_url: z.string({ invalid_type_error: 'Tipo não válido para o avatar do analista.' }).optional().nullable(),
    })
    .optional()
    .nullable(),
  requerente: z.object({
    id: z.string({ invalid_type_error: 'Tipo não válido para o ID do requerente.' }),
    nome: z.string({ invalid_type_error: 'Tipo não válido para o nome do requerente.' }).optional().nullable(),
    apelido: z.string({
      required_error: 'Apelido do requerente não informado.',
      invalid_type_error: 'Tipo não válido para o apelido do requerente.',
    }),
    avatar_url: z.string({ invalid_type_error: 'Tipo não válido para o avatar do requerente.' }).optional().nullable(),
    contato: z.string({
      required_error: 'Contato do requerente não informado.',
      invalid_type_error: 'Tipo não válido para o contato do requerente.',
    }),
  }),
  oportunidade: z.object({
    id: z
      .string({
        required_error: 'ID de referência da oportunidade não informado.',
        invalid_type_error: 'Tipo não válido para o ID de referência da oportunidade.',
      })
      .optional()
      .nullable(),
    nome: z
      .string({
        required_error: 'Nome da oportunidade de referência não informado.',
        invalid_type_error: 'Tipo não válido para o nome da oportunidade de referência.',
      })
      .optional()
      .nullable(),
    identificador: z
      .string({
        required_error: 'Identificador da oportunidade de referência não informado.',
        invalid_type_error: 'Tipo não válido para o identificador da oportunidade de referência não informado.',
      })
      .optional()
      .nullable(),
  }),
  localizacao: z.object({
    cep: z.string({
      required_error: 'CEP da localização de análise não informada.',
      invalid_type_error: 'Tipo não válido para o CEP da localização de análise.',
    }),
    uf: z
      .string({
        required_error: 'UF da localização de análise não informada.',
        invalid_type_error: 'Tipo não válido para o UF da localização de análise.',
      })
      .optional()
      .nullable(),
    cidade: z
      .string({
        required_error: 'Cidade da localização de análise não informada.',
        invalid_type_error: 'Tipo não válido para o cidade da localização de análise.',
      })
      .optional()
      .nullable(),
    bairro: z.string({
      required_error: 'Bairro da localização de análise não informada.',
      invalid_type_error: 'Tipo não válido para o bairro da localização de análise.',
    }),
    endereco: z.string({
      required_error: 'Endereço da localização de análise não informada.',
      invalid_type_error: 'Tipo não válido para o endereço da localização de análise.',
    }),
    numeroOuIdentificador: z.string({
      required_error: 'Número ou identificador da localização de análise não informada.',
      invalid_type_error: 'Tipo não válido para o número ou identificador da localização de análise.',
    }),
  }),
  // equipamentos: z.object({
  //   modulos: z.object({
  //     modelo: z.string({ invalid_type_error: 'Tipo não válido para o modelo dos modulos.' }).optional().nullable(),
  //     qtde: z.string({ invalid_type_error: 'Tipo não válido para o quantidade de modulos.' }).optional().nullable(),
  //     potencia: z.string({ invalid_type_error: 'Tipo não válido para o potência dos modulos.' }).optional().nullable(),
  //   }),
  //   inversor: z.object({
  //     modelo: z.string({ invalid_type_error: 'Tipo não válido para o modelo dos inversores.' }).optional().nullable(),
  //     qtde: z.string({ invalid_type_error: 'Tipo não válido para o quantidade de inversores.' }).optional().nullable(),
  //     potencia: z.string({ invalid_type_error: 'Tipo não válido para o potência dos inversores.' }).optional().nullable(),
  //   }),
  // }),
  equipamentosAnteriores: z.array(EquipmentSchema),
  equipamentos: z.array(EquipmentSchema),
  padrao: z.array(
    z.object({
      alteracao: z.boolean({
        required_error: 'Necessidade de alteração do padrão não informada.',
        invalid_type_error: 'Tipo não válido para a necessidade de alteração do padrão.',
      }),
      tipo: z.union([z.literal('CONTRA À REDE'), z.literal('À FAVOR DA REDE')], {
        required_error: 'Tipo do padrão não informado.',
        invalid_type_error: 'Tipo não válido para o tipo do padrão.',
      }), //
      tipoEntrada: z.union([z.literal('AÉREO'), z.literal('SUBTERRÂNEO')], {
        required_error: 'Tipo da entrada do padrão não informado.',
        invalid_type_error: 'Tipo não válido para o tipo de entrada do padrão.',
      }), //
      tipoSaida: z.union([z.literal('AÉREO'), z.literal('SUBTERRÂNEO')], {
        required_error: 'Tipo da saída do padrão não informado.',
        invalid_type_error: 'Tipo não válido para o tipo de saída do padrão.',
      }), //
      amperagem: z.union([z.string(), z.number()], {
        required_error: 'Amperagem do padrão não informado.',
        invalid_type_error: 'Tipo não válido para a amperagem do padrão.',
      }), //
      ligacao: z.string({ required_error: 'Ligação do padrão não informada.', invalid_type_error: 'Tipo não válido para a ligação do padrão.' }), //
      novaAmperagem: z.union([z.string(), z.number()], { invalid_type_error: 'Tipo não válido para a nova amperagem do padrão.' }).optional().nullable(), // x
      novaLigacao: z.string({ invalid_type_error: 'Tipo não válido para a nova ligação do padrão.' }).optional().nullable(), // x
      codigoMedidor: z.string({
        required_error: 'Código do medidor não informado.',
        invalid_type_error: 'Tipo não válido para o código do medidor do padrão.',
      }),
      modeloCaixaMedidor: z.string({ invalid_type_error: 'Tipo não válido para o modelo da caixa do medidor.' }).optional().nullable(),
      codigoPosteDerivacao: z.string({ invalid_type_error: 'Tipo não válido para o código do poste de derivação.' }).optional().nullable(), // GO only
    })
  ),
  transformador: z.object({
    acopladoPadrao: z.boolean({
      required_error: 'Status de acoplação do padrão não informado.',
      invalid_type_error: 'Tipo não válido para o status de acoplação do padrão.',
    }),
    codigo: z.string({
      required_error: 'Código do transformador não informado.',
      invalid_type_error: 'Tipo não válido para o código do transformador.',
    }),
    potencia: z.number({
      required_error: 'Potência do transformador não informador.',
      invalid_type_error: 'Tipo não válido para a potência do transformador.',
    }),
  }),
  execucao: z.object({
    observacoes: z
      .string({ required_error: 'Observações de execução não informadas.', invalid_type_error: 'Tipo não válido para as observações da execução.' })
      .optional()
      .nullable(),
    memorial: z
      .array(
        z.object({
          topico: z.string({
            required_error: 'Tópico do memorial de execução não informado.',
            invalid_type_error: 'Tipo não válido para o tópico do memorial de execução não informado.',
          }), // avaliar telhado, adaptar qgbt, etc
          descricao: z.string({
            required_error: 'Descrição do memorial de execução não informado.',
            invalid_type_error: 'Tipo não válido para o descrição do memorial de execução não informado.',
          }),
        })
      )
      .optional()
      .nullable(),
    espacoQGBT: z.boolean({
      required_error: 'Status do espaço no QGBT não informado.',
      invalid_type_error: 'Tipo não válido para o status do espaço no QGBT.',
    }),
  }),
  descritivo: z.array(
    z.object({
      topico: z.string({ required_error: 'Tópico do descritivo não informado.', invalid_type_error: 'Tipo não válido para o tópico do descritivo.' }),
      descricao: z.string(),
    })
  ),
  servicosAdicionais: z.object({
    alambrado: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de alambrado.',
      })
      .optional()
      .nullable(),
    britagem: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de britagem.',
      })
      .optional()
      .nullable(),
    casaDeMaquinas: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de casa de máquinas.',
      })
      .optional()
      .nullable(),
    barracao: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de barracão.',
      })
      .optional()
      .nullable(),
    roteador: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de instação de roteador.',
      })
      .optional()
      .nullable(),
    limpezaLocal: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de limpeza do local.',
      })
      .optional()
      .nullable(),
    redeReligacao: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de rede de religação.',
      })
      .optional()
      .nullable(),
    terraplanagem: z
      .union([z.literal('NÃO'), z.literal('SIM - RESPONSABILIDADE DO CLIENTE'), z.literal('SIM - RESPONSABILIDADE DA EMPRESA')], {
        invalid_type_error: 'Tipo não válido para a especificação de execução de terraplagem.',
      })
      .optional()
      .nullable(),
    realimentar: z.boolean({
      required_error: 'Status da necessidade de realimentação não informada.',
      invalid_type_error: 'Tipo não válido para o status da necessidade de realimentação.',
    }),
  }),
  detalhes: z.object({
    concessionaria: z.string(),
    topologia: z
      .union([z.literal('MICRO-INVERSOR'), z.literal('INVERSOR')], { invalid_type_error: 'Tipo não válido para a topologia.' })
      .optional()
      .nullable(),
    materialEstrutura: z
      .union([z.literal('MADEIRA'), z.literal('FERRO')], { invalid_type_error: 'Tipo não válido para o material da estrutura.' })
      .optional()
      .nullable(),
    tipoEstrutura: z
      .string({
        invalid_type_error: 'Tipo não válido para o tipo de estrutura.',
      })
      .optional()
      .nullable(),
    tipoTelha: z
      .string({
        invalid_type_error: 'Tipo não válido para o tipo de telha.',
      })
      .optional()
      .nullable(),
    fixacaoInversores: z
      .string({
        invalid_type_error: 'Tipo não válido para a fixação dos inversores.',
      })
      .optional()
      .nullable(),
    imagensDrone: z.boolean({
      required_error: 'Status da existência de imagens de drone não informada.',
      invalid_type_error: 'Tipo não válido para o status da existência de imagens de drone.',
    }),
    imagensFachada: z.boolean({
      required_error: 'Status da existência de imagens da fachada não informada.',
      invalid_type_error: 'Tipo não válido para o status da existência de imagens da fachada.',
    }),
    imagensSatelite: z.boolean({
      required_error: 'Status da existência de imagens de satélite não informada.',
      invalid_type_error: 'Tipo não válido para o status da existência de imagens de satélite.',
    }),
    medicoes: z.boolean({
      required_error: 'Status da existência de imagens de medições não informada.',
      invalid_type_error: 'Tipo não válido para o status da existência de imagens de medições.',
    }),
    orientacao: z.string({
      required_error: 'Orientação do sistema não informada.',
      invalid_type_error: 'Tipo não válido para a orientação do sistema.',
    }),
    telhasReservas: z
      .union([z.literal('NÃO'), z.literal('SIM')], {
        required_error: 'Existência de telhas reservas não informada.',
        invalid_type_error: 'Tipo não válido para a existência de telhas reservas.',
      })
      .optional()
      .nullable(),
  }),
  distancias: z.object({
    conexaoInternet: z.string({
      required_error: 'Distância do sistema a um ponto de internet não informada.',
      invalid_type_error: 'Tipo não válido para a distância do sistema a um ponto de internet.',
    }),
    cabeamentoCA: z.string({
      required_error: 'Distância do cabeamento CA não informada.',
      invalid_type_error: 'Tipo não válido para distância do cabeamento CA.',
    }), // inversor ao padrão
    cabeamentoCC: z.string({
      required_error: 'Distância do cabeamento CC não informada.',
      invalid_type_error: 'Tipo não válido para distância do cabeamento CC.',
    }), // modulos ao inversor
  }),
  locais: z.object({
    aterramento: z
      .string({ required_error: 'Local de aterramento não informado.', invalid_type_error: 'Tipo não válido para o local de aterramento.' })
      .optional()
      .nullable(),
    inversor: z.string({
      required_error: 'Local de instalação do inversor não informado.',
      invalid_type_error: 'Tipo não válido para o local de instalação do inversor.',
    }), // instalação do inversor, varannda, garagem, etc
    modulos: z.string({
      required_error: 'Local de instalação dos módulos não informado.',
      invalid_type_error: 'Tipo não válido para o local de instalação dos módulos.',
    }), // instalação dos módulos, telhado, solo em x, solo em y, etc
  }),
  custos: z.array(
    z.object({
      categoria: z
        .union([z.literal('INSTALAÇÃO'), z.literal('PADRÃO'), z.literal('ESTRUTURA'), z.literal('OUTROS')], {
          invalid_type_error: 'Tipo não válido para a categoria de custo.',
        })
        .optional()
        .nullable(),
      descricao: z.string({ required_error: 'Descrição do custo não informada.', invalid_type_error: 'Tipo não válido para a descrição do custo.' }),
      qtde: z.number({
        required_error: 'Quantidade do item de custo não informada.',
        invalid_type_error: 'Tipo não válido para a quantidade do item de custo.',
      }),
      grandeza: z.string({ required_error: 'Grandeza do custo não informada.', invalid_type_error: 'Tipo não válido para a grandeza do custo.' }),
      custoUnitario: z.number({ invalid_type_error: 'Tipo não válido para o custo unitário do item de custo.' }).optional().nullable(),
      total: z.number({ invalid_type_error: 'Tipo não válido para o total do item de custo.' }).optional().nullable(),
      totalVendaSimples: z.number({ invalid_type_error: 'Tipo não válido para o total do item para venda simples.' }).optional().nullable(),
      totalVendaFaturavel: z.number({ invalid_type_error: 'Tipo não válido para o total do item para venda faturável.' }).optional().nullable(),
      })
  ),
  alocacaoModulos: z.object({
    leste: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para leste.' }).optional().nullable(),
    nordeste: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para nordeste.' }).optional().nullable(),
    noroeste: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para noroeste.' }).optional().nullable(),
    norte: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para norte.' }).optional().nullable(),
    oeste: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para oeste.' }).optional().nullable(),
    sudeste: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para sudeste.' }).optional().nullable(),
    sudoeste: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para sudoeste.' }).optional().nullable(),
    sul: z.number({ invalid_type_error: 'Tipo não válido para quantidade alocada de modelo para sul.' }).optional().nullable(),
  }),
  desenho: z.object({
    observacoes: z.string({
      required_error: 'Observações do desenho não informadas.',
      invalid_type_error: 'Tipo não válido para as observações do desenho.',
    }),
    tipo: z.string({ invalid_type_error: 'Tipo não válido para o tipo de desenho.' }).optional().nullable(), //
    url: z.string({ invalid_type_error: 'Tipo não válido para a URL do desenho.' }).optional().nullable(),
  }),
  suprimentos: z
    .object({
      observacoes: z.string({
        required_error: 'Observações de suprimentação não informadas.',
        invalid_type_error: 'Tipo não válido para observações de suprimentos.',
      }),
      itens: z.array(
        z.object({
          descricao: z.string({
            required_error: 'Descrição do item de suprimentação não informada.',
            invalid_type_error: 'Tipo não válido para a descrição do item de suprimentação.',
          }),
          tipo: z.string({
            required_error: 'Tipo do item de suprimentação não informada.',
            invalid_type_error: 'Tipo não válido para o tipo do item de suprimentação.',
          }),
          qtde: z.number({
            required_error: 'Quantidade do item de suprimentação não informada.',
            invalid_type_error: 'Tipo não válido para a quantidade do item de suprimentação.',
          }),
          grandeza: z.string({
            required_error: 'Grandeza do item de suprimentação não informada.',
            invalid_type_error: 'Tipo não válido para a grandeza do item de suprimentação.',
          }),
        })
      ),
    })
    .optional()
    .nullable(),
  conclusao: z.object({
    // UTILIZADO PELOS VENDEDORES
    observacoes: z.string({
      required_error: 'Observações da conclusão não informadas.',
      invalid_type_error: 'Tipo não válido para as observações da conclusão.',
    }),
    espaco: z.boolean({
      required_error: 'Status do espaço para execução do serviço não informado.',
      invalid_type_error: 'Tipo não válido para o status do espaço para execução do serviço.',
    }), // possui espaço pra execução
    inclinacao: z.boolean({
      required_error: 'Necessidade de estrutura de inclinação não informada.',
      invalid_type_error: 'Tipo não válido para necessidade de estrutura de inclinação.',
    }), // necessitará estrutura de inclinação
    sombreamento: z.boolean({
      required_error: 'Existência de sombra não informada.',
      invalid_type_error: 'Tipo não válido para existência de sombra.',
    }), // possui sombra
    padrao: z
      .union([z.literal('APTO'), z.literal('REFORMAR'), z.literal('TROCAR')], {
        invalid_type_error: 'Tipo não válido para conclusão da condição do padrão de energia.',
      })
      .optional()
      .nullable(),
    estrutura: z
      .union([z.literal('APTO'), z.literal('CONDENADO'), z.literal('REFORÇAR'), z.literal('AVALIAR NA EXECUÇÃO')], {
        invalid_type_error: 'Tipo não válido para a condição da estrutura de montagem.',
      })
      .optional()
      .nullable(),
  }),
  dataEfetivacao: z
    .string({ invalid_type_error: 'Tipo não válido para a data de efetivação da análise técnica.' })
    .datetime({ message: 'Formato inválido para a data de efetivação da análise.' })
    .optional()
    .nullable(),
  dataInsercao: z
    .string({
      required_error: 'Data de inserção da análise não informada.',
      invalid_type_error: 'Tipo não válido para a data de inserção da análise.',
    })
    .datetime(),
})
export type TTechnicalAnalysis = z.infer<typeof GeneralTechnicalAnalysisSchema>
export type TTechnicalAnalysisDTO = TTechnicalAnalysis & { _id: string }

export type TTechnicalAnalysisSimplified = Pick<
  TTechnicalAnalysis,
  'nome' | 'status' | 'tipoSolicitacao' | 'complexidade' | 'oportunidade' | 'requerente' | 'localizacao' | 'dataEfetivacao' | 'dataInsercao' | 'analista'
>
export type TTechnicalAnalysisDTOSimplified = TTechnicalAnalysisSimplified & { _id: string }

export const TechnicalAnalysisSimplifiedProjection = {
  nome: 1,
  status: 1,
  tipoSolicitacao: 1,
  complexidade: 1,
  oportunidade: 1,
  requerente: 1,
  localizacao: 1,
  analista: 1,
  dataEfetivacao: 1,
  dataInsercao: 1,
}

export const PersonalizedTechnicalAnalysisFiltersSchema = z.object({
  name: z.string({ required_error: 'Filtro de nome não informado.', invalid_type_error: 'Tipo não válido para filtro de nome.' }),
  status: z.array(z.string({ required_error: 'Status de filtro não informada.', invalid_type_error: 'Tipo não válido para status de filtro.' }), {
    required_error: 'Lista de status de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de status de filtro.',
  }),
  complexity: z
    .union([z.literal('SIMPLES'), z.literal('INTERMEDIÁRIO'), z.literal('COMPLEXO')], {
      required_error: 'Filtro de complexidade não informado.',
      invalid_type_error: 'Tipo não válido para filtro de complexidade.',
    })
    .optional()
    .nullable(),
  city: z.array(z.string({ required_error: 'Cidade de filtro não informada.', invalid_type_error: 'Tipo não válido para cidade de filtro.' }), {
    required_error: 'Lista de cidades de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de cidades de filtro.',
  }),
  state: z.array(z.string({ required_error: 'Estado de filtro não informada.', invalid_type_error: 'Tipo não válido para estado de filtro.' }), {
    required_error: 'Lista de estados de filtro não informada.',
    invalid_type_error: 'Tipo não válido para lista de estados de filtro.',
  }),
  type: z.array(
    z.string({ required_error: 'Filtro de tipo de solicitação não informado.', invalid_type_error: 'Tipo não válido para filtro de tipo de solicitação.' }),
    {
      required_error: 'Lista de filtro de tipos de solicitação não informada.',
      invalid_type_error: 'Tipo não válido para lista de filtro de tipos de solicitação.',
    }
  ),
  // concluded: z.boolean({ required_error: 'Filtro de somente concluídos não informado.', invalid_type_error: 'Filtro de somente concluídos não informado.' }),
  pending: z.boolean({ required_error: 'Filtro de somente pendentes não informado.', invalid_type_error: 'Filtro de somente pendentes não informado.' }),
})
export type TPersonalizedTechnicalAnalysisFilter = z.infer<typeof PersonalizedTechnicalAnalysisFiltersSchema>
export const PersonalizedTechnicalAnalysisQuerySchema = z.object({
  applicants: z.array(z.string({ required_error: 'Requerentes não informados ou inválidos.', invalid_type_error: 'Requerentes inválidos.' })).nullable(),
  partners: z.array(z.string({ required_error: 'Parceiros não informados ou inválidos.', invalid_type_error: 'Parceiros inválidos.' })).nullable(),
  analysts: z.array(z.string({ required_error: 'Analistas não informados ou inválidos.', invalid_type_error: 'Analistas inválidos.' })).nullable(),
  filters: PersonalizedTechnicalAnalysisFiltersSchema,
})

export type StructureTypesFromAnalysis = TTechnicalAnalysis['detalhes']['tipoEstrutura']
