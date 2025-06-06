"use server";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import dayjs from "dayjs";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/configs/app-definitions";
import { cache } from "react";
import createHttpError from "http-errors";

import type { TUser } from "@/utils/schemas/user.schema";
import type { TPartner } from "@/utils/schemas/partner.schema";
import type { TSession } from "@/utils/schemas/session.schema";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { ObjectId } from "mongodb";

export type TUserSession = {
	session: TSession;
	user: {
		id: string;
		administrador: TUser["administrador"];
		telefone: TUser["telefone"];
		email: TUser["email"];
		nome: TUser["nome"];
		avatar_url: TUser["avatar_url"];
		idParceiro: TUser["idParceiro"];
		idGrupo: TUser["idGrupo"];
		permissoes: TUser["permissoes"];
		parceiro: {
			nome: TPartner["nome"];
			logo_url: TPartner["logo_url"];
		};
	};
};

export async function generateSessionToken(): Promise<string> {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

type CreateSessionParams = {
	token: string;
	userId: string;
};
export async function createSession({ token, userId }: CreateSessionParams) {
	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

		const session: TSession = {
			sessaoId: sessionId,
			usuarioId: userId,
			usuarioAgente: null,
			usuarioDispositivo: null,
			usuarioEnderecoIp: null,
			usuarioNavegador: null,
			dataExpiracao: dayjs().add(1, "month").toISOString(),
		};

		const db = await connectToDatabase();
		const authSessionsCollection = db.collection<TSession>("auth-sessions");
		const insertSessionResponse = await authSessionsCollection.insertOne(session);
		if (!insertSessionResponse.acknowledged) throw new Error("Erro ao criar a sessão.");
		return {
			insertedId: insertSessionResponse.insertedId,
			session,
		};
	} catch (error) {
		console.log("Error running createSession", error);
		throw error;
	}
}

export async function validateSession(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const db = await connectToDatabase();
	const authSessionsCollection = db.collection<TSession>("auth-sessions");
	const usersCollection = db.collection<TUser>("users");
	const partnersCollection = db.collection<TPartner>("partners");
	// We gotta find the session and its respective user in the db
	const session = await authSessionsCollection.findOne({
		sessaoId: sessionId,
	});

	if (!session) return { session: null, user: null };

	const user = await usersCollection.findOne({
		_id: new ObjectId(session.usuarioId),
	});

	if (!user) {
		console.log("[ERROR] No user found running --validateSession-- method.");
		// // Deleting the session token cookie
		// await deleteSessionTokenCookie();
		return { session: null, user: null };
	}

	const partner = await partnersCollection.findOne({
		_id: new ObjectId(user.idParceiro),
	});
	if (!partner) {
		console.log("[ERROR] No partner found running --validateSession-- method.");
		// await deleteSessionTokenCookie();
		return { session: null, user: null };
	}
	const authSession: TUserSession = {
		session: {
			sessaoId: session.sessaoId,
			usuarioId: session.usuarioId,
			usuarioDispositivo: session.usuarioDispositivo,
			usuarioNavegador: session.usuarioNavegador,
			dataExpiracao: session.dataExpiracao,
		},
		user: {
			id: user._id.toString(),
			nome: user.nome,
			telefone: user.telefone,
			avatar_url: user.avatar_url,
			email: user.email,
			administrador: user.administrador,
			idParceiro: user.idParceiro,
			idGrupo: user.idGrupo,
			permissoes: user.permissoes,
			parceiro: {
				nome: partner.nome,
				logo_url: partner.logo_url,
			},
		},
	};
	// Checking if the session is expired
	if (Date.now() > new Date(session.dataExpiracao).getTime()) {
		console.log("Session expired running --validateSession--");
		// If so, deleting the session
		await authSessionsCollection.deleteOne({
			sessaoId: session.sessaoId,
		});

		// // Deleting the session token cookie
		// await deleteSessionTokenCookie();
		return { session: null, user: null };
	}
	// Checking if session expires in less 15 days
	if (dayjs().add(15, "days").isAfter(dayjs(session.dataExpiracao))) {
		// If so, extending the session to a month from now
		await authSessionsCollection.updateOne({ sessaoId: session.sessaoId }, { $set: { dataExpiracao: dayjs().add(1, "month").toISOString() } });
	}

	return authSession;
}

export const getCurrentSession = cache(async () => {
	try {
		const cookieStore = await cookies();

		const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
		console.log("Token get from --getCurrentSession--", token);
		if (token === null) return { session: null, user: null };

		const sessionResult = await validateSession(token);
		return sessionResult;
	} catch (error) {
		console.log("Error accessing cookies in getCurrentSession:", error);
		return { session: null, user: null };
	}
});

export const getCurrentSessionUncached = async () => {
	try {
		const cookieStore = await cookies();

		const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
		if (token === null) return { session: null, user: null };

		const sessionResult = await validateSession(token);
		return sessionResult;
	} catch (error) {
		console.log("Error accessing cookies in getCurrentSessionUncached:", error);
		return { session: null, user: null };
	}
};

export const getValidCurrentSessionUncached = async () => {
	try {
		const cookieStore = await cookies();

		const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
		if (token === null) throw new createHttpError.Unauthorized("Você não está autenticado.");

		const sessionResult = await validateSession(token);

		if (!sessionResult.session || !sessionResult.user) throw new createHttpError.Unauthorized("Você não está autenticado.");

		return sessionResult;
	} catch (error) {
		console.log("Error accessing cookies in getValidCurrentSessionUncached:", error);
		throw new createHttpError.Unauthorized("Você não está autenticado.");
	}
};

type SetSessionCookieParams = {
	token: string;
	expiresAt: Date;
};
export async function setSetSessionCookie({ token, expiresAt }: SetSessionCookieParams) {
	try {
		const cookiesStore = await cookies();
		cookiesStore.set(SESSION_COOKIE_NAME, token, {
			httpOnly: true,
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: new Date(expiresAt),
		});
	} catch (error) {
		console.log("ERROR SETTING THE COOKIE", error);
		throw error;
	}
}

export async function deleteSession(sessionId: string) {
	const db = await connectToDatabase();
	const authSessionsCollection = db.collection<TSession>("auth-sessions");
	return await authSessionsCollection.deleteOne({ sessaoId: sessionId });
}

export async function deleteSessionTokenCookie() {
	const cookiesStore = await cookies();

	cookiesStore.set(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	return;
}
