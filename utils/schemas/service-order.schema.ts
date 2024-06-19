import { z } from 'zod'
import { AuthorSchema } from './user.schema'

const ServiceOrderResponsible = z.object({
  id: z.string({
    required_error: 'ID do responsável da ativade não informado.',
    invalid_type_error: 'Tipo não válido para id do responsável da ativade.',
  }),
  nome: z.string({
    required_error: 'Nome do responsável da ativade não informado.',
    invalid_type_error: 'Tipo não válido para nome do responsável da ativade.',
  }),
  tipo: z
    .enum(['INTERNO', 'EXTERNO'], { required_error: 'Tipo do responsável não informado.', invalid_type_error: 'Tipo não válido para o tipo do responsável.' })
    .optional(),
  avatar_url: z.string({ invalid_type_error: 'Tipo não válido para a referência de avatar do responsável.' }).optional().nullable(),
})

const ServiceOrderProjectReference = z.object({
  id: z.string({ required_error: 'ID do projeto não informado.', invalid_type_error: 'Tipo não válido para o ID do projeto.' }).optional().nullable(),
  nome: z.string({ required_error: 'Nome do projeto não informado.', invalid_type_error: 'Tipo não válido para o nome do projeto.' }).optional().nullable(),
  tipo: z.string({ required_error: 'Tipo do projeto não informado.', invalid_type_error: 'Tipo não válido para o tipo do projeto.' }),
  indexador: z
    .number({ required_error: 'Indexador do projeto não informado.', invalid_type_error: 'Tipo não válido para o indexador do projeto.' })
    .optional()
    .nullable(),
  identificador: z
    .union([
      z.string({
        required_error: 'Identificador do projeto não informado.',
        invalid_type_error: 'Tipo não válido para o identificador do projeto.',
      }),
      z.number({
        required_error: 'Identificador do projeto não informado.',
        invalid_type_error: 'Tipo não válido para o identificador do projeto.',
      }),
    ])
    .optional()
    .nullable(),
})

const ServiceOrderMaterialItem = z.object({
  idMaterial: z
    .string({
      required_error: 'ID de referência do material não informado.',
      invalid_type_error: 'Tipo não válido para o ID de referência do material.',
    })
    .optional()
    .nullable(),
  categoria: z.union([z.literal('MÓDULO'), z.literal('INVERSOR'), z.literal('INSUMO'), z.literal('ESTRUTURA'), z.literal('PADRÃO'), z.literal('OUTROS')]),
  descricao: z.string({
    required_error: 'Descrição do item de compra não informado.',
    invalid_type_error: 'Tipo não válido para a descrição do item de compra.',
  }),
  unidade: z.string({
    required_error: 'Unidade do item de compra não fornecida.',
    invalid_type_error: 'Tipo não válido para a unidade do item de compra.',
  }),
  qtde: z.number({
    required_error: 'Quantidade do item de compra não fornecida.',
    invalid_type_error: 'Tipo não válido para a quantidade do item de compra.',
  }),
})

const GeneralServiceOrderSchema = z.object({
  categoria: z.enum(['MONTAGEM', 'MANUTANÇÃO CORRETIVA', 'MANUTENÇÃO PREVENTIVA', 'PADRÃO', 'ESTRUTURA', 'OUTROS']),
  favorecido: z.object({
    nome: z.string({ required_error: 'Nome do favorecido não foi informado.' }),
    contato: z.string({ required_error: 'Contato do favorecido não foi informado.' }),
  }),
  projeto: ServiceOrderProjectReference,
  descricao: z.string({ required_error: 'Descrição não foi informada.', invalid_type_error: 'Tipo não válido para a descrição da ordem de serviço.' }),
  localizacao: z.object({
    cep: z.string({ required_error: 'CEP não foi informado.', invalid_type_error: 'Tipo não válido para o CEP da localização.' }),
    uf: z.string({ required_error: 'UF não foi informada.', invalid_type_error: 'Tipo não válido para a UF da localização.' }),
    cidade: z.string({ required_error: 'Cidade não foi informada.', invalid_type_error: 'Tipo não válido para a cidade da localização.' }),
    bairro: z.string({ required_error: 'Bairro não foi informado.', invalid_type_error: 'Tipo não válido para o bairro da localização.' }),
    endereco: z.string({ required_error: 'Endereço não foi informado.', invalid_type_error: 'Tipo não válido para o endereço da localização.' }),
    numeroOuIdentificador: z.string({
      required_error: 'Número ou identificador não foi informado.',
      invalid_type_error: 'Tipo não válido para o número/identificador da localização.',
    }),
    latitude: z.string({ invalid_type_error: 'Tipo não válido para a longitude da localização' }).optional().nullable(),
    longitude: z.string({ invalid_type_error: 'Tipo não válido para a latitude da localização' }).optional().nullable(),
  }),
  responsaveis: z.array(ServiceOrderResponsible).min(1, 'Adicione ao menos um responsável à atividade.'),
  urgencia: z.enum(['POUCO URGENTE', 'URGENTE', 'EMERGÊNCIA']).optional(),
  periodo: z.object({
    inicio: z.string().nullable(),
    fim: z.string().nullable(),
  }),
  autor: AuthorSchema,
  materiais: z.object({
    dataLiberacao: z.string({ invalid_type_error: 'Tipo não válido para data de liberação para separação dos materiais.' }).optional().nullable(),
    disponiveis: z.array(ServiceOrderMaterialItem),
    retiraveis: z.array(ServiceOrderMaterialItem),
  }),
  detalhes: z.object({
    pontoAgua: z.string({ required_error: 'Ponto de água não foi informado.' }),
    senhaWifi: z.string({ required_error: 'Senha do Wi-Fi não foi informada.' }),
    configuracaoMonitoramento: z.boolean({ required_error: 'Configuração de monitoramento não foi informada.' }),
    possuiTrafo: z.boolean({ required_error: 'Informação sobre transformador não foi informada.' }),
    tipoEstrutura: z.string({ required_error: 'Tipo de estrutura não foi informado.' }),
    tipoTelha: z.string({ invalid_type_error: 'Tipo não válido para tipo de telha.' }).optional(),
    tipoPadrao: z.string({ invalid_type_error: 'Tipo não válido para tipo de padrão.' }).optional(),
    tipoSaidaPadrao: z.string({ invalid_type_error: 'Tipo não válido para tipo de saída padrão.' }).optional(),
    amperagemPadrao: z.string({ invalid_type_error: 'Tipo não válido para amperagem do padrão.' }).optional(),
    responsabilidadePadrao: z.string({ invalid_type_error: 'Tipo não válido para responsabilidade do padrão.' }).optional(),
    topologia: z.string({ required_error: 'Topologia não foi informada.' }),
  }),
  anotacoes: z.string({ required_error: 'Anotações não foram informadas.', invalid_type_error: 'Tipo não válido para anotações da ordem de serviço.' }),
  observacoes: z.array(
    z.string({ required_error: 'Observações não foram informadas.', invalid_type_error: 'Tipo inválido para item de observação da ordem de serviço.' }),
    { required_error: 'Lista de itens de observação não informada.', invalid_type_error: 'Tipo não válido para lista de itens de observação.' }
  ),
  dataEfetivacao: z.string({ invalid_type_error: 'Tipo não válido para data de efetivação.' }).optional(),
  dataInsercao: z.string({ required_error: 'Data de inserção não foi informada.', invalid_type_error: 'Tipo não válido para data de inserção.' }),
})

export const InsertServiceOrderSchema = z.object({
  _id: z.string().optional(),
  categoria: z.enum(['MONTAGEM', 'MANUTANÇÃO CORRETIVA', 'MANUTENÇÃO PREVENTIVA', 'PADRÃO', 'ESTRUTURA', 'OUTROS']),
  favorecido: z.object({
    nome: z.string({ required_error: 'Nome do favorecido não foi informado.' }),
    contato: z.string({ required_error: 'Contato do favorecido não foi informado.' }),
  }),
  projeto: ServiceOrderProjectReference,
  descricao: z.string({ required_error: 'Descrição não foi informada.', invalid_type_error: 'Tipo não válido para a descrição da ordem de serviço.' }),
  localizacao: z.object({
    cep: z.string({ required_error: 'CEP não foi informado.', invalid_type_error: 'Tipo não válido para o CEP da localização.' }),
    uf: z.string({ required_error: 'UF não foi informada.', invalid_type_error: 'Tipo não válido para a UF da localização.' }),
    cidade: z.string({ required_error: 'Cidade não foi informada.', invalid_type_error: 'Tipo não válido para a cidade da localização.' }),
    bairro: z.string({ required_error: 'Bairro não foi informado.', invalid_type_error: 'Tipo não válido para o bairro da localização.' }),
    endereco: z.string({ required_error: 'Endereço não foi informado.', invalid_type_error: 'Tipo não válido para o endereço da localização.' }),
    numeroOuIdentificador: z.string({
      required_error: 'Número ou identificador não foi informado.',
      invalid_type_error: 'Tipo não válido para o número/identificador da localização.',
    }),
    latitude: z.string({ invalid_type_error: 'Tipo não válido para a longitude da localização' }).optional().nullable(),
    longitude: z.string({ invalid_type_error: 'Tipo não válido para a latitude da localização' }).optional().nullable(),
  }),
  responsaveis: z.array(ServiceOrderResponsible).min(1, 'Adicione ao menos um responsável à atividade.'),
  urgencia: z.enum(['POUCO URGENTE', 'URGENTE', 'EMERGÊNCIA']).optional(),
  periodo: z.object({
    inicio: z.string().nullable(),
    fim: z.string().nullable(),
  }),
  autor: AuthorSchema,
  materiais: z.object({
    dataLiberacao: z.string({ invalid_type_error: 'Tipo não válido para data de liberação para separação dos materiais.' }).optional().nullable(),
    disponiveis: z.array(ServiceOrderMaterialItem),
    retiraveis: z.array(ServiceOrderMaterialItem),
  }),
  detalhes: z.object({
    pontoAgua: z.string({ required_error: 'Ponto de água não foi informado.' }),
    senhaWifi: z.string({ required_error: 'Senha do Wi-Fi não foi informada.' }),
    configuracaoMonitoramento: z.boolean({ required_error: 'Configuração de monitoramento não foi informada.' }),
    possuiTrafo: z.boolean({ required_error: 'Informação sobre transformador não foi informada.' }),
    tipoEstrutura: z.string({ required_error: 'Tipo de estrutura não foi informado.' }),
    tipoTelha: z.string({ invalid_type_error: 'Tipo não válido para tipo de telha.' }).optional(),
    tipoPadrao: z.string({ invalid_type_error: 'Tipo não válido para tipo de padrão.' }).optional(),
    tipoSaidaPadrao: z.string({ invalid_type_error: 'Tipo não válido para tipo de saída padrão.' }).optional(),
    amperagemPadrao: z.string({ invalid_type_error: 'Tipo não válido para amperagem do padrão.' }).optional(),
    responsabilidadePadrao: z.string({ invalid_type_error: 'Tipo não válido para responsabilidade do padrão.' }).optional(),
    topologia: z.string({ required_error: 'Topologia não foi informada.' }),
  }),
  anotacoes: z.string({ required_error: 'Anotações não foram informadas.', invalid_type_error: 'Tipo não válido para anotações da ordem de serviço.' }),
  observacoes: z.array(
    z.string({ required_error: 'Observações não foram informadas.', invalid_type_error: 'Tipo inválido para item de observação da ordem de serviço.' }),
    { required_error: 'Lista de itens de observação não informada.', invalid_type_error: 'Tipo não válido para lista de itens de observação.' }
  ),
  dataEfetivacao: z.string({ invalid_type_error: 'Tipo não válido para data de efetivação.' }).optional(),
  dataInsercao: z.string({ required_error: 'Data de inserção não foi informada.', invalid_type_error: 'Tipo não válido para data de inserção.' }),
})

export type TServiceOrder = z.infer<typeof GeneralServiceOrderSchema>
export type TServiceOrderDTO = TServiceOrder & { _id: string }
