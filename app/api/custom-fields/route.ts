import createHttpError from "http-errors";
import { type Filter, ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { CustomFieldSchema, EntityEnum, type TCustomField } from "@/utils/schemas/custom-fields.schema";

const CreateCustomFieldInputSchema = z.object({
	customField: CustomFieldSchema.omit({ dataInsercao: true, autor: true }),
});
export type TCreateCustomFieldInput = z.infer<typeof CreateCustomFieldInputSchema>;

async function createCustomField({ input, session }: { input: TCreateCustomFieldInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const customFieldsCollection = db.collection<TCustomField>("custom-fields");

	const insertedCustomFieldResponse = await customFieldsCollection.insertOne({
		...input.customField,
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url ?? undefined,
		},
		dataInsercao: new Date().toISOString(),
	});

	if (!insertedCustomFieldResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar o campo personalizado.");
	}

	return {
		data: { insertedId: insertedCustomFieldResponse.insertedId.toString() },
		message: "Campo personalizado criado com sucesso!",
	};
}
export type TCreateCustomFieldOutput = Awaited<ReturnType<typeof createCustomField>>;

const createCustomFieldHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const payload = await req.json();
	const input = CreateCustomFieldInputSchema.parse(payload);
	const result = await createCustomField({ input, session });
	return NextResponse.json(result);
};

export const POST = apiHandler({ POST: createCustomFieldHandler });

const UpdateCustomFieldInputSchema = z.object({
	id: z.string({
		required_error: "ID do campo personalizado não informado.",
		invalid_type_error: "Tipo não válido para ID do campo personalizado.",
	}),
	customField: CustomFieldSchema.omit({ dataInsercao: true, autor: true }),
});
export type TUpdateCustomFieldInput = z.infer<typeof UpdateCustomFieldInputSchema>;

async function updateCustomField({ input, session }: { input: TUpdateCustomFieldInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const customFieldsCollection = db.collection<TCustomField>("custom-fields");

	if (!ObjectId.isValid(input.id)) {
		throw new createHttpError.BadRequest("ID do campo personalizado inválido.");
	}

	const updatedCustomFieldResponse = await customFieldsCollection.updateOne({ _id: new ObjectId(input.id) }, { $set: input.customField });

	if (!updatedCustomFieldResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar o campo personalizado.");
	}

	if (updatedCustomFieldResponse.matchedCount === 0) {
		throw new createHttpError.NotFound("Campo personalizado não encontrado.");
	}

	return {
		data: {
			updatedId: updatedCustomFieldResponse.upsertedId?.toString(),
		},
		message: "Campo personalizado atualizado com sucesso!",
	};
}
export type TUpdateCustomFieldOutput = Awaited<ReturnType<typeof updateCustomField>>;

const updateCustomFieldHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const payload = await req.json();
	const input = UpdateCustomFieldInputSchema.parse(payload);
	const result = await updateCustomField({ input, session });
	return NextResponse.json(result);
};
export const PUT = apiHandler({ PUT: updateCustomFieldHandler });

const GetCustomFieldsInputSchema = z.object({
	search: z
		.string({
			required_error: "Busca não informada.",
			invalid_type_error: "Tipo não válido para a busca.",
		})
		.optional()
		.nullable(),
	entities: z
		.string({
			required_error: "Entidades não informadas.",
			invalid_type_error: "Tipo não válido para entidades.",
		})
		.optional()
		.nullable()
		.transform((v) => (v ? v.split(",") : []))
		.refine((v) => (v ? v.every((entity) => entity in EntityEnum.Values) : null)),
	projectTypes: z
		.string({
			required_error: "Tipos de projetos não informados.",
			invalid_type_error: "Tipo não válido para tipos de projetos.",
		})
		.optional()
		.nullable()
		.transform((v) => (v ? v.split(",") : [])),
	id: z
		.string({
			required_error: "ID do campo personalizado não informado.",
			invalid_type_error: "Tipo não válido para ID do campo personalizado.",
		})
		.optional()
		.nullable(),
});
export type TGetCustomFieldsInput = z.infer<typeof GetCustomFieldsInputSchema>;

async function getCustomFields({ input, session }: { input: TGetCustomFieldsInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const customFieldsCollection = db.collection<TCustomField>("custom-fields");

	console.log("[INFO] [GET CUSTOM FIELDS] Input", input);
	if (input.id) {
		const customField = await customFieldsCollection.findOne({ _id: new ObjectId(input.id) });
		if (!customField) {
			throw new createHttpError.NotFound("Campo personalizado não encontrado.");
		}
		return {
			data: {
				default: undefined,
				byId: { ...customField, _id: customField._id.toString() },
			},
		};
	}
	const searchQuery: Filter<TCustomField> | null = input.search ? { nome: { $regex: input.search, $options: "i" } } : null;
	const entitiesQuery: Filter<TCustomField> | null = input.entities ? { entidades: { $in: input.entities as TCustomField["entidades"] } } : null;
	const projectTypesQuery: Filter<TCustomField> | null = input.projectTypes ? { tiposProjetos: { $in: input.projectTypes } } : null;
	const query: Filter<TCustomField> = {
		...searchQuery,
		...entitiesQuery,
		...projectTypesQuery,
	};

	const customFields = await customFieldsCollection.find(query).toArray();

	return {
		data: {
			default: customFields.map((customField) => ({ ...customField, _id: customField._id.toString() })),
			byId: undefined,
		},
		message: "Campos personalizados encontrados com sucesso!",
	};
}
export type TGetCustomFieldsOutput = Awaited<ReturnType<typeof getCustomFields>>;
export type TGetCustomFieldsOutputDefault = Exclude<TGetCustomFieldsOutput["data"]["default"], undefined>;
export type TGetCustomFieldsOutputById = Exclude<TGetCustomFieldsOutput["data"]["byId"], undefined>;

const getCustomFieldsHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const searchParams = req.nextUrl.searchParams;
	const input = GetCustomFieldsInputSchema.parse({
		id: searchParams.get("id"),
		search: searchParams.get("search"),
		entities: searchParams.get("entities"),
		projectTypes: searchParams.get("projectTypes"),
	});
	const result = await getCustomFields({ input, session });
	return NextResponse.json(result);
};
export const GET = apiHandler({ GET: getCustomFieldsHandler });

const DeleteCustomFieldInputSchema = z.object({
	id: z.string({
		required_error: "ID do campo personalizado não informado.",
		invalid_type_error: "Tipo não válido para ID do campo personalizado.",
	}),
});
export type TDeleteCustomFieldInput = z.infer<typeof DeleteCustomFieldInputSchema>;

async function deleteCustomField({ input, session }: { input: TDeleteCustomFieldInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const customFieldsCollection = db.collection<TCustomField>("custom-fields");

	if (!ObjectId.isValid(input.id)) {
		throw new createHttpError.BadRequest("ID do campo personalizado inválido.");
	}

	const deletedCustomFieldResponse = await customFieldsCollection.deleteOne({ _id: new ObjectId(input.id) });

	if (!deletedCustomFieldResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao deletar o campo personalizado.");
	}
	if (deletedCustomFieldResponse.deletedCount === 0) {
		throw new createHttpError.NotFound("Campo personalizado não encontrado.");
	}

	return {
		data: {
			deletedId: input.id,
		},
		message: "Campo personalizado deletado com sucesso!",
	};
}
export type TDeleteCustomFieldOutput = Awaited<ReturnType<typeof deleteCustomField>>;

const deleteCustomFieldHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const searchParams = req.nextUrl.searchParams;
	const id = searchParams.get("id");
	const input = DeleteCustomFieldInputSchema.parse({ id });
	const result = await deleteCustomField({ input, session });
	return NextResponse.json(result);
};
export const DELETE = apiHandler({ DELETE: deleteCustomFieldHandler });
