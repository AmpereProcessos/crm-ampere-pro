import createHttpError from "http-errors";
import { type Collection, ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import {
	deleteFunnelReference as deleteFunnelReferenceRepository,
	insertFunnelReference,
	updateFunnelReference,
} from "@/repositories/funnel-references/mutations";
import { getFunnelReferenceById } from "@/repositories/funnel-references/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { InsertFunnelReferenceSchema, type TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

const CreateFunnelReferenceInputSchema = InsertFunnelReferenceSchema;
export type TCreateFunnelReferenceInput = z.infer<typeof CreateFunnelReferenceInputSchema>;

async function createFunnelReference({ input, session }: { input: TCreateFunnelReferenceInput; session: TUserSession }) {
	const partnerId = session.user.idParceiro;
	if (!session.user.permissoes.oportunidades.criar) throw new createHttpError.Unauthorized("Você não possui permissão para criar referência de funil.");

	const db = await connectToDatabase();
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	const insertResponse = await insertFunnelReference({ collection: funnelReferencesCollection, info: input, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação da referência de funil.");
	return {
		data: {
			insertedId: insertResponse.insertedId.toString(),
		},
		message: "Referência de funil criada com sucesso!",
	};
}
export type TCreateFunnelReferenceOutput = Awaited<ReturnType<typeof createFunnelReference>>;

async function createFunnelReferenceHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const input = CreateFunnelReferenceInputSchema.parse(await request.json());
	const result = await createFunnelReference({ input, session });
	return NextResponse.json(result);
}
export const POST = apiHandler({ POST: createFunnelReferenceHandler });

const EditFunnelReferenceInputSchema = z.object({
	id: z.string({
		required_error: "ID da referência de funil não informado.",
		invalid_type_error: "Tipo não válido para ID da referência de funil.",
	}),
	changes: InsertFunnelReferenceSchema.partial(),
});
export type TEditFunnelReferenceInput = z.infer<typeof EditFunnelReferenceInputSchema>;

async function editFunnelReference({ input, session }: { input: TEditFunnelReferenceInput; session: TUserSession }) {
	const partnerId = session.user.idParceiro;
	if (!session.user.permissoes.oportunidades.editar) throw new createHttpError.Unauthorized("Você não possui permissão para editar referência de funil.");

	const db = await connectToDatabase();
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	// Validing payload, checking if there is new stage id reference
	const newStageId = input.changes.idEstagioFunil?.toString();
	if (!newStageId) throw new createHttpError.BadRequest("Novo estágio de funil não informado.");

	const reference = await getFunnelReferenceById({ collection: funnelReferencesCollection, id: input.id, query: {} });
	if (!reference) throw new createHttpError.NotFound("Referência de funil não encontrada.");

	if (reference.idEstagioFunil === newStageId)
		// In case there new stage id is equal to the current stage id, there is no need to update the reference
		return { data: "Atualização feita com sucesso!", message: "Atualização feita com sucesso !" };

	const additionalUpdates = {
		[`estagios.${reference.idEstagioFunil}.saida`]: new Date().toISOString(),
		[`estagios.${newStageId}.entrada`]: new Date().toISOString(),
	};
	const updateResponse = await updateFunnelReference({
		collection: funnelReferencesCollection,
		funnelReferenceId: input.id,
		newStageId: newStageId,
		additionalUpdates,
	});
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização da referência de funil.");

	return {
		data: {
			updatedId: updateResponse.upsertedId?.toString(),
		},
		message: "Referência de funil atualizada com sucesso!",
	};
}
export type TEditFunnelReferenceOutput = Awaited<ReturnType<typeof editFunnelReference>>;

async function editFunnelReferenceHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const input = EditFunnelReferenceInputSchema.parse(await request.json());
	const result = await editFunnelReference({ input, session });
	return NextResponse.json(result);
}
export const PUT = apiHandler({ PUT: editFunnelReferenceHandler });

const DeleteFunnelReferenceInputSchema = z.object({
	id: z.string({
		required_error: "ID da referência de funil não informado.",
		invalid_type_error: "Tipo não válido para ID da referência de funil.",
	}),
});
export type TDeleteFunnelReferenceInput = z.infer<typeof DeleteFunnelReferenceInputSchema>;

async function deleteFunnelReference({ input, session }: { input: TDeleteFunnelReferenceInput; session: TUserSession }) {
	const partnerId = session.user.idParceiro;
	const userOpportunityScope = session.user.permissoes.oportunidades.escopo;

	const db = await connectToDatabase();
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");

	const funnelReference = await getFunnelReferenceById({ collection: funnelReferencesCollection, id: input.id, query: {} });
	if (!funnelReference) throw new createHttpError.NotFound("Referência de funil não encontrada.");
	const opportunityId = funnelReference.idOportunidade;
	const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) }, { projection: { responsaveis: 1 } });
	if (!opportunity) throw new createHttpError.NotFound("Oops, houve um erro ao excluir referência de funil.");

	// Validating if user either: has global opportunity scope, its one of the opportunity responsibles or has one of the opportunity responsibles within his scope
	const hasEditAuthorizationForOpportunity =
		!userOpportunityScope || opportunity.responsaveis.some((opResp) => opResp.id === session.user.id || userOpportunityScope.includes(opResp.id));
	if (!hasEditAuthorizationForOpportunity) throw new createHttpError.Unauthorized("Você não possui permissão para realizar essa operação.");

	const deleteResponse = await deleteFunnelReferenceRepository({ collection: funnelReferencesCollection, id: input.id, query: {} });
	if (!deleteResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao excluir referência de funil.");

	return {
		data: "Referência de funil removida com sucesso !",
		message: "Referência de funil removida com sucesso !",
	};
}
export type TDeleteFunnelReferenceOutput = Awaited<ReturnType<typeof deleteFunnelReference>>;

async function deleteFunnelReferenceHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");
	if (!id || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID da referência de funil não informado.");
	const input = DeleteFunnelReferenceInputSchema.parse({ id });
	const result = await deleteFunnelReference({ input, session });
	return NextResponse.json(result);
}
export const DELETE = apiHandler({ DELETE: deleteFunnelReferenceHandler });
