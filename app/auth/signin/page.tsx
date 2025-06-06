import { redirect } from "next/navigation";
import React from "react";
import Login from "./login-page";
import { getCurrentSession } from "@/lib/auth/session";

type LoginPageProps = {
	searchParams?: Promise<{
		error?: string;
	}>;
};

async function LoginPage({ searchParams }: LoginPageProps) {
	const { session, user } = await getCurrentSession();
	if (session || user) return redirect("/");
	const awaitedSearchParams = await searchParams;
	return <Login searchParams={awaitedSearchParams} />;
}

export default LoginPage;
