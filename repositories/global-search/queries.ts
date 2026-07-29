import type { TUserSession } from '@/lib/auth/session';
import { buildResourceVisibilityFilter, canViewResource, getAllowedPartnerIds, getProjectResponsibleScope } from '@/lib/auth/visibility';
import connectToAmpereProjectsDatabase from '@/services/mongodb/ampere/projects-db-connection';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import type { TClient } from '@/utils/schemas/client.schema';
import type { THomologation } from '@/utils/schemas/homologation.schema';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TProject } from '@/utils/schemas/project.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import type { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import type { TUser } from '@/utils/schemas/user.schema';
import {
  GLOBAL_SEARCH_ENTITIES,
  createEmptyGlobalSearchResults,
  type TGlobalSearchEntity,
  type TGlobalSearchInput,
  type TGlobalSearchResultItem,
  type TGlobalSearchResults,
} from '@/utils/schemas/global-search.schema';
import { ObjectId, type Collection, type Filter } from 'mongodb';

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

const ACCENT_GROUPS: Record<string, string> = {
  a: 'aáàâãä',
  c: 'cç',
  e: 'eéèêë',
  i: 'iíìîï',
  n: 'nñ',
  o: 'oóòôõö',
  u: 'uúùûü',
};

function escapeRegexCharacter(character: string): string {
  return /[.*+?^${}()|[\]\\]/.test(character) ? `\\${character}` : character;
}

function createTextRegex(search: string): RegExp {
  const normalized = normalizeText(search);
  const pattern = [...normalized]
    .map((character) => {
      if (/\s/.test(character)) return '\\s+';
      const group = ACCENT_GROUPS[character];
      return group ? `[${group}]` : escapeRegexCharacter(character);
    })
    .join('');
  return new RegExp(pattern, 'i');
}

function createDigitsRegex(search: string): RegExp | null {
  const digits = onlyDigits(search);
  if (digits.length < 3) return null;
  return new RegExp(digits.split('').join('\\D*'));
}

function rankAndLimit(items: TGlobalSearchResultItem[], search: string, limit: number): TGlobalSearchResultItem[] {
  const normalizedSearch = normalizeText(search);
  const digits = onlyDigits(search);
  return items
    .map((item, index) => {
      const label = normalizeText(item.label);
      const description = normalizeText(item.description ?? '');
      const searchableDigits = onlyDigits(`${item.label} ${item.description ?? ''}`);
      let score = 4;
      if (label === normalizedSearch || (digits.length >= 3 && searchableDigits === digits)) score = 0;
      else if (label.startsWith(normalizedSearch)) score = 1;
      else if (label.includes(normalizedSearch)) score = 2;
      else if (description.includes(normalizedSearch) || (digits.length >= 3 && searchableDigits.includes(digits))) score = 3;
      return { item, index, score };
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

function includesEntity(activeEntities: TGlobalSearchEntity[], entity: TGlobalSearchEntity): boolean {
  return activeEntities.includes(entity);
}

export async function globalSearch(session: TUserSession, input: TGlobalSearchInput): Promise<TGlobalSearchResults> {
  const { q, limit } = input;
  const activeEntities = input.entities?.length ? input.entities : [...GLOBAL_SEARCH_ENTITIES];
  const textRegex = createTextRegex(q);
  const digitsRegex = createDigitsRegex(q);
  const fetchLimit = limit * 3;
  const results = createEmptyGlobalSearchResults();
  const crmDb = await connectToDatabase();
  const tasks: Promise<void>[] = [];

  const clientVisibility = buildResourceVisibilityFilter(session, 'clientes') as Filter<TClient> | null;
  if (clientVisibility && includesEntity(activeEntities, 'clients')) {
    const clientsCollection: Collection<TClient> = crmDb.collection('clients');
    const searchConditions: Filter<TClient>[] = [
      { nome: textRegex },
      { email: textRegex },
      ...(digitsRegex ? [{ cpfCnpj: digitsRegex }, { telefonePrimario: digitsRegex }, { telefonePrimarioBase: digitsRegex }] : []),
    ];
    tasks.push(
      clientsCollection
        .find(
          { ...clientVisibility, dataExclusao: null, $or: searchConditions },
          { projection: { nome: 1, cpfCnpj: 1, telefonePrimario: 1, email: 1 } }
        )
        .sort({ _id: -1 })
        .limit(fetchLimit)
        .toArray()
        .then((rows) => {
          results.clients = rankAndLimit(
            rows.map((row) => ({
              id: row._id.toString(),
              entity: 'clients' as const,
              label: row.nome,
              description: [row.cpfCnpj, row.telefonePrimario, row.email].filter(Boolean).join(' · ') || null,
              href: `/clientes?clientId=${row._id.toString()}`,
            })),
            q,
            limit
          );
        })
    );
  }

  const opportunityVisibility = buildResourceVisibilityFilter(session, 'oportunidades') as Filter<TOpportunity> | null;
  if (opportunityVisibility && includesEntity(activeEntities, 'opportunities')) {
    const opportunitiesCollection: Collection<TOpportunity> = crmDb.collection('opportunities');
    const searchConditions: Filter<TOpportunity>[] = [
      { nome: textRegex },
      { identificador: textRegex },
      { 'cliente.nome': textRegex },
      { 'cliente.email': textRegex },
      ...(digitsRegex ? [{ 'cliente.cpfCnpj': digitsRegex }, { 'cliente.telefonePrimario': digitsRegex }] : []),
    ];
    tasks.push(
      opportunitiesCollection
        .find(
          { ...opportunityVisibility, dataExclusao: null, $or: searchConditions },
          { projection: { nome: 1, identificador: 1, 'cliente.nome': 1 } }
        )
        .sort({ _id: -1 })
        .limit(fetchLimit)
        .toArray()
        .then((rows) => {
          results.opportunities = rankAndLimit(
            rows.map((row) => ({
              id: row._id.toString(),
              entity: 'opportunities' as const,
              label: row.nome,
              description: [`#${row.identificador}`, row.cliente?.nome].filter(Boolean).join(' · ') || null,
              href: `/comercial/oportunidades/id/${row._id.toString()}`,
            })),
            q,
            limit
          );
        })
    );
  }

  const proposalVisibility = buildResourceVisibilityFilter(session, 'propostas') as Filter<TProposal> | null;
  if (proposalVisibility && includesEntity(activeEntities, 'proposals')) {
    const proposalsCollection: Collection<TProposal> = crmDb.collection('proposals');
    const searchConditions: Filter<TProposal>[] = [{ nome: textRegex }, { 'oportunidade.nome': textRegex }];
    tasks.push(
      proposalsCollection
        .find({ ...proposalVisibility, $or: searchConditions }, { projection: { nome: 1, valor: 1, oportunidade: 1 } })
        .sort({ _id: -1 })
        .limit(fetchLimit)
        .toArray()
        .then((rows) => {
          results.proposals = rankAndLimit(
            rows.map((row) => ({
              id: row._id.toString(),
              entity: 'proposals' as const,
              label: row.nome,
              description: [row.valor ? moneyFormatter.format(row.valor) : null, row.oportunidade?.nome].filter(Boolean).join(' · ') || null,
              href: `/comercial/proposta/${row._id.toString()}`,
            })),
            q,
            limit
          );
        })
    );
  }

  const analysisVisibility = buildResourceVisibilityFilter(session, 'analisesTecnicas') as Filter<TTechnicalAnalysis> | null;
  if (analysisVisibility && includesEntity(activeEntities, 'technicalAnalysis')) {
    const collection: Collection<TTechnicalAnalysis> = crmDb.collection('technical-analysis');
    const conditions: Filter<TTechnicalAnalysis>[] = [
      { nome: textRegex },
      { 'oportunidade.nome': textRegex },
      { 'oportunidade.identificador': textRegex },
    ];
    tasks.push(
      collection
        .find({ ...analysisVisibility, $or: conditions }, { projection: { nome: 1, status: 1, oportunidade: 1 } })
        .sort({ _id: -1 })
        .limit(fetchLimit)
        .toArray()
        .then((rows) => {
          results.technicalAnalysis = rankAndLimit(
            rows.map((row) => ({
              id: row._id.toString(),
              entity: 'technicalAnalysis' as const,
              label: row.nome,
              description: [row.status, row.oportunidade?.nome].filter(Boolean).join(' · ') || null,
              href: `/operacional/analises-tecnicas?analysisId=${row._id.toString()}`,
            })),
            q,
            limit
          );
        })
    );
  }

  const homologationVisibility = buildResourceVisibilityFilter(session, 'homologacoes') as Filter<THomologation> | null;
  if (homologationVisibility && includesEntity(activeEntities, 'homologations')) {
    const collection: Collection<THomologation> = crmDb.collection('homologations');
    const conditions: Filter<THomologation>[] = [
      { 'titular.nome': textRegex },
      { 'oportunidade.nome': textRegex },
      ...(digitsRegex ? [{ 'titular.identificador': digitsRegex }, { 'titular.contato': digitsRegex }] : []),
    ];
    tasks.push(
      collection
        .find(
          { ...homologationVisibility, 'oportunidade.id': { $nin: [null, ''] }, $or: conditions },
          { projection: { titular: 1, status: 1, oportunidade: 1 } }
        )
        .sort({ _id: -1 })
        .limit(fetchLimit)
        .toArray()
        .then((rows) => {
          results.homologations = rankAndLimit(
            rows.map((row) => ({
              id: row._id.toString(),
              entity: 'homologations' as const,
              label: row.titular.nome,
              description: [row.status, row.oportunidade?.nome].filter(Boolean).join(' · ') || null,
              href: `/comercial/oportunidades/id/${row.oportunidade.id}`,
            })),
            q,
            limit
          );
        })
    );
  }

  if (canViewResource(session, 'projetos') && includesEntity(activeEntities, 'projects')) {
    tasks.push(
      (async () => {
        const projectsDb = await connectToAmpereProjectsDatabase();
        const projectsCollection: Collection<TProject> = projectsDb.collection('dados');
        const partnerIds = getAllowedPartnerIds(session);
        const responsibleScope = getProjectResponsibleScope(session);
        const visibilityConditions: Filter<TProject>[] = [{ idParceiro: { $in: partnerIds } }];

        if (responsibleScope !== null && responsibleScope !== undefined) {
          const usersCollection: Collection<TUser> = crmDb.collection('users');
          const validResponsibleIds = responsibleScope.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
          const scopedUsers = await usersCollection.find({ _id: { $in: validResponsibleIds } }, { projection: { nome: 1 } }).toArray();
          const responsibleNames = scopedUsers.map((user) => user.nome);
          visibilityConditions.push({
            $or: [
              { 'vendedor.idCRM': { $in: responsibleScope } },
              { 'vendedor.nome': { $in: responsibleNames } },
              { insider: { $in: responsibleNames } },
            ],
          });
        }

        const conditions: Filter<TProject>[] = [
          { nomeDoContrato: textRegex },
          { nomeDoProjeto: textRegex },
          ...(digitsRegex ? [{ cpf_cnpj: digitsRegex }, { telefone: digitsRegex }, { codigoSVB: digitsRegex }] : []),
        ];
        const rows = await projectsCollection
          .find(
            { $and: [...visibilityConditions, { $or: conditions }] },
            { projection: { nomeDoContrato: 1, nomeDoProjeto: 1, qtde: 1, codigoSVB: 1, cidade: 1, uf: 1 } }
          )
          .sort({ qtde: -1 })
          .limit(fetchLimit)
          .toArray();

        results.projects = rankAndLimit(
          rows.map((row) => ({
            id: row._id.toString(),
            entity: 'projects' as const,
            label: row.nomeDoContrato || row.nomeDoProjeto,
            description:
              [row.qtde ? `#${row.qtde}` : row.codigoSVB ? `SVB ${row.codigoSVB}` : null, [row.cidade, row.uf].filter(Boolean).join('/')]
                .filter(Boolean)
                .join(' · ') || null,
            href: `/operacional/projetos?projectId=${row._id.toString()}`,
          })),
          q,
          limit
        );
      })()
    );
  }

  await Promise.all(tasks);
  return results;
}
