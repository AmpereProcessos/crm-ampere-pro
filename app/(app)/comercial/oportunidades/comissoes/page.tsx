export const dynamic = "force-dynamic";

import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ComissionsPage from "./comissions-page";

export default async function Comissions() {
	const session = await getCurrentSession();
	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <ComissionsPage session={session} />;
}
