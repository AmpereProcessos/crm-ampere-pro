import { ObjectId } from 'mongodb'
import z from 'zod'

const ResponsibleSchema = z.object({
  id: z.string({
    required_error: 'ID do responsável da ativade não informado.',
    invalid_type_error: 'Tipo não válido para id do responsável da ativade.',
  }),
  nome: z.string({
    required_error: 'Nome do responsável da ativade não informado.',
    invalid_type_error: 'Tipo não válido para nome do responsável da ativade.',
  }),
  avatar_url: z.string().optional().nullable(),
})
const GeneralActivitySchema = z.object({
  idParceiro: z.string(),
  titulo: z.string(), // resume of the activity
  descricao: z.string(), // description of what to be done
  responsaveis: z.array(ResponsibleSchema).min(1, 'Adicione ao menos um responsável à atividade.'),
  oportunidade: z.object({
    id: z.string().optional().nullable(),
    nome: z.string().optional().nullable(),
  }),
  projeto: z
    .object({
      id: z.string().optional().nullable(),
      nome: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  idHomologacao: z.string().optional().nullable(),
  idAnaliseTecnica: z.string().optional().nullable(),
  subatividades: z.array(
    z.object({
      titulo: z.string(),
      descricao: z.string(),
      dataVencimento: z.string().datetime().optional().nullable(),
      dataConclusao: z.string().datetime().optional().nullable(),
      responsavel: ResponsibleSchema.optional().nullable(),
      dataInsercao: z.string(),
    })
  ),
  dataVencimento: z.string().datetime().optional().nullable(),
  dataConclusao: z.string().datetime().optional().nullable(),
  dataInsercao: z.string().datetime(),
  autor: z.object({
    id: z.string(),
    nome: z.string(),
    avatar_url: z.string().optional().nullable(),
  }),
})

export const InsertActivitySchema = z.object({
  idParceiro: z.string({ required_error: 'Referência de parceiro não informada.', invalid_type_error: 'Tipo não válido para referência de parceiro.' }),
  titulo: z.string({ required_error: 'Título da atividade não informado.', invalid_type_error: 'Tipo não válido para o título da atividade.' }), // resume of the activity
  descricao: z.string({
    required_error: 'Descrição da atividade não informada.',
    invalid_type_error: 'Tipo não válido para a descrição da atividade.',
  }), // description of what to be done
  responsaveis: z.array(ResponsibleSchema).min(1, 'Adicione ao menos um responsável à atividade.'),
  oportunidade: z.object({
    id: z.string({ invalid_type_error: 'Tipo não válido para a referência de oportunidade.' }).optional().nullable(),
    nome: z.string({ invalid_type_error: 'Tipo não válido para o nome da oportunidade referência.' }).optional().nullable(),
  }),
  projeto: z
    .object({
      id: z.string({ invalid_type_error: 'Tipo não válido para a referência de oportunidade.' }).optional().nullable(),
      nome: z.string({ invalid_type_error: 'Tipo não válido para o nome da oportunidade referência.' }).optional().nullable(),
    })
    .optional()
    .nullable(),
  idHomologacao: z.string({ invalid_type_error: 'Tipo não válido para o ID de referência homologação.' }).optional().nullable(),
  idAnaliseTecnica: z.string({ invalid_type_error: 'Tipo não válido para o ID de referência de análise técnica.' }).optional().nullable(),
  subatividades: z.array(
    z.object({
      titulo: z.string({
        required_error: 'Título da subatividade não informado.',
        invalid_type_error: 'Tipo não válido para o título da subatividade.',
      }),
      descricao: z.string({
        required_error: 'Descrição da subatividade não informada.',
        invalid_type_error: 'Tipo não válido para a descrição da subatividade.',
      }),
      dataVencimento: z
        .string({ invalid_type_error: 'Tipo não válido para a data de vencimento da subatividade.' })
        .datetime({ message: 'Formato inválido para a data de vencimento da subatividade.' })
        .optional()
        .nullable(),
      dataConclusao: z
        .string({ invalid_type_error: 'Tipo não válido para a data de conclusão da subatividade.' })
        .datetime({ message: 'Formato inválido para a data de conclusão da subatividade.' })
        .optional()
        .nullable(),
      responsavel: ResponsibleSchema.optional().nullable(),
      dataInsercao: z
        .string({
          required_error: 'Data de inserção da subatividade não informada.',
          invalid_type_error: 'Tipo não válido para a data de inserção da subatividade.',
        })
        .datetime({ message: 'Formato inválido para a data de inserção da subatividade.' }),
    })
  ),
  dataVencimento: z
    .string({ invalid_type_error: 'Tipo não válido para a data de vencimento da atividade.' })
    .datetime({ message: 'Formato inválido para a data de vencimento da atividade.' })
    .optional()
    .nullable(),
  dataConclusao: z
    .string({ invalid_type_error: 'Tipo não válido para a data de conclusão da atividade.' })
    .datetime({ message: 'Formato inválido para a data de conclusão da atividade.' })
    .optional()
    .nullable(),
  dataInsercao: z
    .string({
      required_error: 'Data de inserção da atividade não informada.',
      invalid_type_error: 'Tipo não válido para a data de inserção da atividade.',
    })
    .datetime({ message: 'Formato inválido para a data de inserção da atividade.' }),
  autor: z.object({
    id: z.string({
      required_error: 'ID do criador da ativade não informado.',
      invalid_type_error: 'Tipo não válido para id do criador da ativade.',
    }),
    nome: z.string({
      required_error: 'Nome do criador da ativade não informado.',
      invalid_type_error: 'Tipo não válido para nome do criador da ativade.',
    }),
    avatar_url: z.string().optional().nullable(),
  }),
})

const ActivityEntitySchema = z.object({
  idParceiro: z.string(),
  _id: z.instanceof(ObjectId),
  titulo: z.string(), // resume of the activity
  descricao: z.string(), // description of what to be done
  responsaveis: z.array(ResponsibleSchema).min(1, 'Adicione ao menos um responsável à atividade.'),
  oportunidade: z.object({
    id: z.string().optional().nullable(),
    nome: z.string().optional().nullable(),
  }),
  projeto: z
    .object({
      id: z.string().optional().nullable(),
      nome: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  idHomologacao: z.string().optional().nullable(),
  idAnaliseTecnica: z.string().optional().nullable(),
  subatividades: z.array(
    z.object({
      titulo: z.string(),
      descricao: z.string(),
      dataVencimento: z.string().datetime().optional().nullable(),
      dataConclusao: z.string().datetime().optional().nullable(),
      responsavel: ResponsibleSchema.optional().nullable(),
      dataInsercao: z.string(),
    })
  ),
  dataVencimento: z.string().datetime().optional().nullable(),
  dataConclusao: z.string().datetime().optional().nullable(),
  dataInsercao: z.string().datetime(),
  autor: z.object({
    id: z.string(),
    nome: z.string(),
    avatar_url: z.string().optional().nullable(),
  }),
})

export type TActivity = z.infer<typeof GeneralActivitySchema>

export type TActivityEntity = z.infer<typeof ActivityEntitySchema>

export type TActivityDTO = TActivity & { _id: string }
