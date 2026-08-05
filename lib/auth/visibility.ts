import type { TUserSession } from "@/lib/auth/session";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import type { Collection, Filter } from "mongodb";
import { normalizeScope } from "./scope";

export { normalizeScope } from "./scope";

export type TVisibilityResource =
  | "clientes"
  | "oportunidades"
  | "propostas"
  | "projetos"
  | "analisesTecnicas"
  | "homologacoes";

const RESOURCE_SCOPE_FIELDS: Record<Exclude<TVisibilityResource, "projetos">, string> = {
  clientes: "autor.id",
  oportunidades: "responsaveis.id",
  propostas: "autor.id",
  analisesTecnicas: "requerente.id",
  homologacoes: "requerente.id",
};

export function canViewResource(session: TUserSession, resource: TVisibilityResource): boolean {
  return session.user.permissoes[resource].visualizar;
}

export function getAllowedPartnerIds(session: TUserSession): string[] | null {
	return normalizeScope(session.user.permissoes.parceiros.escopo);
}

export function getResourceScope(
  session: TUserSession,
  resource: TVisibilityResource,
): string[] | null {
	return normalizeScope(session.user.permissoes[resource].escopo);
}

export function buildResourceVisibilityFilter(
  session: TUserSession,
  resource: Exclude<TVisibilityResource, "projetos">,
): Record<string, unknown> | null {
  if (!canViewResource(session, resource)) return null;

  const partnerIds = getAllowedPartnerIds(session);
  const scope = getResourceScope(session, resource);
  const filter: Record<string, unknown> = partnerIds
    ? {
        idParceiro: { $in: partnerIds },
      }
    : {};
  if (scope !== null) filter[RESOURCE_SCOPE_FIELDS[resource]] = { $in: scope };

  return filter;
}

export async function buildProposalVisibilityFilter(
  session: TUserSession,
  opportunitiesCollection: Collection<TOpportunity>,
): Promise<Filter<TProposal> | null> {
  const proposalVisibility = buildResourceVisibilityFilter(session, "propostas") as Filter<TProposal> | null;
  if (!proposalVisibility) return null;

  const proposalScope = getResourceScope(session, "propostas");
  if (proposalScope === null) return proposalVisibility;

  const partnerIds = getAllowedPartnerIds(session);
  const opportunityQuery: Filter<TOpportunity> = {
    "responsaveis.id": session.user.id,
    ...(partnerIds ? { idParceiro: { $in: partnerIds } } : {}),
  };
  const responsibleOpportunityIds = await opportunitiesCollection
    .find(opportunityQuery, { projection: { _id: 1 } })
    .map(({ _id }) => _id.toString())
    .toArray();

  const authorVisibility = { "autor.id": { $in: proposalScope } } as Filter<TProposal>;
  const proposalBaseFilter = { ...proposalVisibility };
  delete proposalBaseFilter["autor.id"];

  const visibilityConditions: Filter<TProposal>[] = [authorVisibility];
  if (responsibleOpportunityIds.length > 0) {
    visibilityConditions.push({ "oportunidade.id": { $in: responsibleOpportunityIds } });
  }

  return {
    ...proposalBaseFilter,
    $or: visibilityConditions,
  };
}

export function getProjectResponsibleScope(
  session: TUserSession,
): TUser["permissoes"]["oportunidades"]["escopo"] {
	return normalizeScope(session.user.permissoes.oportunidades.escopo);
}
