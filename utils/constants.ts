import { BsFiletypeCsv, BsFiletypeDocx, BsFiletypePdf, BsFiletypeXlsx, BsFiletypeXml, BsFillPlayBtnFill, BsImage, BsPeopleFill } from 'react-icons/bs'
import { FiPhoneCall } from 'react-icons/fi'
import { TbReportSearch } from 'react-icons/tb'
import { IconType } from 'react-icons/lib'
import { TSaleCategory } from './schemas/opportunity.schema'
import { TProposalPremisses } from './schemas/proposal.schema'
import { easeBackInOut } from 'd3-ease'
import { TProductItem, TServiceItem } from './schemas/kits.schema'

export type TProjectTypes = {
  id: number
  label: string
  value: string
  saleCategory: TSaleCategory
  sizing: { title: string; fields: (keyof TProposalPremisses)[] }[]
}

export const ProjectTypes: TProjectTypes[] = [
  {
    id: 1,
    label: 'SISTEMA FOTOVOLTAICO',
    value: 'SISTEMA FOTOVOLTAICO',
    saleCategory: 'KIT',
    sizing: [
      { title: 'DADOS GERAIS', fields: ['consumoEnergiaMensal', 'fatorSimultaneidade'] },
      { title: 'TARIFAS', fields: ['tarifaEnergia', 'tarifaFioB'] },
      { title: 'ESPECIFICIDADES DA INSTALAÇÃO', fields: ['tipoEstrutura', 'orientacao', 'distancia'] },
    ],
  },
  {
    id: 2,
    label: 'OPERAÇÃO E MANUTENÇÃO',
    value: 'OPERAÇÃO E MANUTENÇÃO',
    saleCategory: 'PLANO',
    sizing: [
      { title: 'DADOS GERAIS', fields: ['consumoEnergiaMensal', 'fatorSimultaneidade'] },
      { title: 'TARIFAS', fields: ['tarifaEnergia', 'tarifaFioB'] },
      { title: 'EQUIPAMENTOS', fields: ['topologia', 'potenciaPico', 'numModulos', 'numInversores'] },
      { title: 'ESPECIFICIDADES DA INSTALAÇÃO', fields: ['tipoEstrutura', 'orientacao', 'distancia'] },
    ],
  },
  {
    id: 3,
    label: 'PRODUTOS AVULSOS',
    value: 'PRODUTOS AVULSOS',
    saleCategory: 'PRODUTOS',
    sizing: [
      { title: 'DADOS GERAIS', fields: ['consumoEnergiaMensal', 'fatorSimultaneidade'] },
      { title: 'EQUIPAMENTOS', fields: ['topologia'] },
      { title: 'ESPECIFICIDADES DA INSTALAÇÃO', fields: ['tipoEstrutura', 'orientacao', 'distancia'] },
    ],
  },
  {
    id: 4,
    label: 'SERVIÇOS',
    value: 'SERVIÇOS',
    saleCategory: 'PRODUTOS',
    sizing: [
      { title: 'DADOS GERAIS', fields: ['consumoEnergiaMensal', 'fatorSimultaneidade'] },
      { title: 'EQUIPAMENTOS', fields: ['topologia', 'potenciaPico', 'numInversores', 'numModulos'] },
      { title: 'ESPECIFICIDADES DA INSTALAÇÃO', fields: ['tipoEstrutura', 'orientacao', 'distancia'] },
    ],
  },
]

type TCommonServicesByProjectType = {
  id: string
  nome: string
  servicos: TServiceItem[]
  cores: { texto: string; fundo: string }
}
export const CommonServicesByProjectType: TCommonServicesByProjectType[] = [
  {
    id: '6615785ddcb7a6e66ede9785',
    nome: 'SISTEMA FOTOVOLTAICO',
    servicos: [
      {
        descricao: 'HOMOLOGAÇÃO COMPLETA',
        observacoes: 'Homologação junto a concessionária de energia, com projeto, vistoria e afins.',
        garantia: 999,
      },
      {
        descricao: 'INSTALAÇÃO',
        observacoes: 'Instalação/montagem dos equipamentos.',
        garantia: 1,
      },
      {
        descricao: 'COMISSIONAMENTO',
        observacoes: 'Comissionamento do sistema, com ativação e testes de performance e configuração do software de acompanhamento.',
        garantia: 1,
      },
    ],
    cores: { texto: '#fead41', fundo: '#15599a' },
  },
]
type TCommonProductsByProjectType = {
  id: string
  nome: string
  produtos: TProductItem[]
  cores: { texto: string; fundo: string }
}
export const CommonProductsByProjectType: TCommonProductsByProjectType[] = [
  {
    id: '6615785ddcb7a6e66ede9785',
    nome: 'SISTEMA FOTOVOLTAICO',
    produtos: [
      { categoria: 'ESTRUTURA', fabricante: 'N/A', modelo: 'ESTRUTURA DE FIXAÇÃO', qtde: 1, garantia: 20 },
      { categoria: 'INSUMO', fabricante: 'N/A', modelo: 'INFRAESTRUTURA ELÉTRICA CC & CA', qtde: 1, garantia: 1 },
      { categoria: 'INSUMO', fabricante: 'N/A', modelo: 'DISPOSITIVOS DE PROTEÇÃO CC & CA', qtde: 1, garantia: 1 },
    ],
    cores: { texto: '#fead41', fundo: '#15599a' },
  },
]
export const OeMIDs = ['661d828de3446bbfeff1bcf4', '660efd7cb535065ae08d459f', '660ff9f61285da49d6dc201e']
export const GeneralVisibleHiddenExitMotionVariants = {
  hidden: {
    opacity: 0.2,
    scale: 0.95, // Scale down slightly
    transition: {
      duration: 0.5,
      ease: easeBackInOut, // Use an easing function
    },
  },
  visible: {
    opacity: 1,
    scale: 1, // Scale down slightly
    transition: {
      duration: 0.5,
      ease: easeBackInOut, // Use an easing function
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05, // Scale down slightly

    transition: {
      duration: 0.01,
      ease: easeBackInOut, // Use an easing function
    },
  },
}
export const OeMPlansEquivalents = {
  'MANUTENÇÃO SIMPLES': 'MANUTENÇÃO SIMPLES',
  'PLANO SOL': 'PLANO SOL',
  'PLANO SOL PLUS': 'PLANO SOL +',
}

export const brazilianStates = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const

export const TechAnalysisSolicitationTypes = [
  'VISITA TÉCNICA REMOTA - URBANA',
  'VISITA TÉCNICA REMOTA - RURAL',
  'VISITA TÉCNICA IN LOCO - URBANA',
  'VISITA TÉCNICA IN LOCO - RURAL',
  'ALTERAÇÃO DE PROJETO',
  'AUMENTO DE SISTEMA AMPÈRE',
  'DESENHO PERSONALIZADO',
  'ORÇAMENTAÇÃO',
] as const
type FileTypes = {
  [contentType: string]: {
    title: string
    extension: string
    icon: IconType
  }
}
export const fileTypes: FileTypes = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    title: 'WORD',
    extension: '.docx',
    icon: BsFiletypeDocx,
  },
  'image/png': {
    title: 'IMAGEM (.PNG)',
    extension: '.png',
    icon: BsImage,
  },
  'image/jpeg': {
    title: 'IMAGEM(.JPEG)',
    extension: '.jpeg',
    icon: BsImage,
  },
  'image/tiff': {
    title: 'IMAGEM(.TIFF)',
    extension: '.tiff',
    icon: BsImage,
  },
  'application/pdf': {
    title: 'PDF',
    extension: '.pdf',
    icon: BsFiletypePdf,
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    title: 'EXCEL',
    extension: '.xlsx',
    icon: BsFiletypeXlsx,
  },
  'text/xml': {
    title: 'XML',
    extension: '.xml',
    icon: BsFiletypeXml,
  },
  'video/mp4': {
    title: 'MP4',
    extension: '.mp4',
    icon: BsFillPlayBtnFill,
  },
  'application/vnd.sealed.tiff': {
    title: 'IMAGEM(.TIFF)',
    extension: '.tiff',
    icon: BsImage,
  },
  'image/vnd.sealedmedia.softseal.jpg': {
    title: 'IMAGEM(.JPG)',
    extension: '.jpg',
    icon: BsImage,
  },
  'text/csv': {
    title: 'CSV(.CSV)',
    extension: '.csv',
    icon: BsFiletypeCsv,
  },
}

export const customersAcquisitionChannels = [
  { id: 1, label: 'NETWORKING', value: 'NETWORKING' },
  { id: 2, label: '(OUTBOUND) SDR', value: '(OUTBOUND) SDR' },
  { id: 3, label: 'INDICAÇÃO', value: 'INDICAÇÃO' },
  { id: 4, label: 'SITE', value: 'SITE' },
  { id: 5, label: 'CALCULADORA SOLAR', value: 'CALCULADORA SOLAR' },
  { id: 6, label: 'GOOGLE ADS', value: 'GOOGLE ADS' },
  { id: 7, label: 'FACEBOOK ADS', value: 'FACEBOOK ADS' },
  { id: 8, label: 'INSTAGRAM ADS', value: 'INSTAGRAM ADS' },
  { id: 9, label: 'BLOG', value: 'BLOG' },
  { id: 10, label: 'YOUTUBE', value: 'YOUTUBE' },
  { id: 11, label: 'RÁDIO', value: 'RÁDIO' },
  { id: 12, label: 'EVENTO', value: 'EVENTO' },
  { id: 13, label: 'PASSIVO', value: 'PASSIVO' },
  { id: 14, label: 'PORTA A PORTA', value: 'PORTA A PORTA' },
  { id: 15, label: 'PROSPECÇÃO ATIVA', value: 'PROSPECÇÃO ATIVA' },
] as const

export const structureTypes = [
  { label: 'Carport', value: 'Carport' },
  { label: 'Cerâmico', value: 'Cerâmico' },
  { label: 'Fibrocimento', value: 'Fibrocimento' },
  { label: 'Laje', value: 'Laje' },
  { label: 'Metálico', value: 'Metálico' },
  { label: 'Zipado', value: 'Zipado' },
  { label: 'Solo', value: 'Solo' },
  { label: 'Sem estrutura', value: 'Sem estrutura' },
] as const

export const orientations = ['LESTE', 'NORDESTE', 'NORTE', 'NOROESTE', 'OESTE', 'SUDOESTE', 'SUL', 'SUDESTE'] as const

export const leadLoseJustification = {
  'DEMORA NO ATENDIMENTO': {},
  'ACHOU O PREÇO ALTO': {},
  'NÃO GOSTOU DO PORTIFÓLIO (PRODUTOS/SERVIÇOS)': {},
  'COMPROU COM OUTRA EMPRESA': {},
  'NÃO QUER O PRODUTO/SERVIÇO': {},
} as const
export const projectActivityTypes = {
  LIGAÇÃO: {
    label: 'LIGAÇÃO',
    value: 'LIGAÇÃO',
    icon: FiPhoneCall as React.ComponentType,
  },
  REUNIÃO: {
    label: 'REUNIÃO',
    value: 'REUNIÃO',
    icon: BsPeopleFill as React.ComponentType,
  },
  'ANÁLISE TÉCNICA': {
    label: 'ANÁLISE TÉCNICA',
    value: 'ANÁLISE TÉCNICA',
    icon: TbReportSearch as React.ComponentType,
  },
}

export const STANDARD_PROFIT_MARGIN = 0.12
export const STANDARD_TAX = 0.175

export const firebaseServiceAccount = {
  type: 'service_account',
  project_id: 'sistemaampere',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: 'googleapis.com',
}
