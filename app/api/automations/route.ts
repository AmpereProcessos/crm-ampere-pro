import createHttpError from "http-errors";
import { type Filter, ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import type z from "zod";
import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TAutomationConfiguration } from "@/utils/schemas/automations.schema";
import {
	CreateAutomationInputSchema,
	type GetAutomationByIdInputSchema,
	GetAutomationsInputSchema,
	type GetManyAutomationsInputSchema,
	UpdateAutomationInputSchema,
} from "./input";

// GET Implementation
export type TGetAutomationsInput = z.infer<typeof GetAutomationsInputSchema>;
export type TGetManyAutomationsInput = z.infer<typeof GetManyAutomationsInputSchema>;
export type TGetAutomationByIdInput = z.infer<typeof GetAutomationByIdInputSchema>;

// DTO type for MongoDB documents
export type TAutomationConfigurationDTO = TAutomationConfiguration & { _id: string };

async function getAutomations({ input, session }: { input: TGetAutomationsInput; session: TUserSession }) {
	const PAGE_SIZE = 50;
	const db = await connectToDatabase();
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");

	// Handle single automation by ID
	if ("id" in input) {
		const automation = await automationsCollection.findOne({ _id: new ObjectId(input.id) });
		if (!automation) {
			throw new createHttpError.NotFound("Automação não encontrada.");
		}
		return {
			data: {
				default: undefined,
				byId: { ...automation, _id: automation._id.toString() },
			},
			message: "Automação encontrada com sucesso!",
		};
	}

	// Handle list with filters
	const { page, search, ativo, triggerType, actionType } = input;

	// Build query filters
	const searchQuery: Filter<TAutomationConfiguration> | null = search
		? {
				$or: [{ titulo: { $regex: search, $options: "i" } }, { descricao: { $regex: search, $options: "i" } }],
			}
		: null;

	const ativoQuery: Filter<TAutomationConfiguration> | null = ativo !== null ? { ativo } : null;

	const triggerTypeQuery: Filter<TAutomationConfiguration> | null = triggerType && triggerType.length > 0 ? { "gatilho.tipo": { $in: triggerType } } : null;

	const actionTypeQuery: Filter<TAutomationConfiguration> | null = actionType && actionType.length > 0 ? { "acao.tipo": { $in: actionType } } : null;

	// Combine queries
	const queryArray = [searchQuery, ativoQuery, triggerTypeQuery, actionTypeQuery].filter((q) => !!q);
	const query: Filter<TAutomationConfiguration> = queryArray.length > 0 ? { $and: queryArray } : {};

	// Pagination
	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;

	const automationsMatched = await automationsCollection.countDocuments(query);
	const automations = (await automationsCollection.find(query).skip(skip).limit(limit).toArray()).map((automation) => ({
		...automation,
		_id: automation._id.toString(),
	}));

	const totalPages = Math.ceil(automationsMatched / PAGE_SIZE);

	return {
		data: {
			default: {
				automations,
				automationsMatched,
				totalPages,
			},
			byId: undefined,
		},
		message: "Automações encontradas com sucesso!",
	};
}

export type TGetAutomationsOutput = Awaited<ReturnType<typeof getAutomations>>;
export type TGetAutomationsOutputDefault = Exclude<TGetAutomationsOutput["data"]["default"], undefined>;
export type TGetAutomationsOutputById = Exclude<TGetAutomationsOutput["data"]["byId"], undefined>;

const getAutomationsHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const searchParams = req.nextUrl.searchParams;
	const input = GetAutomationsInputSchema.parse({
		id: searchParams.get("id"),
		page: searchParams.get("page"),
		search: searchParams.get("search"),
		ativo: searchParams.get("ativo"),
		triggerType: searchParams.get("triggerType"),
		actionType: searchParams.get("actionType"),
	});
	const result = await getAutomations({ input, session });
	return NextResponse.json(result);
};

export const GET = apiHandler({ GET: getAutomationsHandler });

// POST Implementation
export type TCreateAutomationInput = z.infer<typeof CreateAutomationInputSchema>;

async function createAutomation({ input, session }: { input: TCreateAutomationInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");

	const insertResponse = await automationsCollection.insertOne(input.automation);
	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Erro ao criar automação.");
	}

	return {
		data: { insertedId: insertResponse.insertedId.toString() },
		message: "Automação criada com sucesso!",
	};
}

export type TCreateAutomationOutput = Awaited<ReturnType<typeof createAutomation>>;

const createAutomationHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const payload = await req.json();
	const input = CreateAutomationInputSchema.parse(payload);
	const result = await createAutomation({ input, session });
	return NextResponse.json(result);
};

export const POST = apiHandler({ POST: createAutomationHandler });

// PUT Implementation
export type TUpdateAutomationInput = z.infer<typeof UpdateAutomationInputSchema>;

async function updateAutomation({ input, session }: { input: TUpdateAutomationInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");

	const updateResponse = await automationsCollection.updateOne({ _id: new ObjectId(input.id) }, { $set: input.changes });

	if (!updateResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Erro ao atualizar automação.");
	}

	return {
		data: { updatedId: updateResponse.upsertedId?.toString() },
		message: "Automação atualizada com sucesso!",
	};
}

export type TUpdateAutomationOutput = Awaited<ReturnType<typeof updateAutomation>>;

const updateAutomationHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const payload = await req.json();
	const input = UpdateAutomationInputSchema.parse(payload);
	const result = await updateAutomation({ input, session });
	return NextResponse.json(result);
};

export const PUT = apiHandler({ PUT: updateAutomationHandler });
