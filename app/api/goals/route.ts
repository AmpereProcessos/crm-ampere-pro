import createHttpError from "http-errors";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { DATABASE_COLLECTION_NAMES } from "@/configs/app-definitions";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TGoal } from "@/utils/schemas/goal.schema";
import { CreateGoalInput, GetGoalsInput, UpdateGoalInput } from "./inputs";

export type TCreateGoalRouteInput = z.infer<typeof CreateGoalInput>;
async function createGoal(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	if (!user.permissoes.resultados.visualizarComercial) {
		throw new createHttpError.Forbidden("Você não tem permissão para criar metas.");
	}

	const payload = await request.json();

	const { goal } = CreateGoalInput.parse(payload);

	const crmDb = await connectToDatabase();
	const goalsCollection = crmDb.collection<TGoal>(DATABASE_COLLECTION_NAMES.CRM.GOALS);

	const insertGoalResponse = await goalsCollection.insertOne(goal);
	if (!insertGoalResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Erro ao criar meta.");
	}

	return NextResponse.json({
		data: {
			insertedId: insertGoalResponse.insertedId.toString(),
		},
		message: "Meta criada com sucesso!",
	});
}
export type TCreateGoalRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createGoal>>>;
export const POST = apiHandler({ POST: createGoal });

export type TUpdateGoalRouteInput = z.infer<typeof UpdateGoalInput>;
async function updateGoal(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	if (!user.permissoes.resultados.visualizarComercial) {
		throw new createHttpError.Forbidden("Você não tem permissão para atualizar metas.");
	}

	const payload = await request.json();
	const { id, changes } = UpdateGoalInput.parse(payload);

	const crmDb = await connectToDatabase();
	const goalsCollection = crmDb.collection<TGoal>(DATABASE_COLLECTION_NAMES.CRM.GOALS);

	const updateGoalResponse = await goalsCollection.updateOne({ _id: new ObjectId(id) }, { $set: changes });
	if (!updateGoalResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Erro ao atualizar meta.");
	}

	return NextResponse.json({
		data: {
			updatedId: updateGoalResponse.upsertedId?.toString(),
		},
		message: "Meta atualizada com sucesso!",
	});
}
export type TUpdateGoalRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof updateGoal>>>;
export const PUT = apiHandler({ PUT: updateGoal });

export type TGetGoalsRouteInput = z.infer<typeof GetGoalsInput>;
async function getGoals(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	if (!user.permissoes.resultados.visualizarComercial) {
		throw new createHttpError.Forbidden("Você não tem permissão para visualizar metas.");
	}

	const crmDb = await connectToDatabase();
	const goalsCollection = crmDb.collection<TGoal>(DATABASE_COLLECTION_NAMES.CRM.GOALS);

	const searchParams = request.nextUrl.searchParams;

	const { id } = GetGoalsInput.parse({
		id: searchParams.get("id"),
	});

	if (id) {
		const goal = await goalsCollection.findOne({ _id: new ObjectId(id) });
		if (!goal) {
			throw new createHttpError.NotFound("Meta não encontrada.");
		}

		return NextResponse.json({
			data: {
				default: undefined,
				byId: { ...goal, _id: goal._id.toString() },
			},
			message: "Meta encontrada com sucesso!",
		});
	}

	const goals = await goalsCollection.find({}).toArray();

	return NextResponse.json({
		data: {
			default: goals.map((goal) => ({
				...goal,
				_id: goal._id.toString(),
			})),
			byId: undefined,
		},
		message: "Metas encontradas com sucesso!",
	});
}
export type TGetGoalsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getGoals>>>;
export const GET = apiHandler({ GET: getGoals });
