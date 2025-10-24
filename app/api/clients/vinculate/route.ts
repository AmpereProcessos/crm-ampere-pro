import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, TUserSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { formatToCPForCNPJ, formatToPhone } from "@/utils/methods";
import { TClient } from "@/utils/schemas/client.schema";
import createHttpError from "http-errors";
import { Collection, Filter } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { GetVinculationClientInputSchema } from "./input";

export type TGetVinculationClientInput = z.infer<typeof GetVinculationClientInputSchema>;
async function getVinculationClient({ input, session }: { input: TGetVinculationClientInput; session: TUserSession }) {
	const { phone, cpfCnpj } = input;

	const formattedPhone = formatToPhone(phone);
	const formattedCpfCnpj = formatToCPForCNPJ(cpfCnpj);

	if (formattedCpfCnpj.trim().length < 14 && formattedPhone.trim().length < 14) {
		// If the id is not provided, we query the client by cpfCnpj or phone

		// Validating if the either cpfCnpj or phone are valid
		throw new createHttpError.BadRequest("CPF/CNPJ ou telefone inválidos");
	}

	const db = await connectToDatabase();
	const clientsCollection: Collection<TClient> = db.collection("clients");

	let query: Filter<TClient> = {};
	const isValidCpfCnpj = formattedCpfCnpj.trim().length >= 14;
	const isValidPhone = formattedPhone.trim().length >= 14;

	if (isValidCpfCnpj && isValidPhone) {
		// If both are valid, then we query for both (allowing cpfCnpj to be null or empty)
		query = { telefonePrimario: formattedPhone, $or: [{ cpfCnpj: formattedCpfCnpj }, { telefonePrimario: formattedPhone }] };
	}

	if (isValidPhone && !isValidCpfCnpj) {
		// If the phone is valid and the cpfCnpj is not, then we query for the client by phone
		query = { telefonePrimario: formattedPhone };
	}

	if (isValidCpfCnpj && !isValidPhone) {
		// If the cpfCnpj is valid and the phone is not, then we query for the client by cpfCnpj
		query = { cpfCnpj: formattedCpfCnpj };
	}
	const client = await clientsCollection.findOne({ ...query });

	if (!client) {
		throw new createHttpError.NotFound("Nenhum cliente encontrado para telefone ou CPF/CNPJ informados.");
	}

	return {
		data: { ...client, _id: client._id.toString() },
	};
}
export type TGetVinculationClientOutput = Awaited<ReturnType<typeof getVinculationClient>>;

export const getVinculationClientHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();

	const searchParams = await req.nextUrl.searchParams;
	const input = GetVinculationClientInputSchema.parse({
		phone: searchParams.get("phone"),
		cpfCnpj: searchParams.get("cpfCnpj"),
	});
	const result = await getVinculationClient({ input, session });
	return NextResponse.json(result);
};

export const GET = apiHandler({
	GET: getVinculationClientHandler,
});
