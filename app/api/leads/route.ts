import { apiHandler } from '@/lib/api';
import { getValidCurrentSessionUncached, TUserSession } from '@/lib/auth/session';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import { TLead } from '@/utils/schemas/leads.schema';
import createHttpError from 'http-errors';
import { Filter, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import {
  CreateLeadInputSchema,
  CreateManyLeadInputSchema,
  CreateOneLeadInputSchema,
  GetLeadByIdInputSchema,
  GetLeadsInputSchema,
  GetManyLeadsInputSchema,
  UpdateLeadInputSchema,
} from './input';

export type TGetManyLeadsInput = z.infer<typeof GetManyLeadsInputSchema>;
export type TGetLeadByIdInput = z.infer<typeof GetLeadByIdInputSchema>;
export type TGetLeadsInput = z.infer<typeof GetLeadsInputSchema>;
async function getLeads({ input, session }: { input: TGetLeadsInput; session: TUserSession }) {
  const PAGE_SIZE = 50;
  const db = await connectToDatabase();
  const leadsCollection = db.collection<TLead>('leads');

  if ('id' in input) {
    const lead = await leadsCollection.findOne({ _id: new ObjectId(input.id) });
    if (!lead) {
      throw new createHttpError.NotFound('Lead não encontrado.');
    }
    return {
      data: {
        default: undefined,
        byId: { ...lead, _id: lead._id.toString() },
      },
    };
  }

  console.log(JSON.stringify(input, null, 2));
  const { page, search, periodAfter, periodBefore, periodField, qualifiersIds, ufs, cities, pendingQualification, pendingContact } = input;

  const searchQuery: Filter<TLead> | null = search
    ? {
        $or: [
          { nome: { $regex: search, $options: 'i' } },
          {
            telefone: search,
          },
        ],
      }
    : null;

  const periodQuery: Filter<TLead> | null =
    periodAfter && periodBefore && periodField ? { [periodField]: { $gte: periodAfter, $lte: periodBefore } } : null;
  const qualifiersQuery: Filter<TLead> | null = qualifiersIds && qualifiersIds.length > 0 ? { qualifiersIds: { $in: qualifiersIds } } : null;

  const ufsQuery: Filter<TLead> | null = ufs && ufs.length > 0 ? { uf: { $in: ufs } } : null;
  const citiesQuery: Filter<TLead> | null = cities && cities.length > 0 ? { cidade: { $in: cities } } : null;
  const pendingQualificationQuery: Filter<TLead> | null = pendingQualification ? { 'qualificacao.data': null } : null;
  const pendingContactQuery: Filter<TLead> | null = pendingContact ? { dataUltimoContato: null } : null;

  const queryArray = [searchQuery, periodQuery, qualifiersQuery, ufsQuery, citiesQuery, pendingQualificationQuery, pendingContactQuery].filter(
    (query) => !!query
  );
  const query: Filter<TLead> = queryArray.length > 0 ? { $and: queryArray } : {};

  const skip = PAGE_SIZE * (Number(page) - 1);
  const limit = PAGE_SIZE;

  const leadsMatched = await leadsCollection.countDocuments(query);
  const leads = (await leadsCollection.find(query).skip(skip).limit(limit).toArray()).map((lead) => ({ ...lead, _id: lead._id.toString() }));

  const totalPages = Math.ceil(leadsMatched / PAGE_SIZE);

  return {
    data: {
      default: {
        leads,
        leadsMatched,
        totalPages,
      },
      byId: undefined,
    },
  };
}
export type TGetLeadsOutput = Awaited<ReturnType<typeof getLeads>>;
export type TGetLeadsOutputDefault = Exclude<TGetLeadsOutput['data']['default'], undefined>;
export type TGetLeadsOutputById = Exclude<TGetLeadsOutput['data']['byId'], undefined>;

const getLeadsHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const searchParams = await req.nextUrl.searchParams;
  const input = GetLeadsInputSchema.parse({
    id: searchParams.get('id'),
    page: searchParams.get('page'),
    search: searchParams.get('search'),
    periodAfter: searchParams.get('periodAfter'),
    periodBefore: searchParams.get('periodBefore'),
    periodField: searchParams.get('periodField'),
    qualifiersIds: searchParams.get('qualifiersIds'),
    ufs: searchParams.get('ufs'),
    cities: searchParams.get('cities'),
    pendingQualification: searchParams.get('pendingQualification'),
    pendingContact: searchParams.get('pendingContact'),
  });
  const result = await getLeads({ input, session });
  return NextResponse.json(result);
};

export const GET = apiHandler({
  GET: getLeadsHandler,
});

export type TCreateOneLeadInput = z.infer<typeof CreateOneLeadInputSchema>;
export type TCreateManyLeadInput = z.infer<typeof CreateManyLeadInputSchema>;
export type TCreateLeadInput = z.infer<typeof CreateLeadInputSchema>;
async function createLead({ input, session }: { input: TCreateLeadInput; session: TUserSession }) {
  const db = await connectToDatabase();
  const leadsCollection = db.collection<TLead>('leads');

  if (input.type === 'single') {
    const insertResponse = await leadsCollection.insertOne(input.lead);
    if (!insertResponse.acknowledged) {
      throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar lead.');
    }

    return {
      data: { insertedId: insertResponse.insertedId.toString() },
      message: 'Lead criado com sucesso!',
    };
  }

  const insertResponses = await leadsCollection.insertMany(input.leads);

  if (!insertResponses.acknowledged) {
    throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao criar leads.');
  }

  return {
    data: {
      insertedIds: Object.values(insertResponses.insertedIds).map((id) => id.toString()),
    },
    message: 'Leads criados com sucesso!',
  };
}
export type TCreateLeadOutput = Awaited<ReturnType<typeof createLead>>;

const createLeadHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const payload = await req.json();
  const input = CreateLeadInputSchema.parse(payload);
  const result = await createLead({ input, session });
  return NextResponse.json(result);
};

export const POST = apiHandler({
  POST: createLeadHandler,
});

export type TUpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;
async function updateLead({ input, session }: { input: TUpdateLeadInput; session: TUserSession }) {
  const db = await connectToDatabase();
  const leadsCollection = db.collection<TLead>('leads');

  const updateResponse = await leadsCollection.updateOne({ _id: new ObjectId(input.id) }, { $set: input.lead });
  if (!updateResponse.acknowledged) {
    throw new createHttpError.InternalServerError('Oops, houve um erro desconhecido ao atualizar lead.');
  }

  return {
    data: {
      updatedId: updateResponse.upsertedId?.toString(),
    },
    message: 'Lead atualizado com sucesso!',
  };
}
export type TUpdateLeadOutput = Awaited<ReturnType<typeof updateLead>>;

const updateLeadHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const payload = await req.json();
  const input = UpdateLeadInputSchema.parse(payload);
  const result = await updateLead({ input, session });
  return NextResponse.json(result);
};

export const PUT = apiHandler({
  PUT: updateLeadHandler,
});
