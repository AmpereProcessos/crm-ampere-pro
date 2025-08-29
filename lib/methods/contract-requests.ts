import type { TContractRequest } from '@/utils/schemas//contract-request.schema';

export type TContractRequestTypes =
  | 'SISTEMA FOTOVOLTAICO'
  | 'OPERAÇÃO E MANUTENÇÃO'
  | 'HOMOLOGAÇÃO'
  | 'SEGURO DE SISTEMA FOTOVOLTAICO'
  | 'CONSÓRCIO DE ENERGIA'
  | 'MONITORAMENTO';
type GetContractDocumentationProps = {
  type: TContractRequestTypes;
  data: {
    'TIPO DA INSTALAÇÃO': TContractRequest['tipoDaInstalacao'];
    'TIPO DA LIGAÇÃO DA INSTALAÇÃO': TContractRequest['tipoDaLigacao'];
    'TIPO DO TITULAR DA INSTALAÇÃO': TContractRequest['tipoDoTitular'];
    'ORIGEM DOS RECURSOS': TContractRequest['origemRecurso'];
    'TITULAR DO CONTRATO = TITULAR DA INSTALAÇÃO': boolean;
    DISTRIBUIÇÕES: TContractRequest['distribuicoes'];
  };
};
export function getContractDocumentation({ type, data }: GetContractDocumentationProps): { [key: string]: boolean } {
  const distributionMap = data.DISTRIBUIÇÕES.reduce((acc: { [key: string]: boolean }, curr) => {
    acc[`RECEBEDORA Nº ${curr.numInstalacao}`] = true;
    return acc;
  }, {});
  if (type === 'SISTEMA FOTOVOLTAICO') {
    const requiredDocumentsMap = {
      'PROPOSTA COMERCIAL': true,
      'COMPROVANTE DE ENDEREÇO (DA CORRESPONDÊNCIA)': true,
      'LAUDO TÉCNICO': true,
      'CONTA DE ENERGIA': data['TIPO DA LIGAÇÃO DA INSTALAÇÃO'] === 'EXISTENTE',
      CAR: data['TIPO DA INSTALAÇÃO'] === 'RURAL',
      MATRICULA: data['TIPO DA INSTALAÇÃO'] === 'RURAL',
      IPTU: data['TIPO DA INSTALAÇÃO'] === 'URBANO',
      'DOCUMENTO COM FOTO': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA FISICA',
      'DOCUMENTO COM FOTO (TITULAR DO FINANCIAMENTO)': data['ORIGEM DOS RECURSOS'] === 'FINANCIAMENTO',
      'DOCUMENTO COM FOTO (TITULAR DA INSTALAÇÃO)': data['TITULAR DO CONTRATO = TITULAR DA INSTALAÇÃO'],
      'CONTRATO SOCIAL': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'CARTÃO CNPJ': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'COMPROVANTE DE ENDEREÇO (REPRESENTANTE LEGAL)': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'DOCUMENTO COM FOTOS DOS SÓCIOS': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      ...distributionMap,
    };
    return requiredDocumentsMap;
  }
  if (type === 'OPERAÇÃO E MANUTENÇÃO') {
    const requiredDocumentsMap = {
      'PROPOSTA COMERCIAL': true,
      'COMPROVANTE DE ENDEREÇO (DA CORRESPONDÊNCIA)': true,
      'LAUDO TÉCNICO': false,
      'CONTA DE ENERGIA': false,
      CAR: false,
      MATRICULA: false,
      IPTU: false,
      'DOCUMENTO COM FOTO': true,
      'DOCUMENTO COM FOTO (TITULAR DA INSTALAÇÃO)': data['TITULAR DO CONTRATO = TITULAR DA INSTALAÇÃO'],
      'CONTRATO SOCIAL': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'CARTÃO CNPJ': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'COMPROVANTE DE ENDEREÇO (REPRESENTANTE LEGAL)': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'DOCUMENTO COM FOTOS DOS SÓCIOS': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      ...distributionMap,
    };
    return requiredDocumentsMap;
  }
  if (type === 'MONITORAMENTO') {
    const requiredDocumentsMap = {
      'PROPOSTA COMERCIAL': true,
      'COMPROVANTE DE ENDEREÇO': true,
      'DOCUMENTO COM FOTO': true,
      ...distributionMap,
    };
    return requiredDocumentsMap;
  }
  if (type === 'HOMOLOGAÇÃO') {
    const requiredDocumentsMap = {
      'PROPOSTA COMERCIAL': true,
      'CONTA DE ENERGIA': true,
      'LAUDO TÉCNICO': true,
      CAR: data['TIPO DA INSTALAÇÃO'] === 'RURAL',
      MATRICULA: data['TIPO DA INSTALAÇÃO'] === 'RURAL',
      IPTU: data['TIPO DA INSTALAÇÃO'] === 'URBANO',
      'DOCUMENTO COM FOTO': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA FISICA',
      'CONTRATO SOCIAL': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      'CARTÃO CNPJ': data['TIPO DO TITULAR DA INSTALAÇÃO'] === 'PESSOA JURIDICA',
      ...distributionMap,
    };
    return requiredDocumentsMap;
  }
  if (type === 'CONSÓRCIO DE ENERGIA') {
    const requiredDocumentsMap = {
      'PROPOSTA COMERCIAL': true,
      'CONTA DE ENERGIA': true,
      'DOCUMENTO COM FOTO': true,
      ...distributionMap,
    };
    return requiredDocumentsMap;
  }
  if (type === 'SEGURO DE SISTEMA FOTOVOLTAICO') {
    const requiredDocumentsMap = {
      'PROPOSTA COMERCIAL': true,
      'COMPROVANTE DE ENDEREÇO': true,
      'DOCUMENTO COM FOTO': true,
      'NOTA FISCAL DOS EQUIPAMENTOS': true,
      'COMPROVANTE DO SEGURO': true,
      'ÁPOLICE DO SEGURO': true,
      BOLETO: true,
      ...distributionMap,
    };
    return requiredDocumentsMap;
  }

  return {};
}
