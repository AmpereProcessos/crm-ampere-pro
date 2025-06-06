"use server";
import { redirect } from "next/navigation";
import { createSession, generateSessionToken } from "./session";
import { LoginSchema, type TLoginInput } from "./validators";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TUser } from "@/utils/schemas/user.schema";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/configs/app-definitions";

export async function login(formData: FormData): Promise<void> {
	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const validationParsed = LoginSchema.safeParse(data);
	if (!validationParsed.success) {
		const err = validationParsed.error.flatten();
		const errorMessage = err.fieldErrors.email?.[0] || "Dados inválidos.";
		return redirect(`/auth/signin?error=${encodeURIComponent(errorMessage)}`);
	}

	const { email, password } = data;

	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");

	const user = await usersCollection.findOne({
		email: email,
	});
	if (!user) {
		return redirect(`/auth/signin?error=${encodeURIComponent("Usuário ou senha incorretos.")}`);
	}
	const compareResult = bcrypt.compareSync(password, user.senha);
	if (!compareResult) {
		return redirect(`/auth/signin?error=${encodeURIComponent("Usuário ou senha incorretos.")}`);
	}

	// All validations passes, handling the session definition
	const sessionToken = await generateSessionToken();
	const session = await createSession({
		token: sessionToken,
		userId: user._id.toString(),
	});

	try {
		const cookiesStore = await cookies();
		cookiesStore.set(SESSION_COOKIE_NAME, sessionToken, {
			httpOnly: true,
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: new Date(session.session.dataExpiracao),
		});
	} catch (error) {
		console.log("[ERROR] Error setting session cookie", error);
		return redirect(`/auth/signin?error=${encodeURIComponent("Erro interno do servidor.")}`);
	}
	return redirect("/");
}
