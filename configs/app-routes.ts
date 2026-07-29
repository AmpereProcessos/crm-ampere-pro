export type TAppRouteMetadata = {
  title: string;
  description: string;
  pattern: RegExp;
};

const APP_ROUTES: TAppRouteMetadata[] = [
  {
    pattern: /^\/$/,
    title: 'Dashboard',
    description: 'Visão geral dos indicadores comerciais e operacionais.',
  },
  {
    pattern: /^\/clientes\/relatorio$/,
    title: 'Relatório de clientes',
    description: 'Analise a distribuição, a qualidade e a evolução da sua base de clientes.',
  },
  {
    pattern: /^\/clientes$/,
    title: 'Banco de clientes',
    description: 'Consulte e gerencie os clientes da operação comercial.',
  },
  {
    pattern: /^\/comercial\/gestao\/resultados$/,
    title: 'Acompanhamento de resultados',
    description: 'Acompanhe metas e resultados da equipe comercial por período.',
  },
  {
    pattern: /^\/comercial\/leads$/,
    title: 'Leads',
    description: 'Qualifique e acompanhe novos contatos antes da conversão em oportunidade.',
  },
  {
    pattern: /^\/comercial\/oportunidades\/comissoes$/,
    title: 'Comissões',
    description: 'Consulte os resultados comissionáveis da equipe comercial.',
  },
  {
    pattern: /^\/comercial\/oportunidades\/id\/[^/]+$/,
    title: 'Oportunidade',
    description: 'Acompanhe o histórico, os responsáveis e a evolução desta oportunidade.',
  },
  {
    pattern: /^\/comercial\/oportunidades\/proposta\/[^/]+$/,
    title: 'Nova proposta',
    description: 'Monte e revise a proposta comercial vinculada à oportunidade.',
  },
  {
    pattern: /^\/comercial\/oportunidades$/,
    title: 'Oportunidades',
    description: 'Gerencie o funil e acompanhe as oportunidades em andamento.',
  },
  {
    pattern: /^\/comercial\/proposta\/[^/]+$/,
    title: 'Proposta',
    description: 'Revise as condições, os itens e o status desta proposta comercial.',
  },
  {
    pattern: /^\/configuracoes$/,
    title: 'Configurações',
    description: 'Gerencie seu perfil, a empresa e as preferências do CRM.',
  },
  {
    pattern: /^\/kits$/,
    title: 'Banco de kits',
    description: 'Consulte e gerencie as composições de kits comerciais.',
  },
  {
    pattern: /^\/operacional\/analises-tecnicas$/,
    title: 'Análises técnicas',
    description: 'Acompanhe solicitações, responsáveis e laudos técnicos.',
  },
  {
    pattern: /^\/operacional\/projetos$/,
    title: 'Projetos',
    description: 'Acompanhe etapas, responsáveis e checkpoints dos projetos.',
  },
  {
    pattern: /^\/planos$/,
    title: 'Planos de assinatura',
    description: 'Consulte e gerencie os planos disponíveis nas propostas.',
  },
  {
    pattern: /^\/produtos$/,
    title: 'Banco de produtos',
    description: 'Consulte e gerencie os produtos usados nas composições comerciais.',
  },
  {
    pattern: /^\/servicos$/,
    title: 'Banco de serviços',
    description: 'Consulte e gerencie os serviços oferecidos nas propostas.',
  },
];

const FALLBACK_ROUTE_METADATA: Omit<TAppRouteMetadata, 'pattern'> = {
  title: 'CRM Ampère',
  description: 'Operação comercial e operacional.',
};

export function getAppRouteMetadata(pathname: string) {
  return APP_ROUTES.find((route) => route.pattern.test(pathname)) ?? FALLBACK_ROUTE_METADATA;
}
