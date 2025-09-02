import { ObjectId } from 'mongodb';
import z from 'zod';

export const UpgrateLeadInputSchema = z.object({
  leadId: z
    .string({
      required_error: 'ID do lead não informado.',
      invalid_type_error: 'Tipo não válido para o ID do lead.',
    })
    .refine((id) => ObjectId.isValid(id), {
      message: 'O ID do lead não é válido.',
    }),
  atribuidoId: z
    .string({
      required_error: 'ID do usuário atribuído não informado.',
      invalid_type_error: 'Tipo não válido para o ID do usuário atribuído.',
    })
    .refine((id) => ObjectId.isValid(id), {
      message: 'O ID do usuário atribuído não é válido.',
    }),
  tipoProjetoId: z
    .string({
      required_error: 'ID do tipo de projeto não informado.',
      invalid_type_error: 'Tipo não válido para o ID do tipo de projeto.',
    })
    .refine((id) => ObjectId.isValid(id), {
      message: 'O ID do tipo de projeto não é válido.',
    }),
  funilId: z
    .string({
      required_error: 'ID do funil não informado.',
      invalid_type_error: 'Tipo não válido para o ID do funil.',
    })
    .refine((id) => ObjectId.isValid(id), {
      message: 'O ID do funil não é válido.',
    }),
  estagioFunilId: z.string({
    required_error: 'ID do estágio do funil não informado.',
    invalid_type_error: 'Tipo não válido para o ID do estágio do funil.',
  }),
  anotacoes: z.array(
    z.string({
      required_error: 'Anotação não informada.',
      invalid_type_error: 'Tipo não válido para a anotação.',
    })
  ),
});
