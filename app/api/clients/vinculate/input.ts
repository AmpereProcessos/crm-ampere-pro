import z from 'zod';

export const GetVinculationClientInputSchema = z.object({
  phone: z.string({
    required_error: 'Telefone do cliente não informado.',
    invalid_type_error: 'Tipo não válido para o telefone do cliente.',
  }),
  cpfCnpj: z.string({
    required_error: 'CPF/CNPJ do cliente não informado.',
    invalid_type_error: 'Tipo não válido para o CPF/CNPJ do cliente.',
  }),
});
