import createHttpError from "http-errors";
import type { Collection, Document, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TClient } from "@/utils/schemas/client.schema";

const ReportQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(3650).nullable(),
  uf: z.string().trim().length(2).nullable(),
});

type QualityRow = {
  total: number;
  withPhone: number;
  withEmail: number;
  withRegistry: number;
  withCep: number;
  withLocation: number;
  complete: number;
  qualityPoints: number;
};
type GroupRow = { _id: string | null; total: number };
type TimelineRow = { _id: string; total: number };
type IncompleteClientRow = {
  _id: unknown;
  nome: string;
  uf?: string | null;
  cidade?: string | null;
  dataInsercao: string;
  completeness: number;
  missing: string[];
};
type DuplicateSummaryRow = { _id: null; groups: number; affected: number };

export type TClientReportData = {
  filters: { days: number | null; uf: string | null };
  kpis: {
    total: number;
    qualityScore: number;
    complete: number;
    incomplete: number;
    duplicateGroups: number;
    duplicateAffected: number;
  };
  quality: Array<{
    key: "phone" | "email" | "registry" | "cep" | "location";
    label: string;
    count: number;
    percentage: number;
  }>;
  byUf: Array<{ uf: string; total: number }>;
  byCity: Array<{ city: string; uf: string; total: number }>;
  byChannel: Array<{ channel: string; total: number }>;
  timeline: Array<{ period: string; total: number }>;
  incompleteClients: Array<{
    id: string;
    name: string;
    completeness: number;
    missing: string[];
    uf: string | null;
    city: string | null;
    insertedAt: string;
  }>;
};

const nonEmpty = (field: string): Document => ({
  $gt: [
    {
      $strLenCP: {
        $trim: {
          input: { $convert: { input: `$${field}`, to: "string", onError: "", onNull: "" } },
        },
      },
    },
    0,
  ],
});

const completenessPoints = {
  phone: { $cond: [nonEmpty("telefonePrimario"), 1, 0] },
  email: { $cond: [nonEmpty("email"), 1, 0] },
  registry: { $cond: [nonEmpty("cpfCnpj"), 1, 0] },
  cep: { $cond: [nonEmpty("cep"), 1, 0] },
  uf: { $cond: [nonEmpty("uf"), 1, 0] },
  city: { $cond: [nonEmpty("cidade"), 1, 0] },
};

async function getClientReport(request: NextRequest) {
  const session = await getValidCurrentSessionUncached();
  if (!session.user.permissoes.clientes.visualizar) {
    throw new createHttpError.Forbidden(
      "Seu usuário não possui permissão para visualizar clientes.",
    );
  }

  const parsed = ReportQuerySchema.parse({
    days: request.nextUrl.searchParams.get("days"),
    uf: request.nextUrl.searchParams.get("uf"),
  });
  const days = parsed.days;
  const uf = parsed.uf?.toUpperCase() ?? null;
  const scope = session.user.permissoes.clientes.escopo;
  const match: Filter<TClient> = { idParceiro: session.user.idParceiro };

  if (scope) match["autor.id"] = { $in: scope };
  if (uf) match.uf = uf;
  if (days) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    match.dataInsercao = { $gte: from.toISOString() };
  }

  const db = await connectToDatabase();
  const collection: Collection<TClient> = db.collection("clients");

  const [facetResult, phoneDuplicates, emailDuplicates, registryDuplicates] = await Promise.all([
    collection
      .aggregate<{
        quality: QualityRow[];
        byUf: GroupRow[];
        byCity: Array<{ _id: { city: string | null; uf: string | null }; total: number }>;
        byChannel: GroupRow[];
        timeline: TimelineRow[];
        incompleteClients: IncompleteClientRow[];
      }>([
        { $match: match },
        {
          $set: {
            _qualityPoints: {
              $add: [
                completenessPoints.phone,
                completenessPoints.email,
                completenessPoints.registry,
                completenessPoints.cep,
                completenessPoints.uf,
                completenessPoints.city,
              ],
            },
          },
        },
        {
          $facet: {
            quality: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  withPhone: { $sum: completenessPoints.phone },
                  withEmail: { $sum: completenessPoints.email },
                  withRegistry: { $sum: completenessPoints.registry },
                  withCep: { $sum: completenessPoints.cep },
                  withLocation: {
                    $sum: { $cond: [{ $and: [nonEmpty("uf"), nonEmpty("cidade")] }, 1, 0] },
                  },
                  complete: { $sum: { $cond: [{ $eq: ["$_qualityPoints", 6] }, 1, 0] } },
                  qualityPoints: { $sum: "$_qualityPoints" },
                },
              },
            ],
            byUf: [
              { $match: { uf: { $type: "string", $ne: "" } } },
              { $group: { _id: { $toUpper: "$uf" }, total: { $sum: 1 } } },
              { $sort: { total: -1 } },
            ],
            byCity: [
              { $match: { cidade: { $type: "string", $ne: "" } } },
              { $group: { _id: { city: "$cidade", uf: "$uf" }, total: { $sum: 1 } } },
              { $sort: { total: -1 } },
              { $limit: 15 },
            ],
            byChannel: [
              { $match: { canalAquisicao: { $type: "string", $ne: "" } } },
              { $group: { _id: "$canalAquisicao", total: { $sum: 1 } } },
              { $sort: { total: -1 } },
              { $limit: 10 },
            ],
            timeline: [
              {
                $set: {
                  parsedDate: {
                    $convert: { input: "$dataInsercao", to: "date", onError: null, onNull: null },
                  },
                },
              },
              { $match: { parsedDate: { $ne: null } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m", date: "$parsedDate" } },
                  total: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            incompleteClients: [
              { $match: { _qualityPoints: { $lt: 6 } } },
              { $sort: { _qualityPoints: 1, dataInsercao: -1 } },
              { $limit: 20 },
              {
                $project: {
                  nome: 1,
                  uf: 1,
                  cidade: 1,
                  dataInsercao: 1,
                  completeness: {
                    $round: [{ $multiply: [{ $divide: ["$_qualityPoints", 6] }, 100] }, 0],
                  },
                  missing: {
                    $concatArrays: [
                      { $cond: [nonEmpty("telefonePrimario"), [], ["Telefone"]] },
                      { $cond: [nonEmpty("email"), [], ["E-mail"]] },
                      { $cond: [nonEmpty("cpfCnpj"), [], ["CPF/CNPJ"]] },
                      { $cond: [nonEmpty("cep"), [], ["CEP"]] },
                      { $cond: [nonEmpty("uf"), [], ["UF"]] },
                      { $cond: [nonEmpty("cidade"), [], ["Cidade"]] },
                    ],
                  },
                },
              },
            ],
          },
        },
      ])
      .next(),
    getDuplicateSummary(collection, match, "telefonePrimarioBase"),
    getDuplicateSummary(collection, match, "email", true),
    getDuplicateSummary(collection, match, "cpfCnpj"),
  ]);

  const quality = facetResult?.quality[0] ?? {
    total: 0,
    withPhone: 0,
    withEmail: 0,
    withRegistry: 0,
    withCep: 0,
    withLocation: 0,
    complete: 0,
    qualityPoints: 0,
  };
  const total = quality.total;
  const percentage = (count: number) => (total > 0 ? Math.round((count / total) * 1000) / 10 : 0);

  const result: TClientReportData = {
    filters: { days, uf },
    kpis: {
      total,
      qualityScore: total > 0 ? Math.round((quality.qualityPoints / (total * 6)) * 1000) / 10 : 0,
      complete: quality.complete,
      incomplete: total - quality.complete,
      duplicateGroups: phoneDuplicates.groups + emailDuplicates.groups + registryDuplicates.groups,
      duplicateAffected:
        phoneDuplicates.affected + emailDuplicates.affected + registryDuplicates.affected,
    },
    quality: [
      {
        key: "phone",
        label: "Telefone",
        count: quality.withPhone,
        percentage: percentage(quality.withPhone),
      },
      {
        key: "email",
        label: "E-mail",
        count: quality.withEmail,
        percentage: percentage(quality.withEmail),
      },
      {
        key: "registry",
        label: "CPF/CNPJ",
        count: quality.withRegistry,
        percentage: percentage(quality.withRegistry),
      },
      { key: "cep", label: "CEP", count: quality.withCep, percentage: percentage(quality.withCep) },
      {
        key: "location",
        label: "Cidade e UF",
        count: quality.withLocation,
        percentage: percentage(quality.withLocation),
      },
    ],
    byUf: (facetResult?.byUf ?? []).map((row) => ({
      uf: row._id ?? "Não informado",
      total: row.total,
    })),
    byCity: (facetResult?.byCity ?? []).map((row) => ({
      city: row._id.city ?? "Não informada",
      uf: row._id.uf ?? "—",
      total: row.total,
    })),
    byChannel: (facetResult?.byChannel ?? []).map((row) => ({
      channel: row._id ?? "Não informado",
      total: row.total,
    })),
    timeline: (facetResult?.timeline ?? []).map((row) => ({ period: row._id, total: row.total })),
    incompleteClients: (facetResult?.incompleteClients ?? []).map((client) => ({
      id: String(client._id),
      name: client.nome,
      completeness: client.completeness,
      missing: client.missing,
      uf: client.uf ?? null,
      city: client.cidade ?? null,
      insertedAt: client.dataInsercao,
    })),
  };

  return NextResponse.json({ data: result });
}

async function getDuplicateSummary(
  collection: Collection<TClient>,
  match: Filter<TClient>,
  field: keyof TClient,
  caseInsensitive = false,
) {
  const fieldReference = `$${String(field)}`;
  const normalizedValue: Document = caseInsensitive
    ? {
        $toLower: {
          $trim: {
            input: { $convert: { input: fieldReference, to: "string", onError: "", onNull: "" } },
          },
        },
      }
    : {
        $trim: {
          input: { $convert: { input: fieldReference, to: "string", onError: "", onNull: "" } },
        },
      };

  const row = await collection
    .aggregate<DuplicateSummaryRow>([
      { $match: match },
      { $project: { normalizedValue } },
      { $match: { normalizedValue: { $ne: "" } } },
      { $group: { _id: "$normalizedValue", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $group: { _id: null, groups: { $sum: 1 }, affected: { $sum: "$count" } } },
    ])
    .next();

  return row ?? { _id: null, groups: 0, affected: 0 };
}

export const GET = apiHandler({ GET: getClientReport });
