"use server";
import { redirect } from "next/navigation";
import { createSession, generateSessionToken, setSetSessionCookie } from "./session";
import { LoginSchema, type TLoginInput } from "./validators";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TUser } from "@/utils/schemas/user.schema";
import bcrypt from "bcrypt";

type TLoginResult = {
	formError?: string;
	fieldError?: {
		[key in keyof TLoginInput]?: string;
	};
};

export async function login(_: TLoginResult, input: FormData): Promise<TLoginResult> {
	const data = {
		email: input.get("email") as string,
		password: input.get("password") as string,
	};

	const validationParsed = LoginSchema.safeParse(data);
	if (!validationParsed.success) {
		const err = validationParsed.error.flatten();
		return {
			fieldError: {
				email: err.fieldErrors.email?.[0],
				password: err.fieldErrors.password?.[0],
			},
		};
	}

	const { email, password } = validationParsed.data;

	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");

	const user = await usersCollection.findOne({
		email: email,
	});
	if (!user) {
		return {
			formError: "Usuário ou senha incorretos.",
		};
	}
	const compareResult = bcrypt.compareSync(password, user.senha);
	if (!compareResult) {
		return {
			formError: "Usuário ou senha incorretos.",
		};
	}

	const sessionToken = await generateSessionToken();
	const session = await createSession({
		token: sessionToken,
		userId: user._id.toString(),
	});

	try {
		await setSetSessionCookie({
			token: sessionToken,
			expiresAt: new Date(session.session.dataExpiracao),
		});
	} catch (error) {
		console.log("[ERROR] Error setting session cookie", error);
		return {
			formError: "Erro interno do servidor.",
		};
	}
	return redirect("/");
}
