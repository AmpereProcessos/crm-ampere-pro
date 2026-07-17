import type { TUserSession } from '@/lib/auth/session';
import type { TUser } from '@/utils/schemas/user.schema';

export type TVisibilityResource = 'clientes' | 'oportunidades' | 'propostas' | 'projetos' | 'analisesTecnicas' | 'homologacoes';

const RESOURCE_SCOPE_FIELDS: Record<Exclude<TVisibilityResource, 'projetos'>, string> = {
  clientes: 'autor.id',
  oportunidades: 'responsaveis.id',
  propostas: 'autor.id',
  analisesTecnicas: 'requerente.id',
  homologacoes: 'requerente.id',
};

export function canViewResource(session: TUserSession, resource: TVisibilityResource): boolean {
  return session.user.permissoes[resource].visualizar;
}

export function getAllowedPartnerIds(session: TUserSession): string[] {
  const partnerScope = session.user.permissoes.parceiros.escopo;
  if (partnerScope !== null && partnerScope !== undefined) return partnerScope;
  return session.user.idParceiro ? [session.user.idParceiro] : [];
}

export function getResourceScope(session: TUserSession, resource: TVisibilityResource): string[] | null {
  const scope = session.user.permissoes[resource].escopo;
  return scope === undefined ? null : scope;
}

export function buildResourceVisibilityFilter(
  session: TUserSession,
  resource: Exclude<TVisibilityResource, 'projetos'>
): Record<string, unknown> | null {
  if (!canViewResource(session, resource)) return null;

  const partnerIds = getAllowedPartnerIds(session);
  const scope = getResourceScope(session, resource);
  const filter: Record<string, unknown> = {
    idParceiro: { $in: partnerIds },
  };

  if (scope !== null) filter[RESOURCE_SCOPE_FIELDS[resource]] = { $in: scope };
  return filter;
}

export function getProjectResponsibleScope(session: TUserSession): TUser['permissoes']['oportunidades']['escopo'] {
  return session.user.permissoes.oportunidades.escopo;
}
