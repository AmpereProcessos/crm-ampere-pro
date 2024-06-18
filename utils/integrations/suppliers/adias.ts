import { z } from 'zod'

export const ADiasEquipmentExtractionSchema = z.object({
  //   CATEGORIA: z.union([
  //     z.string({ required_error: 'CATEGORIA não informada.', invalid_type_error: 'Tipo não válido para CATEGORIA.' }),
  //     z.enum(['MÓDULOS', 'INVERSORES', 'STRINGBOX', 'ESTRUTURA', 'CABO', 'CONECTOR', 'ACESSÓRIOS MICRO ENPHASE', 'BATERIA'], {
  //       required_error: 'CATEGORIA não informada.',
  //       invalid_type_error: 'Tipo não válido para CATEGORIA.',
  //     }),
  //   ]),
  CATEGORIA: z.enum(['MÓDULOS', 'INVERSORES', 'STRINGBOX', 'ESTRUTURA', 'CABO', 'CONECTOR', 'ACESSÓRIOS MICRO ENPHASE', 'BATERIA'], {
    required_error: 'CATEGORIA não informada.',
    invalid_type_error: 'Tipo não válido para CATEGORIA.',
  }),
  DESCRIÇÃO: z.string({ required_error: 'DESCRIÇÃO não fornecida.', invalid_type_error: 'Tipo não válido para DESCRIÇÃO.' }),
  PREÇO: z.union([z.string(), z.number()], { required_error: 'PREÇO não informado.', invalid_type_error: 'Tipo não válido para PREÇO.' }),
})
export type TAdiasExtractedEquipment = z.infer<typeof ADiasEquipmentExtractionSchema>

export function getADiasModuleInfo(item: TAdiasExtractedEquipment) {
  const module = item.DESCRIÇÃO
  const powerRegex = /(\d+)W/
  const powerMatch = module.match(powerRegex)
  let power = powerMatch ? Number(powerMatch[1]) : 0

  let manufacturer = module.slice(0, powerMatch?.index).trim()
  const modFotovPrefix = 'MOD. FOTOV.'
  if (manufacturer.startsWith(modFotovPrefix)) {
    manufacturer = manufacturer.slice(modFotovPrefix.length).trim()
  }

  return { manufacturer, power }
}
