import createHttpError from "http-errors";

import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import type { Method } from "axios";
import { ZodError } from "zod";

import type { TUser } from "./schemas/user.schema";

import type { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { SESSION_COOKIE_NAME } from "@/configs/app-definitions";
import { ObjectId } from "mongodb";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TSession } from "./schemas/session.schema";
import type { TPartner } from "./schemas/partner.schema";
import type { TUserSession } from "@/lib/auth/session";
import dayjs from "dayjs";

export type UnwrapNextResponse<T> = T extends NextResponse<infer U> ? U : never;
export interface ErrorResponse {
	error: {
		message: string;
		err?: any;
	};
	status?: number;
}
type ApiMethodHandlers = {
	[key in Uppercase<Method>]?: NextApiHandler;
};

async function validateSession(token: string) {
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
const getCurrentSession = cache(async (req: NextApiRequest) => {
	try {
		const cookieStore = req.cookies;

		const token = cookieStore[SESSION_COOKIE_NAME] ?? null;
		console.log("Token get from --getCurrentSession--", token);
		if (token === null) return { session: null, user: null };

		const sessionResult = await validateSession(token);
		return sessionResult;
	} catch (error) {
		console.log("Error accessing cookies in getCurrentSession:", error);
		return { session: null, user: null };
	}
});
const getUncachedCurrentSession = async (req: NextApiRequest) => {
	try {
		const cookieStore = req.cookies;

		const token = cookieStore[SESSION_COOKIE_NAME] ?? null;
		console.log("Token get from --getCurrentSession--", token);
		if (token === null) return { session: null, user: null };

		const sessionResult = await validateSession(token);
		return sessionResult;
	} catch (error) {
		console.log("Error accessing cookies in getCurrentSession:", error);
		return { session: null, user: null };
	}
};
// Validação de sessão para rotas autenticadas
export async function validateAuthentication(req: NextApiRequest | NextRequest, res: NextApiResponse | typeof NextResponse) {
	const session = await getCurrentSession(req as NextApiRequest);
	if (!session.user || !session.session) throw new createHttpError.Unauthorized("Rota não acessível a usuários não autenticados.");
	return session;
}
export async function validateAuthenticationWithSession(req: NextApiRequest, res: NextApiResponse) {
	const session = await getCurrentSession(req as NextApiRequest);
	if (!session.user || !session.session) throw new createHttpError.Unauthorized("Recurso não acessível a usuários não autenticados.");
	return session;
}
// Validação de niveis de autorização para rotas
export async function validateAuthorization<T extends keyof TUser["permissoes"], K extends keyof TUser["permissoes"][T]>(
	req: NextApiRequest,
	res: NextApiResponse,
	field: T,
	permission: K,
	validate: any,
) {
	const session = await getCurrentSession(req as NextApiRequest);

	if (!session.user || !session.session) {
		throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	}

	if (session.user.permissoes[field][permission] === validate) return session;
	throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
}

export async function validateAdminAuthorizaton(req: NextApiRequest, res: NextApiResponse) {
	const session = await getCurrentSession(req as NextApiRequest);
	if (!session.user || !session.session) throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	const idAdmin = !!session.user.administrador;
	if (!idAdmin) throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	return session;
}
// Criando o handler de erros
export function errorHandler(err: unknown, res: NextApiResponse<ErrorResponse>) {
	console.log("ERROR", err);
	if (createHttpError.isHttpError(err) && err.expose) {
		// Lidar com os erros lançados pelo módulo http-errors
		return res.status(err.statusCode).json({ error: { message: err.message } });
	}
	if (err instanceof ZodError) {
		// Lidar com erros vindo de uma validação Zod
		return res.status(400).json({ error: { message: err.errors[0].message } });
	}
	// Erro de servidor padrão 500
	return res.status(500).json({
		error: { message: "Oops, algo deu errado!", err: err },
		status: createHttpError.isHttpError(err) ? err.statusCode : 500,
	});
}

export function apiHandler(handler: ApiMethodHandlers) {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		try {
			const method = req.method ? (req.method.toUpperCase() as keyof ApiMethodHandlers) : undefined;

			// validando se o handler suporta o metodo HTTP requisitado
			if (!method) throw new createHttpError.MethodNotAllowed(`Método não especificado no caminho: ${req.url}`);

			const methodHandler = handler[method];
			if (!methodHandler) throw new createHttpError.MethodNotAllowed(`O método ${req.method} não permitido para o caminho ${req.url}`);

			// Se passou pelas validações, chamar o handler
			await methodHandler(req, res);
		} catch (error) {
			errorHandler(error, res);
		}
	};
}
