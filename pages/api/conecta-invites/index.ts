import { DATABASE_COLLECTION_NAMES } from "@/configs/app-definitions";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import {
	apiHandler,
	type UnwrapNextResponse,
	validateAuthenticationWithSession,
} from "@/utils/api";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TInvite } from "@/utils/schemas/conecta-invite.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import { ObjectId } from "mongodb";
import type { NextApiHandler } from "next";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateConectaInviteInputSchema = z.object({
	clienteId: z.string({
		required_error: "ID do cliente não informado.",
		invalid_type_error: "Tipo não válido para o ID do cliente.",
	}),
});
export type TCreateConectaInviteInput = z.infer<
	typeof CreateConectaInviteInputSchema
>;
export type TCreateConectaInviteRouteOutput = {
	data: {
		inviteId: string;
	};
	message: string;
};
const createConectaInvite: NextApiHandler<
	TCreateConectaInviteRouteOutput
> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const { clienteId } = CreateConectaInviteInputSchema.parse(req.body);

	const crmDb = await connectToDatabase();
	const clientsCollection = crmDb.collection<TClient>(
		DATABASE_COLLECTION_NAMES.CRM.CLIENTS,
	);
	const usersCollection = crmDb.collection<TUser>(
		DATABASE_COLLECTION_NAMES.CRM.USERS,
	);
	const conectaInvitesCollection = crmDb.collection<TInvite>(
		DATABASE_COLLECTION_NAMES.CRM.CONECTA_INVITES,
	);

	const sessionUser = await usersCollection.findOne({
		_id: new ObjectId(session.user.id),
	});
	if (!sessionUser)
		throw new createHttpError.NotFound("Usuário não encontrado.");

	const client = await clientsCollection.findOne({
		_id: new ObjectId(clienteId),
	});

	if (!client) throw new createHttpError.NotFound("Cliente não encontrado.");

	let clientConectaInviteId = client.conecta?.conviteId;

	if (!client.email)
		throw new createHttpError.NotFound(
			"Cliente não possui email definido, defina o email para criar o convite.",
		);
	// Checking for existing conecta invite for the client
	if (!clientConectaInviteId) {
		// If no invite is defined, creating a new one
		const insertClientInviteResponse = await conectaInvitesCollection.insertOne(
			{
				promotor: {
					id: sessionUser._id.toString(),
					nome: sessionUser.nome,
					tipo: "VENDEDOR",
					codigoIndicacao: sessionUser.codigoIndicacaoConecta || "",
					avatar_url: sessionUser.avatar_url,
				},
				convidado: {
					id: client._id.toString(),
					nome: client.nome,
					telefone: client.telefonePrimario,
					email: client.email,
					cidade: client.cidade,
					uf: client.uf,
				},
				dataExpiracao: dayjs().add(30, "days").toISOString(),
				dataInsercao: new Date().toISOString(),
			},
		);
		const insertedClientInviteResponse = insertClientInviteResponse.insertedId;
		clientConectaInviteId = insertedClientInviteResponse.toString();
		// Updating the client with the new invite id
		await clientsCollection.updateOne(
			{
				_id: new ObjectId(clienteId),
			},
			{
				$set: {
					"conecta.conviteId": clientConectaInviteId,
				},
			},
		);
	} else {
		// If there is an existing invite, getting it in db
		const conectInvite = await conectaInvitesCollection.findOne({
			_id: new ObjectId(clientConectaInviteId),
		});
		// Checking for possible acceptance of the invite
		if (conectInvite?.dataAceite) {
			// If accepted, updating the client with the acceptance date
			await clientsCollection.updateOne(
				{
					_id: new ObjectId(clienteId),
				},
				{
					$set: {
						"conecta.conviteDataAceite": conectInvite.dataAceite,
					},
				},
			);

			throw new createHttpError.BadRequest("Convite já aceito.");
		}
		// If not accepted, updating the invite with the new promotor code
		await conectaInvitesCollection.updateOne(
			{
				_id: new ObjectId(clientConectaInviteId),
			},
			{
				$set: {
					"promotor.codigoIndicacao": sessionUser.codigoIndicacaoConecta || "",
					dataExpiracao: dayjs().add(30, "days").toISOString(),
				},
			},
		);
	}

	return res.status(201).json({
		data: {
			inviteId: clientConectaInviteId,
		},
		message: "Convite criado/atualizado com sucesso !",
	});
};

export default apiHandler({
	POST: createConectaInvite,
});
