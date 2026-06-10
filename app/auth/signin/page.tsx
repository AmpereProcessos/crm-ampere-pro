export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Login from "./login-page";
import { getCurrentSession } from "@/lib/auth/session";

async function LoginPage() {
	const { session, user } = await getCurrentSession();
	if (session || user) return redirect("/");
	return <Login />;
}

export default LoginPage;
