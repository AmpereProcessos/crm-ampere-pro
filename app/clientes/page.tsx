export const dynamic = "force-dynamic";

import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ClientsPage from "@/components/Clients/ClientsPage";

export default async function Clients() {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	return <ClientsPage session={session} />;
}
